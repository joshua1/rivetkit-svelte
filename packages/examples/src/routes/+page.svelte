<script lang="ts">
  import { useActor } from '$/lib';

  const counterActor = useActor?.({
    name: 'counter',
    key: ['test-counter'],
  });

  // useActionQuery: fetches value via action, re-fetches on event trigger
  const countQuery = counterActor?.useActionQuery({
    action: 'getCount',
    event: 'newCount',
    initialValue: 2,
  });

  const count = $derived(countQuery?.value);
  const countDoubleQuery = counterActor?.useActionQuery({
    action: 'getCountDouble',
    event: 'newDoubleCount',
    initialValue: 3,
  });
  const countDouble = $derived(countDoubleQuery?.value);

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

{#if countQuery?.isLoading || countDoubleQuery?.isLoading}
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
