import {
	createClient,
	createRivetKitWithClient,
} from "@blujosi/rivetkit-solid"
import type { Client } from "rivetkit/client"
import type { Registry } from "~backend/registry"

const IS_BROWSER = typeof globalThis.document !== "undefined"

const endpoint = IS_BROWSER
	? `${location.origin}/api/rivet`
	: "http://localhost:3000/api/rivet"

export const rivetClient: Client<Registry> = createClient<Registry>(endpoint)

const { useActor } = createRivetKitWithClient(rivetClient)
export { useActor }

export { rivetClient as client }
