import { useActor } from "~/lib"
import { Show, Suspense } from "solid-js"
import { rivetLoad, RivetQueryResult } from "@blujosi/rivetkit-solid/solidstart"
import { rivetClient } from "~/lib/actor.client"
import { query, createAsync } from "@solidjs/router"
import { Registry } from '~backend/registry'

const getCounterData = query(async () => {
	"use server"
	const count = await rivetLoad<number,Registry>(rivetClient, {
		actor: "counter",
		key: ["test-counter"],
		action: "getCount",
		event: "newCount"
	})
	const countDouble = await rivetLoad<number,Registry>(rivetClient, {
		actor: "counter",
		key: ["test-counter"],
		action: "getCountDouble",
		event: "newDoubleCount",
	})
	return { count, countDouble }
}, "counter-data")

export const route = {
	preload: () => getCounterData(),
}

export default function SSRPage() {
	const data = createAsync(() => getCounterData())

	// We still need useActor for calling actions (mutations)
	const counterActor = useActor?.({
		name: "counter",
		key: ["test-counter"],
	})

  const countValue = () => data()?.count?.data()
	const countDoubleValue = () => data()?.countDouble?.data()

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
		<div>
			<h2>SSR + Live Counter Demo</h2>
			<p>
				<em>Initial data loaded server-side, then upgraded to live subscriptions.</em>
			</p>

			<Suspense fallback={<p>Loading...</p>}>
				<Show when={data()}>
					{(d) => {

						return (
							<div>
								<h1>Counter: {countValue()}</h1>
								<button onClick={increment}>Increment</button>
								<button onClick={reset}>Reset</button>

								<h1>Counter 2: {countDoubleValue()}</h1>
								<button onClick={doubleCountClick}>Double Count</button>
							</div>
						)
					}}
				</Show>
			</Suspense>
		</div>
	)
}
