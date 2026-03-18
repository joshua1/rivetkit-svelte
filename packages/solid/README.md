# @blujosi/rivetkit-solid

A SolidJS integration for [RivetKit](https://rivet.dev) that provides reactive actor connections using SolidJS signals, a Provider/Context architecture for SSR-safe client injection, and a SolidStart handler for serverless deployment.

## Installation

```bash
pnpm add @blujosi/rivetkit-solid rivetkit

# or

npm i @blujosi/rivetkit-solid rivetkit
```

## Overview

`@blujosi/rivetkit-solid` provides three main pieces:

1. **SolidJS client** (`@blujosi/rivetkit-solid`) — `RivetProvider`, `useActorFromContext`, and `useActor` hook for reactive actor connections with real-time events
2. **SolidStart handler** (`@blujosi/rivetkit-solid/solidstart`) — `createRivetKitHandler` to serve RivetKit as a SolidStart API route
3. **SSR transport** (`@blujosi/rivetkit-solid/solidstart`) — `useRivetQuery` for server-fetched data that upgrades to live subscriptions on the client

## Features

- **Provider + Context** — SSR-safe client injection via `<RivetProvider>`, no module-level singletons
- **SolidJS Signals** — Built on `createSignal`, `createEffect`, `createResource`, and getter-based reactivity
- **Real-time Actor Connections** — Connect to RivetKit actors with automatic state sync via WebSocket
- **SSR → Live Upgrade** — `useRivetQuery` uses `createResource` for automatic SSR serialization, then upgrades to live WebSocket on the client
- **Event Handling** — `useEvent` with automatic cleanup via `onCleanup`
- **Type Safety** — Full TypeScript support with registry type inference
- **SolidStart Handler** — Run RivetKit serverless inside your SolidStart app

## Package Entry Points

| Import path | Purpose |
|---|---|
| `@blujosi/rivetkit-solid` | Client-side: `RivetProvider`, `useRivet`, `useActorFromContext`, `createClient`, `createRivetKit`, `createRivetKitWithClient` |
| `@blujosi/rivetkit-solid/solid` | SolidJS-specific: full client exports (re-exported from main) |
| `@blujosi/rivetkit-solid/solidstart` | Server + SSR: `createRivetKitHandler`, `useRivetQuery`, `createRivetQuery` |

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

### 2. Set Up the SolidStart Handler

Create a catch-all API route to proxy RivetKit requests through SolidStart:

```typescript
// src/routes/api/rivet/[...rest].ts
import { createRivetKitHandler } from "@blujosi/rivetkit-solid/solidstart";
import { registry } from "~backend/registry";

export const { GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS } =
  createRivetKitHandler({
    isDev: !!import.meta.env.DEV,
    registry,
    rivetSiteUrl: "http://localhost:3000",
  });
```

#### Handler Options

| Option | Type | Description |
|---|---|---|
| `registry` | `Registry` | Your RivetKit registry instance |
| `isDev` | `boolean` | Enables auto-engine spawn and runner pool config |
| `rivetSiteUrl` | `string` | Base URL for the site |
| `headers` | `Record<string, string>?` | Static headers added to every request |
| `getHeaders` | `(request: Request) => Record<string, string>?` | Dynamic per-request headers |

### 3. Create the Client & Wrap with Provider

```typescript
// src/lib/actor.client.ts
import { createClient } from "@blujosi/rivetkit-solid";
import type { Client } from "rivetkit/client";
import type { Registry } from "~backend/registry";

const IS_BROWSER = typeof globalThis.document !== "undefined";

const endpoint = IS_BROWSER
  ? `${location.origin}/api/rivet`
  : "http://localhost:3000/api/rivet";

export const rivetClient: Client<Registry> = createClient<Registry>(endpoint);
```

Then wrap your app with `<RivetProvider>`:

```tsx
// src/app.tsx
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { RivetProvider } from "@blujosi/rivetkit-solid";
import { rivetClient } from "~/lib/actor.client";

export default function App() {
  return (
    <RivetProvider client={rivetClient}>
      <Router root={(props) => <>{props.children}</>}>
        <FileRoutes />
      </Router>
    </RivetProvider>
  );
}
```

### 4. Use Actors in Components (Client-Side)

Use `useActorFromContext` — it pulls the client from the provider automatically:

```tsx
// src/routes/index.tsx
import { useActorFromContext } from "@blujosi/rivetkit-solid";
import { Show } from "solid-js";

export default function Home() {
  const counterActor = useActorFromContext({
    name: "counter",
    key: ["test-counter"],
  });

  const countQuery = counterActor?.useActionQuery({
    action: "getCount",
    event: "newCount",
    initialValue: 0,
  });

  const increment = async () => {
    await counterActor?.current?.connection?.increment(1);
  };
  const reset = async () => {
    await counterActor?.current?.connection?.reset();
  };

  return (
    <Show
      when={!countQuery?.isLoading}
      fallback={<p>Loading...</p>}
    >
      <div>
        <h1>Counter: {countQuery?.value}</h1>
        <button onClick={increment}>Increment</button>
        <button onClick={reset}>Reset</button>
      </div>
    </Show>
  );
}
```

### 5. SSR with Live Upgrade

Use `useRivetQuery` to fetch actor data server-side and automatically upgrade to live WebSocket subscriptions on the client:

```tsx
// src/routes/ssr.tsx
import { Suspense } from "solid-js";
import { useRivetQuery } from "@blujosi/rivetkit-solid/solidstart";
import { useActorFromContext } from "@blujosi/rivetkit-solid";

export default function SSRPage() {
  // SSR queries — data fetched server-side, auto-upgraded to live on client
  const count = useRivetQuery<number>({
    actor: "counter",
    key: ["test-counter"],
    action: "getCount",
    event: "newCount",
  });

  const countDouble = useRivetQuery<number>({
    actor: "counter",
    key: ["test-counter"],
    action: "getCountDouble",
    event: "newDoubleCount",
  });

  // Actor connection for calling mutations
  const counterActor = useActorFromContext({
    name: "counter",
    key: ["test-counter"],
  });

  const increment = async () => {
    await counterActor?.current?.connection?.increment(1);
  };
  const reset = async () => {
    await counterActor?.current?.connection?.reset();
  };

  return (
    <div>
      <h2>SSR + Live Counter Demo</h2>
      <Suspense fallback={<p>Loading...</p>}>
        <div>
          <h1>Counter: {count.data()}</h1>
          <button onClick={increment}>Increment</button>
          <button onClick={reset}>Reset</button>

          <h1>Counter 2: {countDouble.data()}</h1>
        </div>
      </Suspense>
    </div>
  );
}
```

**How SSR → Live works:**
1. On the **server**, `useRivetQuery` uses `createResource` to call the action — SolidStart serializes the result automatically
2. On the **client** (hydration), a `createEffect` waits for the resource to resolve, then creates a live WebSocket subscription
3. `onCleanup` disconnects the WebSocket and unsubscribes events when the component unmounts
4. The returned `RivetQueryResult<T>` exposes reactive accessors (`data()`, `isLoading()`, `error()`, `isConnected()`, `refetch()`)

---

## API Reference

### Provider & Context (`@blujosi/rivetkit-solid`)

#### `<RivetProvider client={client}>`

Provides the RivetKit client to all descendant components via SolidJS context. Required for `useActorFromContext` and `useRivetQuery`.

```tsx
import { RivetProvider } from "@blujosi/rivetkit-solid";

<RivetProvider client={rivetClient}>
  {/* All children can use useActorFromContext and useRivetQuery */}
</RivetProvider>
```

| Prop | Type | Description |
|---|---|---|
| `client` | `Client<any>` | The RivetKit client instance |

#### `useRivet<Registry>()`

Returns the RivetKit context value (`{ client }`). Throws if called outside a `<RivetProvider>`.

```typescript
import { useRivet } from "@blujosi/rivetkit-solid";
const { client } = useRivet<Registry>();
```

#### `useActorFromContext(options)`

Connects to a RivetKit actor using the client from `<RivetProvider>`. Returns the same API as `useActor`.

```typescript
import { useActorFromContext } from "@blujosi/rivetkit-solid";

const actor = useActorFromContext({
  name: "counter",
  key: ["test-counter"],
});
```

---

### Client Exports (`@blujosi/rivetkit-solid`)

#### `createClient<Registry>(url)`

Creates a RivetKit client connection.

```typescript
import { createClient } from "@blujosi/rivetkit-solid";
const client = createClient<Registry>("http://localhost:3000/api/rivet");
```

#### `createRivetKit<Registry>(url, opts?)`

Shorthand that creates both the client and the `useActor` hook.

```typescript
import { createRivetKit } from "@blujosi/rivetkit-solid";
export const { useActor } = createRivetKit<Registry>("http://localhost:3000/api/rivet");
```

#### `createRivetKitWithClient<Registry>(client, opts?)`

Creates the `useActor` hook from an existing client instance.

```typescript
import { createClient, createRivetKitWithClient } from "@blujosi/rivetkit-solid";
const client = createClient<Registry>(url);
export const { useActor } = createRivetKitWithClient(client);
```

---

### `useActor(options)`

Connects to a RivetKit actor and returns reactive state plus helper methods. Uses SolidJS signals internally for fine-grained reactivity.

```typescript
const actor = useActor({
  name: "counter",             // Actor name from your registry
  key: ["test-counter"],       // Unique key for this instance
  params: { /* ... */ },       // Optional connection parameters
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

---

### `useEvent(eventName, handler)`

Registers an event listener with automatic cleanup via `onCleanup`.

```typescript
counterActor?.useEvent("newCount", (value: number) => {
  console.log("Count updated:", value);
});
```

---

### `useQuery(options)`

Creates a reactive query that fetches an initial value by calling an actor action, then subscribes to an event to keep the value updated in real-time. The event **data** is used directly to update the value (optionally via a `transform` function).

```typescript
const count = counterActor?.useQuery({
  action: "getCount",
  event: "newCount",
  initialValue: 0,
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
| `value` | `T` | The current reactive value (getter backed by signal) |
| `isLoading` | `boolean` | `true` until the initial action resolves |
| `error` | `Error \| null` | Error from the action call, if any |

---

### `useActionQuery(options)`

Creates a reactive query that fetches a value by calling an actor action, then **re-fetches** whenever a specified event fires. Unlike `useQuery`, the event data is **not used** — it's purely an invalidation signal that triggers a fresh action call.

```typescript
const count = counterActor?.useActionQuery({
  action: "getCount",
  event: "newCount",
  initialValue: 0,
});
```

**Options:**

| Option | Type | Description |
|---|---|---|
| `action` | `string` | The action name to call (and re-call on event) |
| `args` | `Accessor<any[]>?` | Optional reactive accessor for arguments |
| `event` | `string \| string[]` | Event name(s) that trigger a re-fetch |
| `initialValue` | `T` | The value to use before the action resolves |

**Returns:**

| Property | Type | Description |
|---|---|---|
| `value` | `T` | The current reactive value (getter backed by signal) |
| `isLoading` | `boolean` | `true` during initial fetch and re-fetches |
| `error` | `Error \| null` | Error from the action call, if any |
| `refetch` | `() => void` | Manually trigger a re-fetch |

**When to use `useQuery` vs `useActionQuery`:**

| | `useQuery` | `useActionQuery` |
|---|---|---|
| Event data used? | Yes — event payload updates the value | No — event is just an invalidation signal |
| Re-fetches action? | No — only on initial connect | Yes — every time the event fires |
| Best for | Simple values broadcast via events | Computed/derived values that need a fresh server call |

---

### SolidStart Exports (`@blujosi/rivetkit-solid/solidstart`)

#### `createRivetKitHandler(opts)`

Creates SolidStart API route handlers for a catch-all route.

```typescript
import { createRivetKitHandler } from "@blujosi/rivetkit-solid/solidstart";
import { registry } from "~backend/registry";

export const { GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS } =
  createRivetKitHandler({
    isDev: !!import.meta.env.DEV,
    registry,
    rivetSiteUrl: "http://localhost:3000",
  });
```

---

#### `useRivetQuery<T>(options)` *(recommended)*

Fetches actor data with SSR support and automatic live upgrade. Uses `createResource` for SSR serialization and `createEffect` + `onCleanup` for live WebSocket upgrade. Must be called inside a component wrapped in `<RivetProvider>`.

```tsx
import { useRivetQuery } from "@blujosi/rivetkit-solid/solidstart";

const count = useRivetQuery<number>({
  actor: "counter",
  key: ["test-counter"],
  action: "getCount",
  event: "newCount",
});

// Access values via signal accessors
count.data()         // number | undefined
count.isLoading()    // boolean
count.error()        // Error | undefined
count.isConnected()  // boolean
count.refetch()      // manually re-fetch
```

#### `createRivetQuery<T>(client, options)`

Same as `useRivetQuery` but takes an explicit client — doesn't require `<RivetProvider>`.

```tsx
import { createRivetQuery } from "@blujosi/rivetkit-solid/solidstart";

const count = createRivetQuery<number>(myClient, {
  actor: "counter",
  key: ["test-counter"],
  action: "getCount",
  event: "newCount",
});
```

**Options (`RivetQueryOptions<T>`):**

| Option | Type | Description |
|---|---|---|
| `actor` | `string` | Actor name from the registry |
| `key` | `string \| string[]` | Unique key for the actor instance |
| `action` | `string` | Action name to call for the initial value |
| `args` | `unknown[]?` | Arguments to pass to the action |
| `event` | `string \| string[]` | Event name(s) to subscribe to for live updates |
| `params` | `Record<string, string>?` | Connection params (e.g. auth tokens) |
| `createInRegion` | `string?` | Region to create the actor in |
| `createWithInput` | `unknown?` | Input data for actor creation |
| `transform` | `(current: T, incoming: unknown) => T?` | Custom transform for incoming event data |

**`RivetQueryResult<T>` — return type:**

| Accessor | Type | Description |
|---|---|---|
| `data()` | `T \| undefined` | The current value (live data preferred over initial fetch) |
| `isLoading()` | `boolean` | Whether the initial resource is loading |
| `error()` | `Error \| undefined` | Any error from fetch or WebSocket |
| `isConnected()` | `boolean` | Whether the live WebSocket is connected |
| `refetch()` | `void` | Manually re-fetch the action value |

---

## Connection Parameters

You can pass `params` when connecting to actors — both via `useActorFromContext` and `useRivetQuery`. These are `Record<string, string>` values sent with the connection handshake, typically used for authentication:

```typescript
// Client-side via useActorFromContext
const actor = useActorFromContext({
  name: "counter",
  key: ["test-counter"],
  params: { token: "user-auth-token" },
});

// SSR via useRivetQuery
const count = useRivetQuery<number>({
  actor: "counter",
  key: ["test-counter"],
  action: "getCount",
  event: "newCount",
  params: { token: "user-auth-token" },
});
```

Inside the actor, params are available in the `onBeforeConnect` lifecycle (for validation/rejection) and on the connection context in actions:

```typescript
export const counter = actor({
  state: { count: 0 },

  onBeforeConnect: (c, params) => {
    if (!params.token || !isValidToken(params.token)) {
      throw new Error("Unauthorized");
    }
  },

  actions: {
    getCount: (c) => {
      const token = c.conn.params.token;
      return c.state.count;
    },
  },
});
```

---

## Project Structure

A typical SolidStart + RivetKit project looks like this:

```
├── backend/
│   └── registry.ts          # Actor definitions & registry
├── src/
│   ├── lib/
│   │   ├── actor.client.ts  # RivetKit client export
│   │   └── index.ts         # Re-exports
│   ├── routes/
│   │   ├── index.tsx         # Client-side page (useActorFromContext)
│   │   ├── ssr.tsx           # SSR page with useRivetQuery
│   │   └── api/
│   │       └── rivet/
│   │           └── [...rest].ts  # Catch-all RivetKit handler
│   ├── entry-client.tsx
│   ├── entry-server.tsx
│   └── app.tsx               # <RivetProvider> wraps the Router
├── app.config.ts             # SolidStart config
├── package.json
└── tsconfig.json
```

## TypeScript Configuration

Ensure your `tsconfig.json` includes Vite client types for `import.meta.env`:

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "preserve",
    "jsxImportSource": "solid-js",
    "types": ["vite/client"]
  }
}
```

## SolidStart Configuration

Example `app.config.ts` with path aliases for the backend directory:

```typescript
import { defineConfig } from "@solidjs/start/config";

export default defineConfig({
  server: {
    preset: "node-server",
  },
  vite: {
    resolve: {
      alias: {
        "~backend": "./backend",
      },
    },
  },
});
```
