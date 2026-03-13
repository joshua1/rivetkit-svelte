import { createRivetKitHandler } from "@blujosi/rivetkit-svelte/sveltekit"
import { dev } from "$app/environment"
import { registry } from "$backend/registry"

export const { GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS } =
	createRivetKitHandler({ isDev: !!dev, registry, rivetSiteUrl: 'http://localhost:5173' })
