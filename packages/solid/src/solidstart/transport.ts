/**
 * SSR bridge — useRivetQuery() for SolidStart.
 *
 * On the server, useRivetQuery uses createResource to fetch data via a stateless
 * RivetKit action call. SolidStart serializes the resource automatically.
 * On the client, it upgrades to a live actor subscription via WebSocket.
 *
 * This module uses SolidJS context via RivetProvider — all signals are created
 * within the component ownership tree, ensuring proper disposal and cleanup.
 */

import type { AnyActorRegistry } from "@rivetkit/framework-base"
import type { Client } from "rivetkit/client"
import {
	type Accessor,
	createEffect,
	createResource,
	createSignal,
	onCleanup,
} from "solid-js"
import { useRivet } from "../solid/context"

const IS_BROWSER = typeof globalThis.document !== "undefined"

// ============================================================================
// RivetQueryResult — the reactive return type
// ============================================================================

/** Reactive query result returned by useRivetQuery. */
export interface RivetQueryResult<T = unknown> {
	/** The current value. On SSR this is the server-fetched value; on client it upgrades to live. */
	readonly data: Accessor<T | undefined>
	/** Whether the initial data is being loaded. */
	readonly isLoading: Accessor<boolean>
	/** Any error from the action call or connection. */
	readonly error: Accessor<Error | undefined>
	/** Whether the live WebSocket connection is active (always false on server). */
	readonly isConnected: Accessor<boolean>
	/** Manually refetch the action value. */
	readonly refetch: () => void
}

// ============================================================================
// RivetQueryOptions — what the user passes to useRivetQuery
// ============================================================================

export interface RivetQueryOptions<T = unknown> {
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
// useRivetQuery — the primary SSR + live hook
// ============================================================================

/**
 * Fetch actor data with SSR support and automatic live upgrade.
 *
 * Uses SolidJS `createResource` for SSR serialization, then upgrades to a
 * live WebSocket subscription on the client. Must be called inside a
 * component wrapped in `<RivetProvider>`.
 *
 * ```tsx
 * function SSRPage() {
 *   const count = useRivetQuery<number>({
 *     actor: "counter",
 *     key: ["test-counter"],
 *     action: "getCount",
 *     event: "newCount",
 *   });
 *
 *   return <h1>Counter: {count.data()}</h1>;
 * }
 * ```
 */
export function useRivetQuery<T = unknown>(
	opts: RivetQueryOptions<T>,
): RivetQueryResult<T> {
	const { client } = useRivet()
	return createRivetQuery<T>(client, opts)
}

/**
 * Fetch actor data with SSR support using an explicit client reference.
 *
 * Same as `useRivetQuery` but doesn't require `<RivetProvider>` — you pass
 * the client directly. Useful when the client is available but you
 * haven't set up a provider.
 *
 * Must still be called inside a component (for signal ownership).
 */
export function createRivetQuery<T = unknown>(
	client: Client<any>,
	opts: RivetQueryOptions<T>,
): RivetQueryResult<T> {
	const {
		actor: actorName,
		key,
		action,
		args = [],
		params,
		createInRegion,
		createWithInput,
		event,
		transform = (_current: T, incoming: unknown) => incoming as T,
	} = opts

	const normalizedKey = Array.isArray(key) ? key : [key]

	// -- createResource handles SSR serialization automatically --
	const [resource, { refetch }] = createResource<T>(async () => {
		const handle = client.getOrCreate(actorName, normalizedKey, {
			params,
			createInRegion,
			createWithInput,
		})
		return handle.action<unknown[], T>({ name: action, args })
	})

	// -- Live data signal: starts with resource value, upgraded by events --
	const [liveData, setLiveData] = createSignal<T | undefined>(undefined)
	const [isConnected, setIsConnected] = createSignal(false)
	const [liveError, setLiveError] = createSignal<Error | undefined>(undefined)

	// -- On the client, upgrade to live WebSocket subscription --
	if (IS_BROWSER) {
		createEffect(() => {
			// Wait for resource to resolve before subscribing
			const initialValue = resource()
			if (initialValue === undefined) return

			// Seed live data with the fetched value
			setLiveData(() => initialValue)

			const handle = client.getOrCreate(actorName, normalizedKey, {
				params,
				createInRegion,
				createWithInput,
			})

			const conn = handle.connect()

			conn.onOpen(() => setIsConnected(true))
			conn.onClose(() => setIsConnected(false))
			conn.onError((err: unknown) => {
				setLiveError(err instanceof Error ? err : new Error(String(err)))
			})

			const events = Array.isArray(event) ? event : [event]
			const unsubs: Array<() => void> = []
			for (const evt of events) {
				const unsub = conn.on(evt, (...eventArgs: unknown[]) => {
					const incoming = eventArgs.length === 1 ? eventArgs[0] : eventArgs
					setLiveData((prev) =>
						transform((prev ?? initialValue) as T, incoming),
					)
					setLiveError(undefined)
				})
				unsubs.push(unsub)
			}

			onCleanup(() => {
				for (const unsub of unsubs) unsub()
				conn.disconnect()
				setIsConnected(false)
			})
		})
	}

	// -- Compose the result: prefer live data once available --
	const data: Accessor<T | undefined> = () => {
		const live = liveData()
		if (live !== undefined) return live
		return resource()
	}

	const isLoading: Accessor<boolean> = () => resource.loading

	const error: Accessor<Error | undefined> = () => {
		const le = liveError()
		if (le) return le
		const re = resource.error
		return re instanceof Error ? re : re ? new Error(String(re)) : undefined
	}

	return { data, isLoading, error, isConnected, refetch }
}

// ============================================================================
// Legacy API — kept for backward compatibility
// ============================================================================

/** @deprecated Use `RivetQueryOptions` instead. */
export type RivetLoadOptions<T = unknown> = RivetQueryOptions<T>

/** @deprecated Use `useRivetQuery` or `createRivetQuery` instead. */
export async function rivetLoad<
	T = unknown,
	Registry extends AnyActorRegistry = AnyActorRegistry,
>(
	client: Client<Registry>,
	opts: RivetQueryOptions<T>,
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
		transform = (_current: T, incoming: unknown) => incoming as T,
	} = opts

