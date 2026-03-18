import { useActorFromContext } from "@blujosi/rivetkit-solid"
import { createSignal, createEffect, Show } from "solid-js"
import { authClient } from "~/lib/auth-client"

export default function Home() {
	const session = authClient.useSession()
	const [jwt, setJwt] = createSignal<string | null>(null)

	// Fetch a JWT for actor connections when the user is signed in
	createEffect(() => {
		if (session()?.data) {
			fetch("/api/token", { credentials: "include" })
				.then((r) => (r.ok ? r.json() : null))
				.then((data) => data?.token && setJwt(data.token))
				.catch(() => setJwt(null))
		} else {
			setJwt(null)
		}
	})

	return (
		<div>
			<Show when={session()?.isPending}>
				<p>Loading session...</p>
			</Show>

			<Show when={!session()?.isPending && !session()?.data}>
				<p>
					<a href="/auth">Sign in</a> to access your personal counter.
				</p>
			</Show>

			<Show when={session()?.data && jwt()}>
				<p>
					Signed in as <strong>{session()?.data?.user.email}</strong>
				</p>
				<UserCounter userId={session()!.data!.user.id} token={jwt()!} />
			</Show>
		</div>
	)
}

function UserCounter(props: { userId: string; token: string }) {
	// Actor key includes user ID — each user gets their own counter
	const counterActor = useActorFromContext({
		name: "counter",
		key: ["user-counter", props.userId],
		params: { token: props.token },
	})

	const countQuery = counterActor?.useActionQuery({
		action: "getCount",
		event: "newCount",
		initialValue: 0,
	})

	const countDoubleQuery = counterActor?.useActionQuery({
		action: "getCountDouble",
		event: "newDoubleCount",
		initialValue: 0,
	})

	const increment = async () => {
		await counterActor?.current?.connection?.increment(1)
	}
	const reset = async () => {
		await counterActor?.current?.connection?.reset()
	}
	const doubleCountClick = async () => {
		await counterActor?.current?.connection?.doubleIncrement(2)
	}

	return (
		<Show
			when={!countQuery?.isLoading && !countDoubleQuery?.isLoading}
			fallback={<p>Loading counter...</p>}
		>
			<div>
				<h1>Counter: {countQuery?.value}</h1>
				<button type="button" onClick={increment}>Increment</button>
				<button type="button" onClick={reset}>Reset</button>

				<h1>Counter 2: {countDoubleQuery?.value}</h1>
				<button type="button" onClick={doubleCountClick}>Double Count</button>
			</div>
		</Show>
	)
}
