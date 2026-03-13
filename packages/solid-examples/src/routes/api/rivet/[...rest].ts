import { createRivetKitHandler } from "@blujosi/rivetkit-solid/solidstart"
import { registry } from "~backend/registry"

const isDev = import.meta.env.DEV

export const { GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS } =
	createRivetKitHandler({
		isDev: !!isDev,
		registry,
		rivetSiteUrl: "http://localhost:3000",
	})
