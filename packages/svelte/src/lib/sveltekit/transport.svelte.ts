/**
 * SSR bridge — rivetLoad() + transport encode/decode.
 *
 * On the server, rivetLoad fetches via a stateless RivetKit action call.
 * On the client, transport.decode upgrades it to a live actor subscription.
 * On client-side navigation, rivetLoad creates a live subscription directly.
 */

import type { AnyActorRegistry } from "@rivetkit/framework-base"
import type { Client } from "rivetkit/client"

const IS_BROWSER = typeof globalThis.document !== "undefined"

// ============================================================================
// RivetQueryResult — the reactive return type
// ============================================================================

/** Reactive query result returned by rivetLoad (after decode) and on client nav. */
export interface RivetQueryResult<T = unknown> {
	readonly data: T | undefined
	readonly isLoading: boolean
	readonly error: Error | undefined
	readonly isConnected: boolean
}

// ============================================================================
// RivetLoadOptions — what the user passes to rivetLoad
// ============================================================================

export interface RivetLoadOptions<T = unknown> {
	/** Actor name from the registry (e.g. 'counter'). */
	actor: string
	/** Unique key for the actor instance. */
	key: string | string[]
	/** Action name to call for the initial value. */
	action: string
	/** Arguments to pass to the action. */
	args?: unknown[]
	/** Event name(s) to subscribe to for live updates. */
	event: string | string[]
	/** Optional connection params (e.g. auth tokens). */
	params?: Record<string, string>
	/** Optional region to create the actor in. */
	createInRegion?: string
	/** Optional input data for actor creation. */
	createWithInput?: unknown
	/** Transform incoming event data into the new value. Default: full replacement. */
	transform?: (current: T, incoming: unknown) => T
}

// ============================================================================
// RivetLoadResult — the serializable container
// ============================================================================

/** Marker class for transport.encode to recognize. */
export class RivetLoadResult<T = unknown> {
	readonly __rivetLoad = true;

	constructor(
		public readonly actorName: string,
		public readonly key: string | string[],
		public readonly action: string,
		public readonly args: unknown[],
		public readonly event: string | string[],
		public readonly data: T,
		public readonly params?: Record<string, string>,
		public readonly createInRegion?: string,
		public readonly createWithInput?: unknown,
	) { }
}

// ============================================================================
// Serialized shape crossing the SSR boundary
// ============================================================================

interface RivetLoadEncoded {
	actorName: string
	key: string | string[]
	action: string
	args: unknown[]
	event: string | string[]
	data: unknown
	params?: Record<string, string>
	createInRegion?: string
	createWithInput?: unknown
}

// ============================================================================
// rivetLoad — for load functions
// ============================================================================

/**
 * Fetch actor data for use in SvelteKit load functions.
 *
 * - **Server (SSR):** calls the action via stateless HTTP, wraps the result in
 *   a RivetLoadResult. transport.decode upgrades it to a live subscription on
 *   the client.
 * - **Client (navigation):** calls the action for initial data, then immediately
 *   creates a live subscription via createDetachedActorQuery().
 *
 * ```ts
 * // +page.ts
 * export const load = async () => ({
 *   count: await rivetLoad(rivetClient, {
 *     actor: 'counter',
 *     key: ['test-counter'],
 *     action: 'getCount',
 *     event: 'newCount',
 *   })
 * })
 * ```
 */
export async function rivetLoad<Registry extends AnyActorRegistry, T = unknown>(
	client: Client<Registry>,
	opts: RivetLoadOptions<T>,
): Promise<RivetQueryResult<T>> {
	const {
		actor: actorName,
		key,
		action,
		args = [],
		event,
		params,
		createInRegion,
		createWithInput,
	} = opts

	const normalizedKey = Array.isArray(key) ? key : [key]

	// Get a stateless handle via ClientRaw.getOrCreate (dynamic name access)
	const handle = client.getOrCreate(actorName, normalizedKey, {
		params,
		createInRegion,
		createWithInput,
	})

	// Call the action by name via ActorHandleRaw.action
	const data = await handle.action<unknown[], T>({
		name: action,
		args,
	})

	if (IS_BROWSER) {
		// Client-side navigation: create live subscription immediately
		return createDetachedActorQuery<Registry, T>(client, opts, data)
	}

	// Server-side: wrap in RivetLoadResult for transport serialization
	return new RivetLoadResult<T>(
		actorName,
		key,
		action,
		args,
		event,
		data,
		params,
		createInRegion,
		createWithInput,
	) as unknown as RivetQueryResult<T>
}

