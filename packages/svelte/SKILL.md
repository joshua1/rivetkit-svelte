# @blujosi/rivetkit-svelte — Agent Skill

> Svelte 5 integration for [RivetKit](https://rivet.dev). Reactive actor connections via runes, SvelteKit handler for serverless deployment, and SSR → live query transport.

## Package entry points

| Import path | Purpose |
|---|---|
| `@blujosi/rivetkit-svelte` | Client-side: `createClient`, `createRivetKit`, `createRivetKitWithClient`, `useActor` |
| `@blujosi/rivetkit-svelte/sveltekit` | Server + SSR: `createRivetKitHandler`, `rivetLoad`, `encodeRivetLoad`, `decodeRivetLoad` |

## Core concepts

### Actor model
RivetKit actors are persistent, stateful server-side entities. Each actor has:
- **Actions** — stateless HTTP calls (request/response)
- **Events** — real-time WebSocket broadcasts to subscribed clients
- **State** — persisted per-instance, keyed by `name` + `key`

### Registry
A `registry` defines all available actors. Created via `setup({ use: { counter, chat, ... } })` from `rivetkit`. The `Registry` type flows through the entire system for type safety.

### Client
`Client<Registry>` is the typed RivetKit client. Created via `createClient<Registry>(endpoint)`. Works on both server and browser.

---

## API reference

### `createClient<Registry>(url)`
Creates a typed RivetKit client.

```ts
import { createClient } from "@blujosi/rivetkit-svelte";
import type { Registry } from "$backend/registry";

const client = createClient<Registry>("http://localhost:5173/api/rivet");
```

### `createRivetKitWithClient<Registry>(client)`
Creates the `useActor` hook from an existing client.

```ts
import { createClient, createRivetKitWithClient } from "@blujosi/rivetkit-svelte";
const client = createClient<Registry>(url);
export const { useActor } = createRivetKitWithClient(client);
```

### `createRivetKit<Registry>(url)`
Shorthand — creates both client and `useActor` in one call.

```ts
import { createRivetKit } from "@blujosi/rivetkit-svelte";
export const { useActor } = createRivetKit<Registry>("http://localhost:5173/api/rivet");
```

### `useActor(options)`
Connects to a RivetKit actor. Returns reactive state + event/query helpers. **Must be called at top-level of component script** (not inside `onMount`, `$effect`, or callbacks).

```ts
const actor = useActor({
  name: "counter",
  key: ["test-counter"],
  params: {},              // optional connection params
  createInRegion: "us-east-1", // optional
  createWithInput: {},     // optional
  enabled: true,           // optional, default true
});
```

**Returned object:**

| Property/Method | Description |
|---|---|
| `actor.current.connection` | Call actions: `actor.current.connection?.increment(1)` |
| `actor.current.handle` | Low-level actor handle |
| `actor.current.isConnected` | `boolean` — connection status |
| `actor.current.isConnecting` | `boolean` — connecting in progress |
| `actor.current.isError` | `boolean` — error state |
| `actor.current.error` | `Error \| null` |
| `actor.useEvent(name, handler)` | Subscribe to actor events (auto-cleanup) |
| `actor.useQuery(opts)` | Live query: initial fetch + event-driven updates |
| `actor.useActionQuery(opts)` | Action query: refetches on event (event = invalidation signal) |

### `useEvent(eventName, handler)`
Registers an event listener. **Call at top-level, not inside `$effect`.**

```ts
actor?.useEvent("newCount", (value: number) => {
  count = value;
});
```

### `useQuery(opts)`
Reactive query — fetches initial value via action, then subscribes to event for live updates.

```ts
const count = actor?.useQuery({
  action: "getCount",
  event: "newCount",
  initialValue: 0,
  args: [],                // optional
  transform: (current, incoming) => incoming, // optional
});
// count?.value, count?.isLoading, count?.error
```

**Default transform:** shallow merge for objects, full replacement for primitives/arrays.

### `useActionQuery(opts)`
Reactive query — fetches via action, re-fetches when event fires. Event data is **ignored** (pure invalidation signal). **Recommended for most use cases.**

```ts
const count = actor?.useActionQuery({
  action: "getCount",
  event: "newCount",         // or ["newCount", "countReset"]
  initialValue: 0,
  args: () => [filter, limit], // optional reactive args
});
// count?.value, count?.isLoading, count?.error, count?.refetch()
```

**`useActionQuery` vs `useQuery`:**
- `useActionQuery` — event triggers action re-call, simpler, always consistent with server state
- `useQuery` — event data is used directly via transform, better for high-frequency updates

---

## SvelteKit handler

### `createRivetKitHandler(opts)`
Creates SvelteKit request handlers for a catch-all API route.

```ts
// src/routes/api/rivet/[...rest]/+server.ts
import { createRivetKitHandler } from "@blujosi/rivetkit-svelte/sveltekit";
import { dev } from "$app/environment";
import { registry } from "$backend/registry";

export const { GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS } =
  createRivetKitHandler({
    isDev: !!dev,
    registry,
    rivetSiteUrl: "http://localhost:5173",
    headers: { "x-api-version": "2" },               // optional static headers
    getHeaders: (event) => ({                         // optional dynamic headers
      "x-app-token": event.locals.token ?? "",
    }),
  });
```

**Options:**

| Option | Type | Description |
|---|---|---|
| `registry` | `Registry<any>` | Your RivetKit registry |
| `isDev` | `boolean` | Auto-starts engine, configures runner pool |
| `rivetSiteUrl` | `string?` | Base URL of the site |
| `headers` | `Record<string, string>?` | Static headers on every request |
| `getHeaders` | `(event: RequestEvent) => Record<string, string>?` | Dynamic per-request headers |

---

## SSR → Live query transport

Server-render actor data that upgrades to live WebSocket on the client. Zero loading flash.

### How it works
1. `rivetLoad()` in `+page.ts` calls actor action via HTTP during SSR
2. SvelteKit `transport` hook serializes the result across the SSR boundary
3. On client, `transport.decode` upgrades to a live WebSocket subscription
4. On client-side navigation, `rivetLoad()` creates the subscription directly
5. Events push live updates — no polling

### Setup

**1. Transport hook (`src/hooks.ts`):**

```ts
import { encodeRivetLoad, decodeRivetLoad } from "@blujosi/rivetkit-svelte/sveltekit";
import { rivetClient } from "$lib/actor.client";

export const transport = {
  RivetLoadResult: {
    encode: (value) => encodeRivetLoad(value),
    decode: (encoded) => decodeRivetLoad(encoded, rivetClient),
  },
};
```

**2. Load function (`+page.ts`):**

```ts
import { rivetLoad } from "@blujosi/rivetkit-svelte/sveltekit";
import { rivetClient } from "$lib/actor.client";

export const load = async () => ({
  count: await rivetLoad(rivetClient, {
    actor: "counter",
    key: ["test-counter"],
    action: "getCount",
    event: "newCount",
  }),
});
```

**3. Component (`+page.svelte`):**

```svelte
<script lang="ts">
  let { data } = $props();
  const count = $derived(data.count.data);
</script>

{#if data.count.isLoading}
  <p>Loading...</p>
{:else}
  <h1>Counter: {count}</h1>
{/if}
```

### `rivetLoad(client, options)`

| Option | Type | Description |
|---|---|---|
| `actor` | `string` | Actor name from registry |
| `key` | `string \| string[]` | Actor instance key |
| `action` | `string` | Action to call for initial data |
| `event` | `string \| string[]` | Event(s) for live updates |
| `args` | `unknown[]?` | Action arguments |
| `params` | `Record<string, string>?` | Connection params |
| `transform` | `(current, incoming) => T?` | Custom update transform |

**Returns:** `RivetQueryResult<T>` — `{ data, isLoading, error, isConnected }`

### `encodeRivetLoad(value)` / `decodeRivetLoad(encoded, client, transform?)`
Transport encode/decode for `src/hooks.ts`. Decode accepts optional `transform` third argument.

---

## Client setup pattern

```ts
// src/lib/actor.client.ts
import { createClient, createRivetKitWithClient } from "@blujosi/rivetkit-svelte";
import type { Client } from "rivetkit/client";
import { browser } from "$app/environment";
import type { Registry } from "$backend/registry";
import { PUBLIC_APP_URL } from "$env/static/public";

const endpoint = browser
  ? `${location.origin}/api/rivet`
  : `${PUBLIC_APP_URL ?? "http://localhost:5173"}/api/rivet`;

export const rivetClient: Client<Registry> = createClient<Registry>(endpoint);
const { useActor } = createRivetKitWithClient(rivetClient);
export { useActor };
```

> **Important:** `useActor` must only be called in the browser. Guard with `browser` check in components.

---

## Common pitfalls

1. **Don't call `useActor` inside `onMount`** — runes need synchronous component setup:
   ```ts
   // BAD:  onMount(() => { const a = useActor(...) })
   // GOOD: const a = browser ? useActor(...) : undefined
   ```

2. **Don't call `useEvent` inside `$effect`** — it manages its own effects internally. Wrapping it causes duplicate listeners.

3. **Don't call `.connect()` on the connection** — connections are auto-managed. `.connect()` would send an RPC action named "connect" to the actor.

4. **`useQuery` vs `useActionQuery`** — prefer `useActionQuery` for most cases. Use `useQuery` only when you need to use event payloads directly (high-frequency updates).

5. **SSR client endpoint** — the client must resolve to a valid URL on both server and browser. Use `PUBLIC_APP_URL` env var for the server-side fallback.

6. **Transport hook required for SSR** — `rivetLoad()` results must pass through the `transport` hook in `src/hooks.ts` to upgrade to live subscriptions on the client.

---

## File structure (typical SvelteKit app)

```
src/
  hooks.ts                          # transport hook for SSR
  lib/
    actor.client.ts                 # client + useActor setup
  routes/
    api/rivet/[...rest]/+server.ts  # SvelteKit handler
    +page.ts                        # load function with rivetLoad()
    +page.svelte                    # component using reactive data
backend/
  registry.ts                       # actor definitions + registry
```
