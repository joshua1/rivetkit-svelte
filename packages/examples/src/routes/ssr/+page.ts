import { rivetLoad } from "@blujosi/rivetkit-svelte/sveltekit"
import { rivetClient } from "$/lib/actor.client"

export const load = async () => ({
	count: await rivetLoad(rivetClient, {
		actor: 'counter',
		key: ['test-counter'],
		action: 'getCount',
		event: 'newCount',
	}),
	countDouble: await rivetLoad(rivetClient, {
		actor: 'counter',
		key: ['test-counter'],
		action: 'getCountDouble',
		event: 'newDoubleCount',
	}),
})
