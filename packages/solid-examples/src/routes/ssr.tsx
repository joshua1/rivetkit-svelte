import { Show, Suspense } from "solid-js"
import { useRivetQuery } from "@blujosi/rivetkit-solid/solidstart"
import { useActorFromContext } from "@blujosi/rivetkit-solid"
import { useAuth } from "~/lib/auth-context"

export default function SSRPage() {
	const { session, token, user } = useAuth()

	return (
		<div>
			<h2>SSR + Live Counter Demo</h2>
			<p>
				<em>
					Initial data loaded via createResource, then upgraded to live
					subscriptions.
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
				<SSRCounter userId={user()!.id} token={token()!} />
			</Show>
		</div>
	)
}

function SSRCounter(props: { userId: string; token: string }) {
	// useRivetQuery uses createResource for SSR + auto-upgrades to live WS
	// Token comes from middleware event.locals — no client-side /api/token fetch needed
	const count = useRivetQuery<number>({
		actor: "counter",
		key: ["user-counter", props.userId],
		action: "getCount",
		event: "newCount",
		params: { token: props.token },
	})

	const countDouble = useRivetQuery<number>({
		actor: "counter",
		key: ["user-counter", props.userId],
		action: "getCountDouble",
		event: "newDoubleCount",
		params: { token: props.token },
	})

	// Separate actor connection for calling mutations
	const counterActor = useActorFromContext({
		name: "counter",
		key: ["user-counter", props.userId],
		params: { token: props.token },
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
		<Suspense fallback={<p>Loading counter...</p>}>
			<div>
				<h1>Counter: {count.data()}</h1>
				<button type="button" onClick={increment}>Increment</button>
				<button type="button" onClick={reset}>Reset</button>

				<h1>Counter 2: {countDouble.data()}</h1>
				<button type="button" onClick={doubleCountClick}>
					Double Count
				</button>
			</div>
		</Suspense>
	)
}
