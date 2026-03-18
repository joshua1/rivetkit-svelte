export * from "./handler"
export {
	createRivetQuery,
	decodeRivetLoad,
	encodeRivetLoad,
	type RivetLoadOptions,
	RivetLoadResult,
	type RivetQueryOptions,
	type RivetQueryResult,
	// Legacy API (deprecated)
	rivetLoad,
	// New Provider-based API
	useRivetQuery,
} from "./transport"
