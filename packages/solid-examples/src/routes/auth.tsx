import { createSignal, Show } from "solid-js"
import { authClient } from "~/lib/auth-client"

export default function AuthPage() {
	const [isSignUp, setIsSignUp] = createSignal(false)
	const [email, setEmail] = createSignal("")
	const [password, setPassword] = createSignal("")
	const [name, setName] = createSignal("")
	const [error, setError] = createSignal("")
	const [loading, setLoading] = createSignal(false)

	const session = authClient.useSession()

	const handleSubmit = async (e: SubmitEvent) => {
		e.preventDefault()
		setError("")
		setLoading(true)

		try {
			if (isSignUp()) {
				const result = await authClient.signUp.email({
					email: email(),
					password: password(),
					name: name(),
				})
				if (result.error) throw new Error(result.error.message)
			} else {
				const result = await authClient.signIn.email({
					email: email(),
					password: password(),
				})
				if (result.error) throw new Error(result.error.message)
			}
			window.location.href = "/"
		} catch (err) {
			setError(err instanceof Error ? err.message : "Authentication failed")
		} finally {
			setLoading(false)
		}
	}

	const handleSignOut = async () => {
		await authClient.signOut()
		window.location.reload()
	}

	return (
		<div>
			<Show when={session()?.data}>
				<p>Signed in as <strong>{session()?.data?.user.email}</strong></p>
				<button type="button" onClick={handleSignOut}>Sign Out</button>
				<p>
					<a href="/">Go to counter</a>
				</p>
			</Show>

			<Show when={!session()?.data && !session()?.isPending}>
				<h1>{isSignUp() ? "Sign Up" : "Sign In"}</h1>

				<form onSubmit={handleSubmit}>
					<Show when={isSignUp()}>
						<div>
							<input
								type="text"
								placeholder="Name"
								value={name()}
								onInput={(e) => setName(e.currentTarget.value)}
								required
							/>
						</div>
					</Show>
					<div>
						<input
							type="email"
							placeholder="Email"
							value={email()}
							onInput={(e) => setEmail(e.currentTarget.value)}
							required
						/>
					</div>
					<div>
						<input
							type="password"
							placeholder="Password (min 8 chars)"
							value={password()}
							onInput={(e) => setPassword(e.currentTarget.value)}
							minLength={8}
							required
						/>
					</div>
					<button type="submit" disabled={loading()}>
						{loading() ? "Loading..." : isSignUp() ? "Sign Up" : "Sign In"}
					</button>
				</form>

				<Show when={error()}>
					<p style={{ color: "red" }}>{error()}</p>
				</Show>

				<p>
					<button type="button" onClick={() => setIsSignUp(!isSignUp())}>
						{isSignUp()
							? "Already have an account? Sign In"
							: "Need an account? Sign Up"}
					</button>
				</p>
			</Show>
		</div>
	)
}
