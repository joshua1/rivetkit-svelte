import { createMiddleware } from "@solidjs/start/middleware"
import { auth } from "~/lib/auth"

export default createMiddleware({
	onRequest: [
		async (event) => {
			const session = await auth.api.getSession({
				headers: event.request.headers,
			})

			if (!session?.user) {
				event.locals.token = null
				return
			}

			const res = await auth.api.getToken({
				headers: event.request.headers,
			})
			event.locals.token = res?.token ?? null
		},
	],
})
