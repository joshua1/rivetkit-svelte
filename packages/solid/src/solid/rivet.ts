import {
	type ActorOptions,
	type AnyActorRegistry,
	type CreateRivetKitOptions,
	createRivetKit as createVanillaRivetKit,
} from "@rivetkit/framework-base"
import type {
	ActorConn,
	ActorHandle,
	AnyActorDefinition,
	Client,
	ExtractActorsFromRegistry,
} from "rivetkit/client"
import {
	type Accessor,
	createEffect,
	createRoot,
	createSignal,
	onCleanup,
} from "solid-js"
import { useRivet } from "./context"

export interface ActorStateReference<AD extends AnyActorDefinition> {
	hash: string
	handle: ActorHandle<AD> | null
	connection: ActorConn<AD> | null
	isConnected?: boolean
	isConnecting?: boolean
	isError?: boolean
	error: Error | null
	opts: {
		name: keyof AD
		key: string | string[]
		params?: Record<string, string>
		createInRegion?: string
		createWithInput?: unknown
		enabled?: boolean
	}
}

import { createClient } from "rivetkit/client"

export { createClient } from "rivetkit/client"

export function createRivetKit<Registry extends AnyActorRegistry>(
	clientInput: Parameters<typeof createClient>[0] = undefined,
	opts: CreateRivetKitOptions<Registry> = {},
) {
	return createRivetKitWithClient<Registry>(
		createClient<Registry>(clientInput),
		opts,
	)
}

