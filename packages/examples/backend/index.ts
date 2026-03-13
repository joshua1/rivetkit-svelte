
// import { Hono } from "hono"
// import { cors } from "hono/cors"
// import { registry } from "./registry"

// const app = new Hono()

// app.use(
// 	"/*",
// 	cors({
// 		origin: "*",
// 	}),
// )
// app.get("/api/health", (c) => c.text("OK"))
// app.all("/api/rivet/*", (c) => registry.handler(c.req.raw))


// export type HonoAppType = typeof app

// export * from "./registry"
// export default app

// // serve({ fetch: honoApp.fetch, port: 3000 }, (info) => {
// // 	console.log(`Listening on http://localhost:${info.port}`)
// // })
