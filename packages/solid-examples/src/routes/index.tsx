import { useActor } from "~/lib"
import { Show } from "solid-js"

export default function Home() {
	const counterActor = useActor?.({
		name: "counter",
		key: ["test-counter"],
	})

	// useActionQuery: fetches value via action, re-fetches on event trigger
	const countQuery = counterActor?.useActionQuery({
		action: "getCount",
		event: "newCount",
		initialValue: 2,
	})

	const countDoubleQuery = counterActor?.useActionQuery({
		action: "getCountDouble",
		event: "newDoubleCount",
		initialValue: 3,
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
			fallback={<p>Loading...</p>}
		>
			<div>
				<h1>Counter: {countQuery?.value}</h1>
				<button onClick={increment}>Increment</button>
				<button onClick={reset}>Reset</button>

				<h1>Counter 2: {countDoubleQuery?.value}</h1>
				<button onClick={doubleCountClick}>Double Count</button>
			</div>
		</Show>
	)
}