export function createRivetKitWithClient<Registry extends AnyActorRegistry>(
	client: Client<Registry>,
	opts: CreateRivetKitOptions<Registry> = {},
) {
	const { getOrCreateActor } = createVanillaRivetKit<
		Registry
	>(client, opts)

	/**
	 * SolidJS signal-based function to connect to an actor and retrieve its state.
	 * Uses fine-grained reactivity via createSignal/createEffect.
	 */
	function useActor<
		ActorName extends keyof ExtractActorsFromRegistry<Registry> & string,
	>(opts: ActorOptions<Registry, ActorName>) {
		const { mount, state } = getOrCreateActor<ActorName>(opts)

		// Mount the actor connection
		createRoot(() => {
			mount()
		})

		const [actorState, setActorState] = createSignal<any | undefined>(
			undefined,
		)
		const unsubscribe = state?.subscribe((res) => {
			setActorState(res.currentVal)
		})

		onCleanup(() => unsubscribe?.())

		function useEvent(eventName: string, handler: (...args: any[]) => void) {
			let currentHandler = handler

			createEffect(() => {
				currentHandler = handler
			})

			createEffect(() => {
				const s = actorState()
				if (!s?.connection) return

				function eventHandler(...args: any[]) {
					currentHandler(...args)
				}

				const unsub = s.connection?.on(eventName, eventHandler)
				onCleanup(() => unsub?.())
			})
		}

		const current = {
			connect() {
				actorState()?.connection?.connect()
			},
			get connection() {
				return actorState()?.connection
			},
			get handle() {
				return actorState()?.handle
			},
			get isConnected() {
				return actorState()?.connStatus === "connected"
			},
			get isConnecting() {
				return actorState()?.connStatus === "connecting"
			},
			get isError() {
				return !!actorState()?.error
			},
			get error() {
				return actorState()?.error
			},
			get opts() {
				return actorState()?.opts
			},
			get hash() {
				return actorState()?.hash
			},
		}

		/**
		 * Creates a reactive query that fetches an initial value by calling an actor action,
		 * then subscribes to an event to keep the value updated in real-time.
		 */
		function useQuery<T>(queryOpts: {
			action: string
			args?: any[]
			event: string
			initialValue: T
			transform?: (current: T, incoming: any) => T
		}) {
			const [value, setValue] = createSignal<T>(queryOpts.initialValue)
			const [isLoading, setIsLoading] = createSignal(true)
			const [error, setError] = createSignal<Error | null>(null)

			const transform =
				queryOpts.transform ??
				((current: T, incoming: any): T => {
					if (
						current !== null &&
						incoming !== null &&
						typeof current === "object" &&
						typeof incoming === "object" &&
						!Array.isArray(current) &&
						!Array.isArray(incoming)
					) {
						return { ...current, ...incoming } as T
					}
					return incoming as T
				})

			// Subscribe to the event for real-time updates
			useEvent(queryOpts.event, (...args: any[]) => {
				const incoming = args.length === 1 ? args[0] : args
				setValue(() => transform(value(), incoming))
				setIsLoading(false)
				setError(null)
			})

			// Fetch the initial value once connected
			createEffect(() => {
				const conn = actorState()?.connection
				if (!conn) return

				const action = (conn as any)[queryOpts.action]
				if (typeof action !== "function") {
					setError(
						new Error(
							`Action '${queryOpts.action}' not found on actor connection`,
						),
					)
					setIsLoading(false)
					return
				}

				const callArgs = queryOpts.args ?? []
				Promise.resolve(action.call(conn, ...callArgs))
					.then((result: T) => {
						setValue(() => result)
						setIsLoading(false)
					})
					.catch((err: unknown) => {
						setError(err instanceof Error ? err : new Error(String(err)))
						setIsLoading(false)
					})
			})

			return {
				get value(): T {
					return value()
				},
				get isLoading(): boolean {
					return isLoading()
				},
				get error(): Error | null {
					return error()
				},
			}
		}

		/**
		 * Creates a reactive query that fetches a value by calling an actor action,
		 * then re-fetches whenever a specified event fires or the args change.
		 * Unlike useQuery, this does NOT use event data — the event is purely
		 * an invalidation signal that triggers a fresh action call.
		 */
		function useActionQuery<T>(queryOpts: {
			action: string
			args?: Accessor<any[]>
			event: string | string[]
			initialValue: T
		}) {
			const [value, setValue] = createSignal<T>(queryOpts.initialValue)
			const [isLoading, setIsLoading] = createSignal(true)
			const [error, setError] = createSignal<Error | null>(null)
			const [fetchVersion, setFetchVersion] = createSignal(0)

			function callAction() {
				const conn = actorState()?.connection
				if (!conn) return

				const action = (conn as any)[queryOpts.action]
				if (typeof action !== "function") {
					setError(
						new Error(
							`Action '${queryOpts.action}' not found on actor connection`,
						),
					)
					setIsLoading(false)
					return
				}

				const callArgs = queryOpts.args?.() ?? []
				setIsLoading(true)
				Promise.resolve(action.call(conn, ...callArgs))
					.then((result: T) => {
						setValue(() => result)
						setIsLoading(false)
						setError(null)
					})
					.catch((err: unknown) => {
						setError(err instanceof Error ? err : new Error(String(err)))
						setIsLoading(false)
					})
			}

			// Subscribe to event(s) as invalidation signals
			const events = Array.isArray(queryOpts.event)
				? queryOpts.event
				: [queryOpts.event]
			for (const evt of events) {
				useEvent(evt, () => {
					setFetchVersion((v) => v + 1)
				})
			}

			// Reactive effect: re-fetches when connection is ready, args change, or event fires
			createEffect(() => {
				const _conn = actorState()?.connection
				const _args = queryOpts.args?.()
				const _version = fetchVersion()

				if (!_conn) return

				// Use void to suppress unused-variable warnings while keeping deps tracked
				void _args
				void _version

				callAction()
			})

			return {
				get value(): T {
					return value()
				},
				get isLoading(): boolean {
					return isLoading()
				},
				get error(): Error | null {
					return error()
				},
				refetch: callAction,
			}
		}

		return {
			current,
			useEvent,
			useQuery,
			useActionQuery,
		}
	}

	return {
		useActor,
	}
}

// ============================================================================
// Context-aware useActor — uses client from RivetProvider
// ============================================================================

/**
 * Context-aware useActor that pulls the client from `<RivetProvider>`.
 *
 * Must be called inside a component wrapped in `<RivetProvider>`.
 * This is the recommended approach — no need to manually create a client
 * or call `createRivetKitWithClient`.
 *
 * ```tsx
 * function Counter() {
 *   const actor = useActorFromContext({
 *     name: "counter",
 *     key: ["test-counter"],
 *   });
 *   // actor.current.connection, actor.useActionQuery, etc.
 * }
 * ```
 */
export function useActorFromContext<
	Registry extends AnyActorRegistry = AnyActorRegistry,
	ActorName extends keyof ExtractActorsFromRegistry<Registry> & string = keyof ExtractActorsFromRegistry<Registry> & string,
>(opts: ActorOptions<Registry, ActorName>) {
	const { client } = useRivet<Registry>()
	const { useActor } = createRivetKitWithClient<Registry>(client)
	return useActor<ActorName>(opts)
}
