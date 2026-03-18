/**
 * RivetKit Provider & Context for SolidJS.
 *
 * Provides the RivetKit client via SolidJS context so that:
 * - The client is injected, not imported as a module-level singleton
 * - Each SSR request gets its own context tree (server isolation)
 * - All signals created by hooks have proper ownership and cleanup
 * - Components can be tested with mock clients
 */

import type { AnyActorRegistry } from "@rivetkit/framework-base"
import type { Client } from "rivetkit/client"
import {
	type ParentComponent,
	createContext,
	useContext,
} from "solid-js"

// ============================================================================
// Context
// ============================================================================

interface RivetContextValue<Registry extends AnyActorRegistry = AnyActorRegistry> {
	client: Client<Registry>
}

const RivetContext = createContext<RivetContextValue>()

// ============================================================================
// Provider
// ============================================================================

/**
 * Provides the RivetKit client to the component tree.
 *
 * Wrap your app (or a subtree) with this provider so that `useRivet()`,
 * `useActor()`, and `useRivetQuery()` can access the client via context.
 *
 * ```tsx
 * import { RivetProvider } from "@blujosi/rivetkit-solid";
 *
 * <RivetProvider client={rivetClient}>
 *   <Router>...</Router>
 * </RivetProvider>
 * ```
 */
export const RivetProvider: ParentComponent<{
	client: Client<any>
}> = (props) => {
	return (
		<RivetContext.Provider value={{ client: props.client }}>
			{props.children}
		</RivetContext.Provider>
	)
}

// ============================================================================
// useRivet — access client from context
// ============================================================================

/**
 * Access the RivetKit client from context.
 *
 * Must be called inside a `<RivetProvider>`.
 *
 * ```tsx
 * const { client } = useRivet<Registry>();
 * ```
 */
export function useRivet<Registry extends AnyActorRegistry = AnyActorRegistry>(): RivetContextValue<Registry> {
	const ctx = useContext(RivetContext)
	if (!ctx) {
		throw new Error(
			"useRivet() must be used inside a <RivetProvider>. " +
			"Wrap your app with <RivetProvider client={...}>.",
		)
	}
	return ctx as RivetContextValue<Registry>
}

export { RivetContext }
