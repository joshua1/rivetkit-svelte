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

export interface ActorStateReference<AD extends AnyActorDefinition> {
	/**
	 * The unique identifier for the actor.
	 * This is a hash generated from the actor's options.
	 * It is used to identify the actor instance in the store.
	 * @internal
	 */
	hash: string
	/**
	 * The state of the actor, derived from the store.
	 * This includes the actor's connection and handle.
	 */
	handle: ActorHandle<AD> | null
	/**
	 * The connection to the actor.
	 * This is used to communicate with the actor in realtime.
	 */
	connection: ActorConn<AD> | null
	/**
	 * Whether the actor is enabled.
	 */
	isConnected?: boolean
	/**
	 * Whether the actor is currently connecting, indicating that a connection attempt is in progress.
	 */
	isConnecting?: boolean
	/**
	 * Whether there was an error connecting to the actor.
	 */
	isError?: boolean
	/**
	 * The error that occurred while trying to connect to the actor, if any.
	 */
	error: Error | null
	/**
	 * Options for the actor, including its name, key, parameters, and whether it is enabled.
	 */
	opts: {
		name: keyof AD
		/**
		 * Unique key for the actor instance.
		 * This can be a string or an array of strings to create multiple instances.
		 * @example "abc" or ["abc", "def"]
		 */
		key: string | string[]
		/**
		 * Parameters for the actor.
		 * These are additional options that can be passed to the actor.
		 */
		params?: Record<string, string>
		/** Region to create the actor in if it doesn't exist. */
		createInRegion?: string
		/** Input data to pass to the actor. */
		createWithInput?: unknown
		/**
		 * Whether the actor is enabled.
		 * Defaults to true.
		 */
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
	const { getOrCreateActor } = createVanillaRivetKit<Registry>(client, opts)

	/**
	 * Svelte 5 rune-based function to connect to an actor and retrieve its state.
	 * Using this function with the same options will return the same actor instance.
	 * This simplifies passing around the actor state in your components.
	 * It also provides a method to listen for events emitted by the actor.
	 * @param opts - Options for the actor, including its name, key, and parameters.
	 * @returns An object containing reactive state and event listener function.
	 */
	function useActor<
		ActorName extends keyof ExtractActorsFromRegistry<Registry> & string,
	>(opts: ActorOptions<Registry, ActorName>) {
		const { mount, state } = getOrCreateActor<ActorName>(opts)

		// Update options reactively
		// $effect.root(() => {
		// 	setState((prev) => {
		// 		prev.opts = {
		// 			...opts,
		// 			enabled: opts.enabled ?? true,
		// 		} as any
		// 		return prev
		// 	})s
		// })

		// Mount and subscribe to state changes
		$effect.root(() => {
			mount()
		})
		let actorState = $state<any | undefined>(undefined)
		const unsubscribe = state?.subscribe((res) => {
			actorState = res.currentVal
		})
		$effect(() => {
			return () => unsubscribe?.()
		})

		function useEvent(
			eventName: string,
			handler: (...args: any[]) => void,
		) {
			let ref = $state(handler)
			let actorState = $state<typeof state.state | undefined>(undefined)

			state.subscribe((s) => {
				actorState = s.currentVal
			})

			$effect(() => {
				ref = handler
			})
			$effect(() => {
				if (!actorState?.connection) return
				function eventHandler(...args: any[]) {
					ref(...args)
				}
				return actorState.connection?.on(eventName, eventHandler)
			})
		}

		const current = {
			connect() {
				actorState?.connection?.connect()
			},
			get connection() {
				return actorState?.connection
			},
			get handle() {
				return actorState?.handle
			},
			get isConnected() {
				return actorState?.connStatus === "connected"
			},
			get isConnecting() {
				return actorState?.connStatus === "connecting"
			},
			get isError() {
				return !!actorState?.error
			},
			get error() {
				return actorState?.error
			},
			get opts() {
				return actorState?.opts
			},
			get hash() {
				return actorState?.hash
			},
		}

		/**
		 * Creates a reactive query that fetches an initial value by calling an actor action,
		 * then subscribes to an event to keep the value updated in real-time.
		 *
		 * @param queryOpts - Configuration for the query
		 * @param queryOpts.action - The action name to call for the initial value
		 * @param queryOpts.args - Optional arguments to pass to the action
		 * @param queryOpts.event - The event name to subscribe to for updates
		 * @param queryOpts.initialValue - The initial value before the action resolves
		 * @param queryOpts.transform - Optional function to merge incoming event data with current value.
		 *   Defaults to shallow merge for objects, full replacement for primitives.
		 * @returns A reactive object with `.value`, `.isLoading`, and `.error` properties
		 */
		function useQuery<T>(queryOpts: {
			action: string
			args?: any[]
			event: string
			initialValue: T
			transform?: (current: T, incoming: any) => T
		}) {
			let value = $state<T>(queryOpts.initialValue)
			let isLoading = $state(true)
			let error = $state<Error | null>(null)

			// Default transform: shallow merge for plain objects, full replacement otherwise
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
				value = transform(value, incoming)
				isLoading = false
				error = null
			})

			// Fetch the initial value once connected
			$effect(() => {
				const conn = actorState?.connection
				if (!conn) return

				const action = (conn as any)[queryOpts.action]
				if (typeof action !== "function") {
					error = new Error(
						`Action '${queryOpts.action}' not found on actor connection`,
					)
					isLoading = false
					return
				}

				const callArgs = queryOpts.args ?? []
				Promise.resolve(action.call(conn, ...callArgs))
					.then((result: T) => {
						value = result
						isLoading = false
					})
					.catch((err: unknown) => {
						error =
							err instanceof Error ? err : new Error(String(err))
						isLoading = false
					})
			})

			return {
				get value() {
					return value
				},
				get isLoading() {
					return isLoading
				},
				get error() {
					return error
				},
			}
		}

