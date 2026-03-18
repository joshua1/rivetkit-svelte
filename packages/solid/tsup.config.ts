import { solidPlugin } from "esbuild-plugin-solid"
import { defineConfig } from "tsup"

export default defineConfig({
	entry: {
		index: "src/index.ts",
		"solid/index": "src/solid/index.ts",
		"solidstart/index": "src/solidstart/index.ts",
	},
	format: ["esm"],
	dts: true,
	clean: true,
	treeshake: true,
	external: ["solid-js", "solid-js/web", "solid-js/store"],
	esbuildPlugins: [solidPlugin()],
})
