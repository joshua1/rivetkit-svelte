import type { RequestHandler } from "@sveltejs/kit"
import type { Registry } from "rivetkit"
import { getLogger } from "rivetkit/log"

const _devRunnerVersion = Math.floor(Date.now() / 1000)
const _logger = getLogger("driver-sveltekit")

const handler = async (
	request: Request,
	opts?: { registry: Registry<any>; isDev: boolean, rivetSiteUrl?: string },
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
	return await registry.handler(newRequest)
	// return fetch(newRequest, { method: request.method, redirect: "manual" })
}

export const createRivetKitHandler = (opts?: {
	registry: Registry<any>
	isDev: boolean,
	rivetSiteUrl?: string
}) => {
	const requestHandler: RequestHandler = async ({ request }) => {
		return handler(request, opts)
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
