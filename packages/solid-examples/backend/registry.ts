import { actor, setup } from "rivetkit"
import { auth } from "~/lib/auth"

export const counter = actor({
	state: { count: 0, countDouble: 3 },
	onBeforeConnect: async (_c, params) => {
		const token = (params as Record<string, string>)?.token
		if (!token) throw new Error("Unauthorized: No token provided")

		try {
			const { payload } = await auth.api.verifyJWT({ body: { token } })
			if (!payload?.sub) throw new Error("Invalid token: no subject")
		} catch (err) {
			throw new Error(
				`Unauthorized: ${err instanceof Error ? err.message : "Invalid token"}`,
			)
		}
	},
	onStateChange: (c, newState) => {
		console.log("state changed", JSON.stringify(newState))
		console.log("previous state", JSON.stringify(c.state))
	},
	actions: {
		increment: (c, x: number) => {
			console.log("incrementing by", x)
			c.state.count += x
			c.broadcast("newCount", c.state.count)
			return c.state.count
		},
		getCount: (c) => {
			return c.state.count
		},
		getCountDouble: (c) => {
			return c.state.countDouble
		},
		reset: (c) => {
			c.state.count = 0
			c.state.countDouble = 3
			c.broadcast("newCount", c.state.count)
			c.broadcast("newDoubleCount", c.state.countDouble)
			return c.state.count
		},
		doubleIncrement: (c, y: number) => {
			console.log("incrementing by ", y)
			c.state.countDouble += y
			c.broadcast("newDoubleCount", c.state.countDouble)
			return c.state.countDouble
		},
	},
})

export const registry = setup({
	use: { counter },
})

export type Registry = typeof registry
export type CounterActor = typeof counter
