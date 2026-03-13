import {
	createClient,
	createRivetKitWithClient,
} from "@blujosi/rivetkit-svelte"
import type { Client } from "rivetkit/client"
import { browser } from "$app/environment"
import type { Registry } from "$backend/registry"
import { PUBLIC_APP_URL } from '$env/static/public'

const endpoint = browser
	? `${location.origin}/api/rivet`
	: `${PUBLIC_APP_URL ?? "http://localhost:5173"}/api/rivet`

export const rivetClient: Client<Registry> = createClient<Registry>(endpoint)

const { useActor } = createRivetKitWithClient(rivetClient)
export { useActor }

/**
 * Re-export rivetLoad pre-bound with the client for convenience.
 * Use in +page.ts load functions for SSR → live query upgrade.
 */
export { rivetClient as client }