// ============================================================================
// Transport encode/decode — for hooks.ts
// ============================================================================

/**
 * Encode a RivetLoadResult for serialization across the SSR boundary.
 * Uses duck-type check (`__rivetLoad`) instead of `instanceof` because
 * Vite HMR can create separate class identities for the same module.
 */
export function encodeRivetLoad(value: unknown): false | RivetLoadEncoded {
	if (
		value instanceof RivetLoadResult ||
		(value != null && typeof value === "object" && "__rivetLoad" in value)
	) {
		const v = value as RivetLoadResult
		return {
			actorName: v.actorName,
			key: v.key,
			action: v.action,
			args: v.args,
			event: v.event,
			data: v.data,
			params: v.params,
			createInRegion: v.createInRegion,
			createWithInput: v.createWithInput,
		}
	}
	return false
}

/**
 * Decode a serialized RivetLoadResult into a live actor subscription.
 * Uses createDetachedActorQuery — works outside component context.
 */
export function decodeRivetLoad<Registry extends AnyActorRegistry>(
	encoded: RivetLoadEncoded,
	client: Client<Registry>,
	transform?: (current: unknown, incoming: unknown) => unknown,
): RivetQueryResult<unknown> {
	return createDetachedActorQuery<Registry>(
		client,
		{
			actor: encoded.actorName,
			key: encoded.key,
			action: encoded.action,
			args: encoded.args,
			event: encoded.event,
			params: encoded.params,
			createInRegion: encoded.createInRegion,
			createWithInput: encoded.createWithInput,
			transform,
		},
		encoded.data,
	)
}

// ============================================================================
// createDetachedActorQuery — live subscription outside component context
// ============================================================================

/**
 * Create a live actor subscription outside of Svelte component context.
 * Used by transport.decode (SSR hydration) and rivetLoad (client navigation).
 *
 * Uses raw $state signals — no $effect needed for lifecycle.
 * Connects to the actor, subscribes to event(s), and keeps data reactive.
 */
function createDetachedActorQuery<
	Registry extends AnyActorRegistry,
	T = unknown,
>(
	client: Client<Registry>,
	opts: RivetLoadOptions<T>,
	initialData: T,
): RivetQueryResult<T> {
	const {
		actor: actorName,
		key,
		event,
		params,
		createInRegion,
		createWithInput,
		transform = (_current: T, incoming: unknown) => incoming as T,
	} = opts

	let data: T | undefined = $state(initialData)
	let isLoading: boolean = $state(false)
	let error: Error | undefined = $state(undefined)
	let isConnected: boolean = $state(false)

	const normalizedKey = Array.isArray(key) ? key : [key]

	// Get a handle via ClientRaw.getOrCreate (dynamic name access)
	const handle = client.getOrCreate(actorName, normalizedKey, {
		params,
		createInRegion,
		createWithInput,
	})

	// Connect for event subscriptions
	const conn = handle.connect()

	// Track connection status
	conn.onOpen(() => {
		isConnected = true
	})
	conn.onClose(() => {
		isConnected = false
	})
	conn.onError((err) => {
		error = err instanceof Error ? err : new Error(String(err))
	})

	// Subscribe to event(s) for live updates
	const events = Array.isArray(event) ? event : [event]
	for (const evt of events) {
		conn.on(evt, (...args: unknown[]) => {
			const incoming = args.length === 1 ? args[0] : args
			data = transform(data as T, incoming)
			isLoading = false
			error = undefined
		})
	}

	return {
		get data() {
			return data
		},
		get isLoading() {
			return isLoading
		},
		get error() {
			return error
		},
		get isConnected() {
			return isConnected
		},
	}
}