		/**
		 * Creates a reactive query that fetches a value by calling an actor action,
		 * then re-fetches whenever a specified event fires or the args change.
		 * Unlike `useQuery`, this does NOT use event data — the event is purely
		 * an invalidation signal that triggers a fresh action call.
		 *
		 * @param queryOpts - Configuration for the action query
		 * @param queryOpts.action - The action name to call
		 * @param queryOpts.args - Reactive arguments to pass to the action. When these change, the action is re-called.
		 * @param queryOpts.event - The event name(s) to listen for as invalidation signals
		 * @param queryOpts.initialValue - The value to use before the first action resolves
		 * @returns A reactive object with `.value`, `.isLoading`, `.error`, and `.refetch()` properties
		 */
		function useActionQuery<T>(queryOpts: {
			action: string
			args?: () => any[]
			event: string | string[]
			initialValue: T
		}) {
			let value = $state<T>(queryOpts.initialValue)
			let isLoading = $state(true)
			let error = $state<Error | null>(null)
			let fetchVersion = $state(0)

			// Helper to call the action
			function callAction() {
				const conn = actorState?.connection
				if (!conn) return

				const action = (conn as any)[queryOpts.action]
				if (typeof action !== "function") {
					error = new Error(
						`Action '${queryOpts.action}' not found on actor connection`,
					)
					isLoading = false
					return
				}

				const callArgs = queryOpts.args?.() ?? []
				isLoading = true
				Promise.resolve(action.call(conn, ...callArgs))
					.then((result: T) => {
						value = result
						isLoading = false
						error = null
					})
					.catch((err: unknown) => {
						error =
							err instanceof Error ? err : new Error(String(err))
						isLoading = false
					})
			}

			// Subscribe to event(s) as invalidation signals — bump version to trigger refetch
			const events = Array.isArray(queryOpts.event)
				? queryOpts.event
				: [queryOpts.event]
			for (const evt of events) {
				useEvent(evt, () => {
					fetchVersion++
				})
			}

			// Reactive effect: re-fetches when connection is ready, args change, or event fires
			$effect(() => {
				// Read reactive dependencies
				const _conn = actorState?.connection
				const _args = queryOpts.args?.()
				const _version = fetchVersion

				if (!_conn) return

				// Use void to suppress unused-variable warnings while keeping deps tracked
				void _args
				void _version

				callAction()
			})

			return {
				get value() {
					return value
				},
				get isLoading() {
					return isLoading
				},
				get error() {
					return error
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
