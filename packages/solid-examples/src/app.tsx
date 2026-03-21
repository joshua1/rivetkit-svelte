import { Router } from "@solidjs/router"
import { FileRoutes } from "@solidjs/start/router"
import { Suspense } from "solid-js"
import { RivetProvider } from "@blujosi/rivetkit-solid"
import { rivetClient } from "~/lib/actor.client"
import { AuthProvider } from "~/lib/auth-context"

export default function App() {
	return (
		<AuthProvider>
			<RivetProvider client={rivetClient}>
				<Router
					root={(props) => (
						<div>
							<nav style={{ padding: "1rem", "border-bottom": "1px solid #ccc" }}>
								<a href="/">Counter</a>{" | "}
								<a href="/ssr">SSR Counter</a>{" | "}
								<a href="/todos">Todos</a>{" | "}
								<a href="/auth">Auth</a>
							</nav>
							<main style={{ padding: "1rem" }}>
								<Suspense>{props.children}</Suspense>
							</main>
						</div>
					)}
				>
					<FileRoutes />
				</Router>
			</RivetProvider>
		</AuthProvider>
	)
}
