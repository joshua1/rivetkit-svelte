# RivetKit Svelte Example

A working example of [`@blujosi/rivetkit-svelte`](../svelte) — a real-time counter app built with SvelteKit and RivetKit actors.

## What This Demonstrates

- Defining RivetKit actors with state, actions, and broadcast events
- Serving RivetKit serverless through a SvelteKit catch-all API route
- Connecting to actors from Svelte 5 components using `useActor`
- Using `useQuery` to fetch initial state and subscribe to real-time updates
- Listening for real-time events with `useEvent`
- Calling actor actions through the reactive connection

## Project Structure

```
backend/
  registry.ts          # Actor definitions and registry setup
src/
  lib/
    actor.client.ts    # RivetKit client setup (browser-only)
  routes/
    +page.svelte       # Counter UI with increment/reset buttons
    api/
      rivet/
        [...rest]/
          +server.ts   # SvelteKit handler proxying to RivetKit
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm

### Install & Run

```sh
# From the monorepo root
pnpm install

# Build the library first
cd packages/svelte && pnpm run build

# Run the example
cd packages/examples && pnpm run dev
```

Open [http://localhost:5173](http://localhost:5173) to see the counter app.

## How It Works

### Backend — Actor Definition

[`backend/registry.ts`](backend/registry.ts) defines a `counter` actor with two counters, getter actions, and mutating actions:

```typescript
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

export const registry = setup({ use: { counter } });
export type Registry = typeof registry;
```

Getter actions like `getCount` and `getCountDouble` are used by `useQuery` to fetch the initial value when connecting.

### SvelteKit Handler

[`src/routes/api/rivet/[...rest]/+server.ts`](src/routes/api/rivet/[...rest]/+server.ts) creates a catch-all route that passes all `/api/rivet/*` requests to the RivetKit registry:

```typescript
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

### Client Setup

[`src/lib/actor.client.ts`](src/lib/actor.client.ts) creates the RivetKit client with a browser guard for SSR safety:

```typescript
import { createClient, createRivetKitWithClient } from "@blujosi/rivetkit-svelte";
import { browser } from "$app/environment";
import type { Registry } from "$backend/registry";

export const getRivetClient = () => {
  if (!browser) return { useActor: () => {} };

  const origin = `${location.origin}/api/rivet`;
  const rivetClient = createClient<Registry>(origin);
  const { useActor } = createRivetKitWithClient(rivetClient);

  return { rivetClient, useActor };
};
```

### Svelte Component

[`src/routes/+page.svelte`](src/routes/+page.svelte) uses `useActor` and `useQuery` to connect, fetch initial state, and subscribe to real-time updates:

```svelte
<script lang="ts">
  import { getRivetClient } from "../lib/actor.client";
  import { browser } from "$app/environment";

  const { useActor } = getRivetClient();
  const counterActor = browser
    ? useActor({ name: "counter", key: ["test-counter"] })
    : undefined;

  // useQuery: fetches initial value via action + subscribes to event for updates
  const count = counterActor?.useQuery({
    action: "getCount",
    event: "newCount",
    initialValue: 0,
  });

  const countDouble = counterActor?.useQuery({
    action: "getCountDouble",
    event: "newDoubleCount",
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

<div>
  <h1>Counter: {count?.value ?? 0}</h1>
  <button onclick={increment}>Increment</button>
  <button onclick={reset}>Reset</button>

  <h1>Counter 2: {countDouble?.value ?? 0}</h1>
  <button onclick={doubleCountClick}>Double Count</button>
</div>
```

`useQuery` returns a reactive object with:
- `value` — the current value (initial fetch + event updates)
- `isLoading` — `true` until the initial action resolves
- `error` — any error from the action call

## Scripts

| Script | Description |
|---|---|
| `pnpm dev` | Start the SvelteKit dev server |
| `pnpm build` | Build for production |
| `pnpm preview` | Preview the production build |
| `pnpm check` | Run type checking |
