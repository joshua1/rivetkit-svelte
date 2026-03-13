<script lang="ts">
  import { useActor } from '$/lib';

  let { data } = $props();

  // SSR data is already reactive — data.count and data.countDouble
  // are RivetQueryResult objects that auto-update via live event subscriptions.
  const count = $derived(data.count.data);
  const countDouble = $derived(data.countDouble.data);

  // We still need useActor for calling actions (mutations)
  const counterActor = useActor?.({
    name: 'counter',
    key: ['test-counter'],
  });

  const increment = async () => {
    await counterActor?.current?.connection?.increment(1);
  };
  const reset = async () => {
    await counterActor?.current?.connection?.reset();
  };
  const doubleCountClick = async () => {
    await counterActor?.current?.connection?.doubleIncrement(2);
  };
</script>

<h2>SSR + Live Counter Demo</h2>
<p>
  <em>Initial data loaded server-side, then upgraded to live subscriptions.</em>
</p>

{#if data.count.isLoading}
  <p>Loading...</p>
{:else}
  <div>
    <h1>Counter: {count}</h1>
    <button onclick={increment}>Increment</button>
    <button onclick={reset}>Reset</button>

    <h1>Counter 2: {countDouble}</h1>
    <button onclick={doubleCountClick}>Double Count</button>
  </div>
{/if}

{#if data.count.error}
  <p style="color: red">Error: {data.count.error.message}</p>
{/if}
