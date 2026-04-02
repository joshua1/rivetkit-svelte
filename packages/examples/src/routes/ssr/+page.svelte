<script lang="ts">
  import { useActor } from '$/lib';

  // Counter uses useActionQuery — re-fetches on event, no transform needed
  const counterActor = useActor?.({
    name: 'counter',
    key: ['test-counter'],
  });

  const count = counterActor?.useActionQuery({
    action: 'getCount',
    event: 'newCount',
    initialValue: 0,
  });

  const countDouble = counterActor?.useActionQuery({
    action: 'getCountDouble',
    event: 'newDoubleCount',
    initialValue: 0,
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

<h2>Live Counter Demo</h2>
<p>
  <em>Uses useActionQuery for automatic refetch on events.</em>
</p>

{#if count?.isLoading}
  <p>Loading...</p>
{:else}
  <div>
    <h1>Counter: {count?.value ?? 0}</h1>
    <button onclick={increment}>Increment</button>
    <button onclick={reset}>Reset</button>

    <h1>Counter 2: {countDouble?.value ?? 0}</h1>
    <button onclick={doubleCountClick}>Double Count</button>
  </div>
{/if}

{#if count?.error}
  <p style="color: red">Error: {count.error.message}</p>
{/if}