	const normalizedKey = Array.isArray(key) ? key : [key]

	const handle = client.getOrCreate(actorName, normalizedKey, {
		params,
		createInRegion,
		createWithInput,
	})

	const initialData = await handle.action<unknown[], T>({
		name: action,
		args,
	})

	if (IS_BROWSER) {
		return createLegacyLiveQuery<T>(client, opts, initialData, transform)
	}

	return createStaticResult<T>(initialData)
}

function createStaticResult<T>(initialData: T): RivetQueryResult<T> {
	const [data] = createSignal<T | undefined>(initialData)
	const [isLoading] = createSignal(false)
	const [error] = createSignal<Error | undefined>(undefined)
	const [isConnected] = createSignal(false)
	return { data, isLoading, error, isConnected, refetch: () => { } }
}

function createLegacyLiveQuery<T>(
	client: Client<any>,
	opts: RivetQueryOptions<T>,
	initialData: T,
	transform: (current: T, incoming: unknown) => T,
): RivetQueryResult<T> {
	const {
		actor: actorName,
		key,
		event,
		params,
		createInRegion,
		createWithInput,
	} = opts

	const [data, setData] = createSignal<T | undefined>(initialData)
	const [isLoading] = createSignal(false)
	const [error, setError] = createSignal<Error | undefined>(undefined)
	const [isConnected, setIsConnected] = createSignal(false)

	const normalizedKey = Array.isArray(key) ? key : [key]

	const handle = client.getOrCreate(actorName, normalizedKey, {
		params,
		createInRegion,
		createWithInput,
	})

	const conn = handle.connect()

	conn.onOpen(() => setIsConnected(true))
	conn.onClose(() => setIsConnected(false))
	conn.onError((err: unknown) => {
		setError(err instanceof Error ? err : new Error(String(err)))
	})

	const events = Array.isArray(event) ? event : [event]
	for (const evt of events) {
		conn.on(evt, (...args: unknown[]) => {
			const incoming = args.length === 1 ? args[0] : args
			setData(() => transform(data() as T, incoming))
			setError(undefined)
		})
	}

	return { data, isLoading, error, isConnected, refetch: () => { } }
}

/** @deprecated No longer needed with the Provider-based approach. */
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

/** @deprecated No longer needed with the Provider-based approach. */
export function encodeRivetLoad(
	value: unknown,
): false | Record<string, unknown> {
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

/** @deprecated No longer needed with the Provider-based approach. */
export function decodeRivetLoad<Registry extends AnyActorRegistry>(
	encoded: Record<string, any>,
	client: Client<Registry>,
	transform?: (current: unknown, incoming: unknown) => unknown,
): RivetQueryResult<unknown> {
	return createLegacyLiveQuery(
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
		transform ?? ((_c: unknown, incoming: unknown) => incoming),
	)
}
