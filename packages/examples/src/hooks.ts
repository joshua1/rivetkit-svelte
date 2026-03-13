import {
	decodeRivetLoad,
	encodeRivetLoad,
} from "@blujosi/rivetkit-svelte/sveltekit"
import { rivetClient } from "$/lib/actor.client"

export const transport = {
	RivetLoadResult: {
		encode: (value: unknown) => encodeRivetLoad(value),
		decode: (encoded: any) => decodeRivetLoad(encoded, rivetClient),
	},
}
