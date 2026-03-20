import { resolve } from "node:path"
import { defineConfig } from "@solidjs/start/config"

export default defineConfig({
	middleware: "./src/middleware.ts",
	server: {
		preset: "node-server",
	},
	vite: {
		resolve: {
			alias: {
				"~backend": resolve("./backend"),
			},
		},
	},
})
