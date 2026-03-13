# @blujosi/rivetkit-svelte

A Svelte 5 integration for [RivetKit](https://rivet.dev) that provides reactive actor connections using Svelte 5's runes system, plus a built-in SvelteKit handler for serverless deployment.

## Installation

```sh
pnpm add @blujosi/rivetkit-svelte rivetkit

# or

npm i @blujosi/rivetkit-svelte rivetkit
```

## Overview

`@blujosi/rivetkit-svelte` provides two main pieces:

1. **Svelte 5 client** (`@blujosi/rivetkit-svelte`) — `useActor` hook for reactive actor connections with real-time events
2. **SvelteKit handler** (`@blujosi/rivetkit-svelte/sveltekit`) — `createRivetKitHandler` to serve RivetKit as a SvelteKit API route

## Features

- **Svelte 5 Runes** — Built for `$state`, `$effect`, and `$derived`
- **Real-time Actor Connections** — Connect to RivetKit actors with automatic state sync
- **Event Handling** — `useEvent` with automatic cleanup
- **Type Safety** — Full TypeScript support with registry type inference
- **SSR Compatible** — Browser guard for SvelteKit SSR
- **SvelteKit Handler** — Run RivetKit serverless inside your SvelteKit app

---

## Quick Start

### 1. Define Your Actors & Registry

```typescript
// backend/registry.ts
import { actor, setup } from "rivetkit";

export const counter = actor({
  state: { count: 0, countDouble: 0 },
  actions: {
    increment: (c, x: number) => {
      c.state.count += x;
      c.broadcast("newCount", c.state.count);
      return c.state.count;
    },
    getCount: (c) => c.state.count,
    getCountDouble: (c) => c.state.countDouble,
    doubleIncrement: (c, y: number) => {
      c.state.countDouble += y;
      c.broadcast("newDoubleCount", c.state.countDouble);
      return c.state.countDouble;
    },
    reset: (c) => {
      c.state.count = 0;
      c.state.countDouble = 0;
      c.broadcast("newCount", c.state.count);
      c.broadcast("newDoubleCount", c.state.countDouble);
      return c.state.count;
    },
  },
});

export const registry = setup({
  use: { counter },
});

export type Registry = typeof registry;
```

### 2. Set Up the SvelteKit Handler

Create a catch-all API route to proxy RivetKit requests through SvelteKit:

```typescript
// src/routes/api/rivet/[...rest]/+server.ts
import { createRivetKitHandler } from "@blujosi/rivetkit-svelte/sveltekit";
import { dev } from "$app/environment";
import { registry } from "$backend/registry";

export const { GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS } =
  createRivetKitHandler({
    isDev: !!dev,
    registry,
    rivetSiteUrl: "http://localhost:5173",
  });
```

The handler automatically:
- Spawns the RivetKit engine in dev mode
- Configures the serverless runner pool
- Proxies requests to the registry's built-in handler

#### Handler Options

| Option | Type | Description |
|---|---|---|
| `registry` | `Registry` | Your RivetKit registry instance |
| `isDev` | `boolean` | Enables auto-engine spawn and runner pool config |
| `rivetSiteUrl` | `string?` | Base URL for the site. Falls back to `PUBLIC_RIVET_ENDPOINT` env var |

### 3. Create the Client

```typescript
// src/lib/actor.client.ts
import { createClient, createRivetKitWithClient } from "@blujosi/rivetkit-svelte";
import type { Client } from "rivetkit/client";
import { browser } from "$app/environment";
import type { Registry } from "$backend/registry";

let rivetClient: Client<Registry> | undefined;

export const getRivetClient = () => {
  if (!browser) return { useActor: () => {} };

  const origin = `${location.origin}/api/rivet`;
  rivetClient = createClient<Registry>(origin);
  const { useActor } = createRivetKitWithClient(rivetClient);

  return { rivetClient, useActor };
};
```

> **Important:** The client must only be created in the browser. The `browser` guard ensures SSR doesn't attempt a connection.

### 4. Use Actors in Svelte Components

The simplest approach is `useActionQuery` — it fetches the value by calling an action, then re-fetches whenever an event fires:

```svelte
<!-- src/routes/+page.svelte -->
<script lang="ts">
  import { getRivetClient } from "../lib/actor.client";
  import { browser } from "$app/environment";

  const { useActor } = getRivetClient();
  const counterActor = browser
    ? useActor({ name: "counter", key: ["test-counter"] })
    : undefined;

  // useActionQuery: fetches value, re-fetches on event
  const count = counterActor?.useActionQuery({
    action: "getCount",
    event: "newCount",
    initialValue: 0,
  });

  const countDouble = counterActor?.useActionQuery({
    action: "getCountDouble",
    event: "newDoubleCount",
    initialValue: 0,
  });

  // Call actions through the connection
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

<div>
  <h1>Counter: {count?.value ?? 0}</h1>
  <button onclick={increment}>Increment</button>
  <button onclick={reset}>Reset</button>

  <h1>Counter 2: {countDouble?.value ?? 0}</h1>
  <button onclick={doubleCountClick}>Double Count</button>
</div>
```

Alternatively, you can use `useEvent` directly for manual control:

```svelte
<script lang="ts">
  let count = $state(0);

  // Listen for events (call at top-level, NOT inside $effect)
  counterActor?.useEvent("newCount", (x: number) => {
    count = x;
  });
</script>
```

---

## API Reference

### Client Exports (`@blujosi/rivetkit-svelte`)

#### `createClient<Registry>(url)`

Creates a RivetKit client connection.

```typescript
import { createClient } from "@blujosi/rivetkit-svelte";
const client = createClient<Registry>("http://localhost:5173/api/rivet");
```

#### `createRivetKit<Registry>(url, opts?)`

Shorthand that creates both the client and the `useActor` hook.

```typescript
import { createRivetKit } from "@blujosi/rivetkit-svelte";
export const { useActor } = createRivetKit<Registry>("http://localhost:5173/api/rivet");
```

#### `createRivetKitWithClient<Registry>(client, opts?)`

Creates the `useActor` hook from an existing client instance. Use this when you need access to the client elsewhere.

```typescript
import { createClient, createRivetKitWithClient } from "@blujosi/rivetkit-svelte";
const client = createClient<Registry>(url);
export const { useActor } = createRivetKitWithClient(client);
```

### `useActor(options)`

Connects to a RivetKit actor and returns reactive state. **Must be called at the top level of a component script** (not inside `onMount` or other callbacks) so runes attach correctly.

```typescript
const actor = useActor({
  name: "counter",             // Actor name from your registry
  key: ["test-counter"],       // Unique key for this instance
  params: { /* ... */ },       // Optional parameters
  createInRegion: "us-east-1", // Optional region
  createWithInput: { /* */ },  // Optional input data
  enabled: true,               // Optional, defaults to true
});
```

**Returns:**

| Property | Type | Description |
|---|---|---|
| `current.connection` | `ActorConn` | Call actions on the actor |
| `current.handle` | `ActorHandle` | Advanced actor operations |
| `current.isConnected` | `boolean` | Whether the actor is connected |
| `current.isConnecting` | `boolean` | Whether a connection is in progress |
| `current.isError` | `boolean` | Whether there's an error |
| `current.error` | `Error \| null` | The error object, if any |
| `useEvent(name, handler)` | `function` | Listen for actor events |
| `useQuery(opts)` | `object` | Reactive query with transform — see below |
| `useActionQuery(opts)` | `object` | Re-fetch query (event = invalidation signal) — see below |

### `useEvent(eventName, handler)`

Registers an event listener with automatic cleanup. **Call at the top level of the component script, not inside `$effect`.**

```typescript
counterActor?.useEvent("newCount", (value: number) => {
  count = value;
});
```

### `useQuery(options)`

Creates a reactive query that fetches an initial value by calling an actor action, then subscribes to an event to keep the value updated in real-time. This combines `useEvent` + an initial action call into a single API.

**Call at the top level of the component script, not inside `$effect` or `onMount`.**

```typescript
const count = counterActor?.useQuery({
  action: "getCount",        // Action to call for the initial value
  event: "newCount",         // Event to subscribe to for updates
  initialValue: 0,           // Value before the action resolves
  args: [],                  // Optional arguments to pass to the action
});
```

**Options:**

| Option | Type | Description |
|---|---|---|
| `action` | `string` | The action name to call for the initial value |
| `args` | `any[]?` | Optional arguments passed to the action |
| `event` | `string` | The event name to subscribe to for real-time updates |
| `initialValue` | `T` | The value to use before the action resolves |
| `transform` | `(current: T, incoming: any) => T?` | Optional function to merge incoming event data with the current value |

**Default transform behavior:**
- **Plain objects** — shallow merge: `{ ...current, ...incoming }`
- **Primitives & arrays** — full replacement

**Returns:**

| Property | Type | Description |
|---|---|---|
| `value` | `T` | The current reactive value |
| `isLoading` | `boolean` | `true` until the initial action resolves |
| `error` | `Error \| null` | Error from the action call, if any |

**Example with action arguments:**

```typescript
// If your getter action takes parameters:
const filteredItems = counterActor?.useQuery({
  action: "getItems",
  args: ["active", 10],     // passed as getItems("active", 10)
  event: "itemsUpdated",
  initialValue: [],
});
```

**Object state without custom transform (default shallow merge):**

```svelte
<script lang="ts">
  // Default: objects are shallow-merged, primitives are replaced
  const gameState = gameActor?.useQuery({
    action: "getState",
    event: "stateUpdated",
    initialValue: { players: [], score: 0, phase: "lobby" },
  });

  // If the actor broadcasts { score: 5 }, the value becomes:
  // { players: [], score: 5, phase: "lobby" }  ← players & phase preserved
</script>

<p>Score: {gameState?.value.score}</p>
<p>Phase: {gameState?.value.phase}</p>
```

**Object state with custom transform (e.g. deep merge for nested arrays):**

```svelte
<script lang="ts">
  const gameState = gameActor?.useQuery({
    action: "getState",
    event: "stateUpdated",
    initialValue: { players: [], score: 0, phase: "lobby" },
    transform: (current, incoming) => ({
      ...current,
      ...incoming,
      // Append new players instead of replacing the array
      players: incoming.players
        ? [...current.players, ...incoming.players]
        : current.players,
    }),
  });

  // If the actor broadcasts { players: [{ name: "Alice" }] }, the value becomes:
  // { players: [...existing, { name: "Alice" }], score: 0, phase: "lobby" }
</script>
```

**Full replacement transform (override the default merge):**

```typescript
const gameState = gameActor?.useQuery({
  action: "getState",
  event: "stateUpdated",
  initialValue: { players: [], score: 0, phase: "lobby" },
  // Always replace entirely
  transform: (_current, incoming) => incoming,
});
```

### `useActionQuery(options)`

Creates a reactive query that calls an actor action to fetch data, then **re-calls the same action** whenever one of the specified events fires or the args change. Unlike `useQuery`, event data is ignored — the event is purely an invalidation signal.

This is the recommended approach for most use-cases: simpler, always consistent with server state, and no transform logic to maintain.

**Call at the top level of the component script, not inside `$effect` or `onMount`.**

```typescript
const count = counterActor?.useActionQuery({
  action: "getCount",        // Action to call (and re-call)
  event: "newCount",         // Event(s) that trigger a refetch
  initialValue: 0,           // Value before the first action resolves
});
```

**Options:**

| Option | Type | Description |
|---|---|---|
| `action` | `string` | The action name to call |
| `args` | `() => any[]?` | **Reactive** getter returning arguments. When the return value changes, the action is re-called |
| `event` | `string \| string[]` | Event name(s) that trigger a refetch |
| `initialValue` | `T` | The value to use before the first action resolves |

**Returns:**

| Property | Type | Description |
|---|---|---|
| `value` | `T` | The current reactive value |
| `isLoading` | `boolean` | `true` while an action call is in flight |
| `error` | `Error \| null` | Error from the action call, if any |
| `refetch()` | `function` | Manually trigger a re-fetch |

**Basic usage:**

```svelte
<script lang="ts">
  const count = counterActor?.useActionQuery({
    action: "getCount",
    event: "newCount",
    initialValue: 0,
  });
</script>

<p>Count: {count?.value}</p>
```

**Multiple invalidation events:**

```typescript
// Re-fetch whenever *any* of these events fire
const count = counterActor?.useActionQuery({
  action: "getCount",
  event: ["newCount", "countReset", "countBatchUpdate"],
  initialValue: 0,
});
```

**Reactive args — re-fetches when args change:**

```svelte
<script lang="ts">
  let filter = $state("active");
  let limit = $state(10);

  const items = counterActor?.useActionQuery({
    action: "getItems",
    args: () => [filter, limit],   // re-fetches when filter or limit changes
    event: "itemsUpdated",
    initialValue: [],
  });
</script>

<select bind:value={filter}>
  <option value="active">Active</option>
  <option value="archived">Archived</option>
</select>

<p>{items?.value.length} items</p>
```

**Manual refetch:**

```typescript
const count = counterActor?.useActionQuery({
  action: "getCount",
  event: "newCount",
  initialValue: 0,
});

// Programmatically re-fetch at any time
count?.refetch();
```

**`useActionQuery` vs `useQuery` — when to use which:**

| | `useActionQuery` | `useQuery` |
|---|---|---|
| **Event data** | Ignored (just a signal) | Used directly via transform |
| **On event** | Re-calls the action | Merges event payload into value |
| **Args** | Reactive (re-fetches on change) | Static |
| **Transform** | Not needed | Optional (default: shallow merge) |
| **Best for** | Most use-cases | High-frequency events where refetch would be wasteful |
| **Refetch** | `.refetch()` available | Not available |

### SvelteKit Exports (`@blujosi/rivetkit-svelte/sveltekit`)

#### `createRivetKitHandler(opts)`

Creates SvelteKit request handlers for all HTTP methods. Every incoming request to the catch-all route is forwarded to the RivetKit registry handler.

```typescript
import { createRivetKitHandler } from "@blujosi/rivetkit-svelte/sveltekit";

export const { GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS } =
  createRivetKitHandler({ isDev: true, registry, rivetSiteUrl: "http://localhost:5173" });
```

**Options:**

| Option | Type | Description |
|---|---|---|
| `registry` | `Registry` | Your RivetKit registry instance |
| `isDev` | `boolean` | Enables auto-engine spawn and runner pool config |
| `rivetSiteUrl` | `string?` | Base URL for the site. Falls back to `PUBLIC_RIVET_ENDPOINT` env var |
| `headers` | `Record<string, string>?` | Static headers added to **every** request sent to the registry handler |
| `getHeaders` | `(event: RequestEvent) => Record<string, string>?` | Dynamic per-request headers. Receives the full SvelteKit `RequestEvent` |

#### Passing Custom Headers (Authentication, JWT Tokens, etc.)

The `headers` and `getHeaders` options let you inject headers into every request forwarded to your RivetKit actors. This is essential for passing JWT tokens, session IDs, or any other authentication data from your SvelteKit application to your actors so they can verify and authorize requests.

Since `getHeaders` receives the full SvelteKit `RequestEvent`, you have access to `locals`, `cookies`, `url`, `params`, and anything else set by your hooks or middleware — making it the ideal place to forward auth context.

**Pass a JWT token from `locals` (set by your auth hook):**

```typescript
// src/routes/api/rivet/[...rest]/+server.ts
import { createRivetKitHandler } from "@blujosi/rivetkit-svelte/sveltekit";
import { dev } from "$app/environment";
import { registry } from "$backend/registry";

export const { GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS } =
  createRivetKitHandler({
    isDev: !!dev,
    registry,
    rivetSiteUrl: "http://localhost:5173",
    // Forward auth token from locals (populated in hooks.server.ts)
    getHeaders: (event) => ({
      "x-app-token": event.locals.token ?? "",
    }),
  });
```

Your actors can then read `x-app-token` from the incoming request headers to authenticate and authorize the caller.

**Combine static and dynamic headers:**

```typescript
createRivetKitHandler({
  isDev: !!dev,
  registry,
  rivetSiteUrl: "http://localhost:5173",
  // Static headers — same on every request
  headers: {
    "x-api-version": "2",
    "x-app-name": "my-app",
  },
  // Dynamic headers — per-request, from SvelteKit locals/cookies
  getHeaders: (event) => ({
    "x-app-token": event.locals.token ?? "",
    "x-user-id": event.locals.user?.id ?? "",
    "x-session-id": event.cookies.get("session_id") ?? "",
  }),
});
```

Static `headers` are applied first, then `getHeaders` — so dynamic headers can override static ones if they share the same key. Both are set on **every** request that passes through the handler.

---

## SSR → Live Query Transport

`@blujosi/rivetkit-svelte` supports server-side rendering of actor data that seamlessly upgrades to live WebSocket subscriptions on the client — **zero loading flash, instant first paint, then real-time forever.**

This uses SvelteKit's built-in [`transport` hook](https://svelte.dev/docs/kit/hooks#Universal-hooks-transport) to serialize actor query results across the SSR boundary.

### How it works

1. **`rivetLoad()`** in your `+page.ts` load function calls an actor action via stateless HTTP on the server
2. SvelteKit's `transport` hook serializes the result across the SSR boundary
3. On the client, `transport.decode` creates a live WebSocket subscription with the SSR data as initial state
4. On client-side navigation, `rivetLoad()` detects the browser and creates the subscription directly
5. Events from the actor push updates to the reactive query — no manual refresh needed

### Setup

#### 1. Add the transport hook

```typescript
// src/hooks.ts
import { encodeRivetLoad, decodeRivetLoad } from "@blujosi/rivetkit-svelte/sveltekit"
import { rivetClient } from "$lib/actor.client"

export const transport = {
  RivetLoadResult: {
    encode: (value) => encodeRivetLoad(value),
    decode: (encoded) => decodeRivetLoad(encoded, rivetClient),
  },
}
```

#### 2. Use `rivetLoad()` in your load function

```typescript
// src/routes/+page.ts
import { rivetLoad } from "@blujosi/rivetkit-svelte/sveltekit"
import { rivetClient } from "$lib/actor.client"

export const load = async () => ({
  count: await rivetLoad(rivetClient, {
    actor: 'counter',
    key: ['test-counter'],
    action: 'getCount',
    event: 'newCount',
  })
})
```

#### 3. Use the data in your component

```svelte
<!-- src/routes/+page.svelte -->
<script lang="ts">
  let { data } = $props()

  // data.count is already a reactive RivetQueryResult
  // It has SSR data immediately, then upgrades to live updates
  const count = $derived(data.count.data)
</script>

{#if data.count.isLoading}
  <p>Loading...</p>
{:else}
  <h1>Counter: {count}</h1>
{/if}
```

That's it. The page renders with SSR data on first paint, SvelteKit preloads on link hover, and then the actor connection keeps data live in real-time.

### `rivetLoad(client, options)`

Fetch actor data for use in SvelteKit load functions. Dual-mode:

- **Server (SSR):** calls the action via stateless HTTP, wraps result for transport
- **Client (navigation):** calls action for initial data, then creates a live subscription immediately

```typescript
const result = await rivetLoad(rivetClient, {
  actor: 'counter',
  key: ['test-counter'],
  action: 'getCount',
  event: 'newCount',
  args: [],                         // optional action arguments
  params: { authToken: 'jwt-...' }, // optional connection params
  transform: (current, incoming) => incoming, // optional transform
})
```

**Options:**

| Option | Type | Description |
|---|---|---|
| `actor` | `string` | Actor name from your registry |
| `key` | `string \| string[]` | Unique key for the actor instance |
| `action` | `string` | Action name to call for the initial value |
| `event` | `string \| string[]` | Event name(s) to subscribe to for live updates |
| `args` | `unknown[]?` | Optional arguments passed to the action |
| `params` | `Record<string, string>?` | Optional connection parameters |
| `createInRegion` | `string?` | Region to create the actor in |
| `createWithInput` | `unknown?` | Input data for actor creation |
| `transform` | `(current: T, incoming: unknown) => T?` | Transform incoming event data. Default: full replacement |

**Returns:** `RivetQueryResult<T>` — a reactive object with:

| Property | Type | Description |
|---|---|---|
| `data` | `T \| undefined` | The current value |
| `isLoading` | `boolean` | `true` while loading |
| `error` | `Error \| undefined` | Error, if any |
| `isConnected` | `boolean` | Whether the live connection is active |

### `encodeRivetLoad(value)` / `decodeRivetLoad(encoded, client, transform?)`

Transport encode/decode functions for `src/hooks.ts`. Wire them into SvelteKit's `transport` hook to enable SSR → live query upgrade.

```typescript
// src/hooks.ts
import { encodeRivetLoad, decodeRivetLoad } from "@blujosi/rivetkit-svelte/sveltekit"
import { rivetClient } from "$lib/actor.client"

export const transport = {
  RivetLoadResult: {
    encode: (value) => encodeRivetLoad(value),
    decode: (encoded) => decodeRivetLoad(encoded, rivetClient),
  },
}
```

> **Note:** `decodeRivetLoad` accepts an optional third argument `transform` if you need to customize how event data is applied. By default, incoming event data fully replaces the current value.

### Multiple queries in one load

```typescript
// src/routes/+page.ts
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
```

### Using with `useActor` for mutations

SSR data gives you read access. For mutations (calling actions that change state), combine with `useActor`:

```svelte
<script lang="ts">
  import { useActor } from "$lib";

  let { data } = $props();

  // Read: SSR data with live updates
  const count = $derived(data.count.data);

  // Write: useActor for action calls
  const counterActor = useActor?.({
    name: "counter",
    key: ["test-counter"],
  });

  const increment = async () => {
    await counterActor?.current?.connection?.increment(1);
  };
</script>

<h1>Counter: {count}</h1>
<button onclick={increment}>Increment</button>
```

---

## Common Pitfalls

### Don't call `useActor` inside `onMount`

`useActor` uses `$effect` runes internally. Runes must be initialized during synchronous component setup, not in deferred callbacks.

```typescript
// BAD
onMount(() => {
  const actor = useActor({ name: "counter", key: ["test"] });
});

// GOOD
const actor = browser
  ? useActor({ name: "counter", key: ["test"] })
  : undefined;
```

### Don't call `useEvent` inside `$effect`

`useEvent` manages its own internal effects. Wrapping it in another `$effect` causes duplicate listeners and broken state.

```typescript
// BAD
$effect(() => {
  actor?.useEvent("newCount", (x) => { count = x; });
});

// GOOD
actor?.useEvent("newCount", (x) => { count = x; });
```

### Don't call `.connect()` on the connection

The connection is automatically managed by `useActor`. Calling `.connect()` sends an RPC action named "connect" to your actor, which doesn't exist.

```typescript
// BAD
await actor?.current?.connection?.connect();

// GOOD — just call actions directly
await actor?.current?.connection?.increment(1);
```

---

## License

MIT

---

Inspired by the Rivet core implementation for React and Next.js.
