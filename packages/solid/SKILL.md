# @blujosi/rivetkit-solid — Agent Skill

> SolidJS integration for [RivetKit](https://rivet.dev). Reactive actor connections via signals, SolidStart handler for serverless deployment, and SSR → live query transport.

## Package entry points

| Import path | Purpose |
|---|---|
| `@blujosi/rivetkit-solid` | Client-side: `createClient`, `createRivetKit`, `createRivetKitWithClient`, `useActor` |
| `@blujosi/rivetkit-solid/solidstart` | Server + SSR: `createRivetKitHandler`, `rivetLoad`, `encodeRivetLoad`, `decodeRivetLoad` |

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
import { createClient } from "@blujosi/rivetkit-solid";
import type { Registry } from "~backend/registry";

const client = createClient<Registry>("http://localhost:3000/api/rivet");
```

### `createRivetKitWithClient<Registry>(client)`
Creates the `useActor` hook from an existing client.

```ts
import { createClient, createRivetKitWithClient } from "@blujosi/rivetkit-solid";
const client = createClient<Registry>(url);
export const { useActor } = createRivetKitWithClient(client);
```

### `createRivetKit<Registry>(url)`
Shorthand — creates both client and `useActor` in one call.

```ts
import { createRivetKit } from "@blujosi/rivetkit-solid";
export const { useActor } = createRivetKit<Registry>("http://localhost:3000/api/rivet");
```

### `useActor(options)`
Connects to a RivetKit actor. Returns reactive state + event/query helpers.
Uses SolidJS fine-grained reactivity (signals, effects).

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
Registers an event listener with automatic cleanup via `onCleanup`.

```ts
actor?.useEvent("newCount", (value: number) => {
  setCount(value);
});
```

### `useQuery(opts)`
Reactive query — fetches initial value via action, then subscribes to event for live updates.

```ts
const count = actor?.useQuery({
  action: "getCount",
  event: "newCount",
  initialValue: 0,
  args: [],
  transform: (current, incoming) => incoming,
});
// count?.value, count?.isLoading, count?.error
```

### `useActionQuery(opts)`
Reactive query — fetches via action, re-fetches when event fires. Event data is ignored (pure invalidation signal). **Recommended for most use cases.**

```ts
const count = actor?.useActionQuery({
  action: "getCount",
  event: "newCount",
  initialValue: 0,
  args: () => [filter, limit], // optional reactive args (Accessor)
});
// count?.value, count?.isLoading, count?.error, count?.refetch()
```

---

## SolidStart handler

### `createRivetKitHandler(opts)`
Creates SolidStart request handlers for a catch-all API route.

```ts
// src/routes/api/rivet/[...rest].ts
import { createRivetKitHandler } from "@blujosi/rivetkit-solid/solidstart";
import { registry } from "~backend/registry";

export const { GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS } =
  createRivetKitHandler({
    isDev: import.meta.env.DEV,
    registry,
    rivetSiteUrl: "http://localhost:3000",
  });
```

---

## SSR support

### `rivetLoad(client, options)`
Fetch actor data for SSR, auto-upgrades to live subscription on the client.

```ts
const count = await rivetLoad(rivetClient, {
  actor: "counter",
  key: ["test-counter"],
  action: "getCount",
  event: "newCount",
});
// count.data() — Accessor<T>
// count.isLoading() — Accessor<boolean>
```

---

## Key differences from Svelte version

| Svelte (`@blujosi/rivetkit-svelte`) | Solid (`@blujosi/rivetkit-solid`) |
|---|---|
| `$state` runes | `createSignal` |
| `$effect` | `createEffect` + `onCleanup` |
| `$derived` | `createMemo` |
| `$effect.root` | `createRoot` |
| `query.value` (getter) | `query.value` (getter, backed by signal) |
| SvelteKit `transport` hook | Direct signal upgrade on hydration |
| `browser` from `$app/environment` | `typeof document !== 'undefined'` |

## Client setup pattern

```ts
// src/lib/actor.client.ts
import { createClient, createRivetKitWithClient } from "@blujosi/rivetkit-solid";
import type { Registry } from "~backend/registry";

const IS_BROWSER = typeof globalThis.document !== "undefined";
const endpoint = IS_BROWSER
  ? `${location.origin}/api/rivet`
  : "http://localhost:3000/api/rivet";

export const rivetClient = createClient<Registry>(endpoint);
const { useActor } = createRivetKitWithClient(rivetClient);
export { useActor };
```

## Common pitfalls

1. **Don't destructure props** — SolidJS props are reactive getters. Destructuring loses reactivity.

2. **Don't call `.connect()` on the connection** — connections are auto-managed.

3. **`useQuery` vs `useActionQuery`** — prefer `useActionQuery` for most cases. Use `useQuery` only when you need to use event payloads directly.

4. **SSR client endpoint** — the client must resolve to a valid URL on both server and browser.

---

## File structure (typical SolidStart app)

```
src/
  lib/
    actor.client.ts                 # client + useActor setup
  routes/
    api/rivet/[...rest].ts          # SolidStart handler
    index.tsx                       # component using reactive data
    ssr.tsx                         # SSR page with rivetLoad
backend/
  registry.ts                       # actor definitions + registry
```
