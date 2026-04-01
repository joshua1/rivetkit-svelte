declare module "@rivetkit/cloudflare-workers" {
	import type { Registry } from "rivetkit"

	export function createHandler(registry: Registry<any>): {
		handler: {
			fetch: (req: Request, env: unknown, ctx: unknown) => Promise<Response>
		}
		ActorHandler: unknown
	}
}
