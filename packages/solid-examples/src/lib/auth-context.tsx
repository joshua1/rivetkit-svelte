import type { ParentProps } from "solid-js"
import { createContext, createEffect, createSignal, useContext } from "solid-js"
import { isServer } from "solid-js/web"
import { getRequestEvent } from "solid-js/web"
import { authClient } from "./auth-client"

interface AuthContextValue {
	session: ReturnType<typeof authClient.useSession>
	token: () => string | null
	user: () => { id: string; email: string; name: string } | null
}

const AuthContext = createContext<AuthContextValue>()

export function AuthProvider(props: ParentProps) {
	const session = authClient.useSession()
	const [token, setToken] = createSignal<string | null>(
		isServer
			? (getRequestEvent()?.locals as { token?: string })?.token ?? null
			: null,
	)

	// On the client, fetch the JWT when session becomes available
	if (!isServer) {
		createEffect(() => {
			if (session()?.data) {
				authClient
					.token()
					.then((res: { data?: { token?: string } | null }) => {
						if (res.data?.token) setToken(res.data.token)
						else setToken(null)
					})
					.catch(() => setToken(null))
			} else {
				setToken(null)
			}
		})
	}

	const user = () => {
		const data = session()?.data
		if (!data) return null
		return {
			id: data.user.id,
			email: data.user.email,
			name: data.user.name,
		}
	}

	return (
		<AuthContext.Provider value={{ session, token, user }}>
			{props.children}
		</AuthContext.Provider>
	)
}

export function useAuth(): AuthContextValue {
	const ctx = useContext(AuthContext)
	if (!ctx) {
		throw new Error("useAuth() must be used inside <AuthProvider>")
	}
	return ctx
}
