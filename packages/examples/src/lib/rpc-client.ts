// import { hc } from "hono/client"
// import type { HonoAppType } from "backend"

// let browserClient: ReturnType<typeof hc<HonoAppType>>

// export const apiClient = (fetch: Window["fetch"]) => {
// 	const isBrowser = typeof window !== "undefined"
// 	//const _origin = 'http://localhost3000'

// 	if (isBrowser && browserClient) {
// 		return browserClient
// 	}

// 	const client = hc<HonoAppType>(`${location.origin}/api`, { fetch })

// 	if (isBrowser) {
// 		browserClient = client
// 	}

// 	return client
// }
