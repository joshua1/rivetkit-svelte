/**
 * SSR bridge — rivetLoad() for SolidStart.
 *
 * On the server, rivetLoad fetches via a stateless RivetKit action call.
 * On the client, it upgrades to a live actor subscription via WebSocket.
 * On client-side navigation, rivetLoad creates a live subscription directly.
 */

import type { AnyActorRegistry } from "@rivetkit/framework-base"
import type { Client } from "rivetkit/client"
import { type Accessor, createSignal } from "solid-js"

const IS_BROWSER = typeof globalThis.document !== "undefined"

// ============================================================================
// RivetQueryResult — the reactive return type
// ============================================================================

/** Reactive query result returned by rivetLoad. */
export interface RivetQueryResult<T = unknown> {
	readonly data: Accessor<T | undefined>
	readonly isLoading: Accessor<boolean>
	readonly error: Accessor<Error | undefined>
	readonly isConnected: Accessor<boolean>
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
// RivetLoadResult — the serializable container for SSR
// ============================================================================

/** Marker class for serialization recognition. */
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
// rivetLoad — for server data loading
// ============================================================================

/**
 * Fetch actor data for use in SolidStart route data functions.
 *
 * - **Server (SSR):** calls the action via stateless HTTP, wraps the result in
 *   a RivetLoadResult for serialization.
 * - **Client (navigation):** calls the action for initial data, then immediately
 *   creates a live subscription via createDetachedActorQuery().
 *
 * ```ts
 * // routes/ssr.tsx
 * import { rivetLoad } from "@blujosi/rivetkit-solid/solidstart";
 *
 * export const route = {
 *   preload: () => ({
 *     count: rivetLoad(rivetClient, {
 *       actor: 'counter',
 *       key: ['test-counter'],
 *       action: 'getCount',
 *       event: 'newCount',
 *     })
 *   })
 * };
 * ```
 */
export async function rivetLoad<T = unknown, Registry extends AnyActorRegistry = AnyActorRegistry>(
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

	const handle = client.getOrCreate(actorName, normalizedKey, {
		params,
		createInRegion,
		createWithInput,
	})

	const data = await handle.action<unknown[], T>({
		name: action,
		args,
	})

	if (IS_BROWSER) {
		return createDetachedActorQuery<Registry, T>(client, opts, data)
	}

	// Server-side: return static result that will be upgraded on the client
	return createStaticResult<T>(data)
}

/**
 * Encode a RivetLoadResult for serialization across SSR boundary.
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
// createStaticResult — SSR static data (no live updates until hydrated)
// ============================================================================

function createStaticResult<T>(initialData: T): RivetQueryResult<T> {
	const [data] = createSignal<T | undefined>(initialData)
	const [isLoading] = createSignal(false)
	const [error] = createSignal<Error | undefined>(undefined)
	const [isConnected] = createSignal(false)

	return { data, isLoading, error, isConnected }
}

// ============================================================================
// createDetachedActorQuery — live subscription outside component context
// ============================================================================

/**
 * Create a live actor subscription.
 * Used by rivetLoad on the client side and decodeRivetLoad for SSR hydration.
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

	const [data, setData] = createSignal<T | undefined>(initialData)
	const [isLoading, setIsLoading] = createSignal(false)
	const [error, setError] = createSignal<Error | undefined>(undefined)
	const [isConnected, setIsConnected] = createSignal(false)

	const normalizedKey = Array.isArray(key) ? key : [key]

	const handle = client.getOrCreate(actorName, normalizedKey, {
		params,
		createInRegion,
		createWithInput,
	})

	const conn = handle.connect()

	conn.onOpen(() => {
		setIsConnected(true)
	})
	conn.onClose(() => {
		setIsConnected(false)
	})
	conn.onError((err) => {
		setError(err instanceof Error ? err : new Error(String(err)))
	})

	const events = Array.isArray(event) ? event : [event]
	for (const evt of events) {
		conn.on(evt, (...args: unknown[]) => {
			const incoming = args.length === 1 ? args[0] : args
			setData(() => transform(data() as T, incoming))
			setIsLoading(false)
			setError(undefined)
		})
	}

	return { data, isLoading, error, isConnected }
}
