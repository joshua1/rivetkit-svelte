import type { RequestEvent, RequestHandler } from "@sveltejs/kit"
import type { Registry } from "rivetkit"
import { getLogger } from "rivetkit/log"

const _devRunnerVersion = Math.floor(Date.now() / 1000)
const _logger = getLogger("driver-sveltekit")

export interface RivetKitHandlerOpts {
	registry: Registry<any>
	isDev: boolean
	rivetSiteUrl?: string
	/** Static headers added to every request sent to the registry handler */
	headers?: Record<string, string>
	/** Dynamic headers resolved per-request. Receives the full SvelteKit RequestEvent. */
	getHeaders?: (event: RequestEvent) => Record<string, string> | Promise<Record<string, string>>
	/**
	 * The runtime to use for handling requests.
	 *
	 * - `"default"` — uses the built-in registry handler (Node.js / Bun compatible).
	 * - `"cloudflare"` — delegates to `@rivetkit/cloudflare-workers`'s `createHandler`.
	 *   Requires `@rivetkit/cloudflare-workers` to be installed as a peer dependency.
	 *
	 * @default "default"
	 */
	runtime?: "default" | "cloudflare"
}

const handler = async (
	request: Request,
	event: RequestEvent,
	opts?: RivetKitHandlerOpts,
) => {
	const _requestUrl = new URL(request.url)

	const rivetSiteUrl = opts?.rivetSiteUrl

	if (!rivetSiteUrl) {
		throw new Error('PUBLIC_RIVET_ENDPOINT environment variable is not set')
	}

	const registry = opts?.registry
	if (!registry) {
		throw new Error("registry is not set")
	}
	registry.config.serveManager = false

	registry.config.serverless = {
		...registry.config.serverless,
		basePath: "/api/rivet",
	}


	if (opts?.isDev) {
		_logger.debug(
			"detected development environment, auto-starting engine and auto-configuring serverless",
		)

		// Set these on the registry's config directly since the legacy inputConfig
		// isn't used by the serverless router

		registry.config.serverless.spawnEngine = true
		registry.config.serverless.configureRunnerPool = {
			url: `${rivetSiteUrl}/api/rivet`,
			minRunners: 0,
			maxRunners: 100_000,
			requestLifespan: 300,
			slotsPerRunner: 1,
			metadata: { provider: "sveltekit" },
		}

		// Set runner version to enable hot-reloading on code changes
		registry.config.runner = {
			...registry.config.runner,
			version: _devRunnerVersion,
		}
	} else {
		_logger.debug(
			"detected production environment, will not auto-start engine and auto-configure serverless",
		)
	}

	const newUrl = `${rivetSiteUrl}${_requestUrl.pathname}`
	const newRequest = new Request(newUrl, request)
	newRequest.headers.set("host", new URL(newUrl).host)
	newRequest.headers.set("accept-encoding", "application/json")

	// Apply static headers
	if (opts?.headers) {
		for (const [key, value] of Object.entries(opts.headers)) {
			newRequest.headers.set(key, value)
		}
	}

	// Apply dynamic per-request headers
	if (opts?.getHeaders) {
		const dynamicHeaders = await opts.getHeaders(event)
		for (const [key, value] of Object.entries(dynamicHeaders)) {
			newRequest.headers.set(key, value)
		}
	}

	return await registry.handler(newRequest)
	// return fetch(newRequest, { method: request.method, redirect: "manual" })
}

export const createRivetKitHandler = (opts?: RivetKitHandlerOpts) => {
	const runtime = opts?.runtime ?? "default"

	if (runtime === "cloudflare") {
		return createCloudflareHandler(opts)
	}

	const requestHandler: RequestHandler = async (event) => {
		return handler(event.request, event, opts)
	}

	return {
		GET: requestHandler,
		POST: requestHandler,
		PUT: requestHandler,
		DELETE: requestHandler,
		PATCH: requestHandler,
		HEAD: requestHandler,
		OPTIONS: requestHandler,
	}
}

/**
 * Resolves the Cloudflare Workers handler by dynamically importing
 * `@rivetkit/cloudflare-workers`. The package must be installed as a
 * peer dependency when `runtime: "cloudflare"` is used.
 */
function createCloudflareHandler(opts?: RivetKitHandlerOpts) {
	const registry = opts?.registry
	if (!registry) {
		throw new Error("registry is required for cloudflare runtime")
	}

	let cfHandlerPromise: Promise<{ handler: { fetch: (req: Request, env: unknown, ctx: unknown) => Promise<Response> }; ActorHandler: unknown }> | undefined

	const getCfHandler = () => {
		if (!cfHandlerPromise) {
			cfHandlerPromise = import("@rivetkit/cloudflare-workers").then(
				(mod) => mod.createHandler(registry),
				() => {
					throw new Error(
						'runtime "cloudflare" requires @rivetkit/cloudflare-workers to be installed. ' +
						"Install it with: npm install @rivetkit/cloudflare-workers",
					)
				},
			)
		}
		return cfHandlerPromise
	}

	const requestHandler: RequestHandler = async (event) => {
		const { handler: cfHandler } = await getCfHandler()
		// Cloudflare handler expects (request, env, ctx). In SvelteKit we pass
		// platform env if available and a minimal execution context.
		const env = (event.platform as any)?.env ?? {}
		const ctx = (event.platform as any)?.ctx ?? { waitUntil: () => { }, passThroughOnException: () => { } }
		return cfHandler.fetch(event.request, env, ctx)
	}

	return {
		GET: requestHandler,
		POST: requestHandler,
		PUT: requestHandler,
		DELETE: requestHandler,
		PATCH: requestHandler,
		HEAD: requestHandler,
		OPTIONS: requestHandler,
	}
}
