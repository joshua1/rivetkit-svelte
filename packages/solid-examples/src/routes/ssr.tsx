import { Show } from "solid-js"
import { useActorFromContext } from "@blujosi/rivetkit-solid"
import { useAuth } from "~/lib/auth-context"

export default function SSRPage() {
	const { session, token, user } = useAuth()

	return (
		<div>
			<h2>Live Counter Demo</h2>
			<p>
				<em>
					Uses useActionQuery for automatic refetch on events.
				</em>
			</p>

			<Show when={session()?.isPending}>
				<p>Loading session...</p>
			</Show>

			<Show when={!session()?.isPending && !session()?.data}>
				<p>
					<a href="/auth">Sign in</a> to access your personal counter.
				</p>
			</Show>

			<Show when={user() && token()}>
				<p>
					Signed in as <strong>{user()!.email}</strong>
				</p>
				<CounterDemo userId={user()!.id} token={token()!} />
			</Show>
		</div>
	)
}

function CounterDemo(props: { userId: string; token: string }) {
	const counterActor = useActorFromContext({
		name: "counter",
		key: ["user-counter", props.userId],
		params: { token: props.token },
	})

	const count = counterActor?.useActionQuery({
		action: "getCount",
		event: "newCount",
		initialValue: 0,
	})

	const countDouble = counterActor?.useActionQuery({
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
		<Show when={!count?.isLoading} fallback={<p>Loading counter...</p>}>
			<div>
				<h1>Counter: {count?.value}</h1>
				<button type="button" onClick={increment}>Increment</button>
				<button type="button" onClick={reset}>Reset</button>

				<h1>Counter 2: {countDouble?.value}</h1>
				<button type="button" onClick={doubleCountClick}>
					Double Count
				</button>
			</div>
		</Show>
	)
}
