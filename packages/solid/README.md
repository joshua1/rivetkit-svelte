# @blujosi/rivetkit-solid

A SolidJS integration for [RivetKit](https://rivet.dev) that provides reactive actor connections using SolidJS signals, plus a built-in SolidStart handler for serverless deployment and an SSR transport for server-loaded live queries.

## Installation

```bash
pnpm add @blujosi/rivetkit-solid rivetkit

# or

npm i @blujosi/rivetkit-solid rivetkit
```

## Overview

`@blujosi/rivetkit-solid` provides three main pieces:

1. **SolidJS client** (`@blujosi/rivetkit-solid`) — `useActor` hook for reactive actor connections with real-time events
2. **SolidStart handler** (`@blujosi/rivetkit-solid/solidstart`) — `createRivetKitHandler` to serve RivetKit as a SolidStart API route
3. **SSR transport** (`@blujosi/rivetkit-solid/solidstart`) — `rivetLoad` for server-fetched data that upgrades to live subscriptions on the client

## Features

- **SolidJS Signals** — Built on `createSignal`, `createEffect`, and getter-based reactivity
- **Real-time Actor Connections** — Connect to RivetKit actors with automatic state sync via WebSocket
- **Event Handling** — `useEvent` with automatic cleanup
- **Type Safety** — Full TypeScript support with registry type inference
- **SSR → Live Upgrade** — `rivetLoad` fetches data server-side, then upgrades to live subscriptions on the client
- **SolidStart Handler** — Run RivetKit serverless inside your SolidStart app

## Package Entry Points

| Import path | Purpose |
|---|---|
| `@blujosi/rivetkit-solid` | Client-side: `createClient`, `createRivetKit`, `createRivetKitWithClient` |
| `@blujosi/rivetkit-solid/solid` | SolidJS-specific: full client exports (re-exported from main) |
| `@blujosi/rivetkit-solid/solidstart` | Server + SSR: `createRivetKitHandler`, `rivetLoad`, `encodeRivetLoad`, `decodeRivetLoad` |

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

The handler automatically:
- Spawns the RivetKit engine in dev mode
- Configures the serverless runner pool
- Proxies requests to the registry's built-in handler

#### Handler Options

| Option | Type | Description |
|---|---|---|
| `registry` | `Registry` | Your RivetKit registry instance |
| `isDev` | `boolean` | Enables auto-engine spawn and runner pool config |
| `rivetSiteUrl` | `string` | Base URL for the site |
| `headers` | `Record<string, string>?` | Static headers added to every request |
| `getHeaders` | `(request: Request) => Record<string, string>?` | Dynamic per-request headers |

### 3. Create the Client

```typescript
// src/lib/actor.client.ts
import {
  createClient,
  createRivetKitWithClient,
} from "@blujosi/rivetkit-solid";
import type { Client } from "rivetkit/client";
import type { Registry } from "~backend/registry";

const IS_BROWSER = typeof globalThis.document !== "undefined";

const endpoint = IS_BROWSER
  ? `${location.origin}/api/rivet`
  : "http://localhost:3000/api/rivet";

export const rivetClient: Client<Registry> = createClient<Registry>(endpoint);

const { useActor } = createRivetKitWithClient(rivetClient);
export { useActor };
```

### 4. Use Actors in Components (Client-Side)

The simplest approach is `useActionQuery` — it fetches the value by calling an action, then re-fetches whenever an event fires:

```tsx
// src/routes/index.tsx
import { useActor } from "~/lib";
import { Show } from "solid-js";

export default function Home() {
  const counterActor = useActor?.({
    name: "counter",
    key: ["test-counter"],
  });

  // useActionQuery: fetches value via action, re-fetches on event trigger
  const countQuery = counterActor?.useActionQuery({
    action: "getCount",
    event: "newCount",
    initialValue: 0,
  });

  const countDoubleQuery = counterActor?.useActionQuery({
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

  return (
    <Show
      when={!countQuery?.isLoading && !countDoubleQuery?.isLoading}
      fallback={<p>Loading...</p>}
    >
      <div>
        <h1>Counter: {countQuery?.value}</h1>
        <button onClick={increment}>Increment</button>
        <button onClick={reset}>Reset</button>

        <h1>Counter 2: {countDoubleQuery?.value}</h1>
        <button onClick={doubleCountClick}>Double Count</button>
      </div>
    </Show>
  );
}
```

### 5. SSR with Live Upgrade

Use `rivetLoad` to fetch actor data server-side, then automatically upgrade to a live WebSocket subscription on the client:

```tsx
// src/routes/ssr.tsx
import { useActor } from "~/lib";
import { Show, Suspense } from "solid-js";
import { rivetLoad } from "@blujosi/rivetkit-solid/solidstart";
import { rivetClient } from "~/lib/actor.client";
import { query, createAsync } from "@solidjs/router";

const getCounterData = query(async () => {
  "use server";
  const count = await rivetLoad<number,typeof registry>(rivetClient, {
    actor: "counter",
    key: ["test-counter"],
    action: "getCount",
    event: "newCount",
  });
  const countDouble = await rivetLoad<number,typeof registry>(rivetClient, {
    actor: "counter",
    key: ["test-counter"],
    action: "getCountDouble",
    event: "newDoubleCount",
  });
  return { count, countDouble };
}, "counter-data");

export const route = {
  preload: () => getCounterData(),
};

export default function SSRPage() {
  const data = createAsync(() => getCounterData());

  // useActor is still needed for calling actions (mutations)
  const counterActor = useActor?.({
    name: "counter",
    key: ["test-counter"],
  });

  const countValue = () => data()?.count?.data();
  const countDoubleValue = () => data()?.countDouble?.data();

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
        <Show when={data()}>
          {(d) => (
            <div>
              <h1>Counter: {countValue()}</h1>
              <button onClick={increment}>Increment</button>
              <button onClick={reset}>Reset</button>

              <h1>Counter 2: {countDoubleValue()}</h1>
            </div>
          )}
        </Show>
      </Suspense>
    </div>
  );
}
```

**How SSR → Live works:**
1. On the **server**, `rivetLoad` calls the action via stateless HTTP and returns the data for SSR
2. On the **client** (hydration or navigation), it creates a live WebSocket subscription that keeps the data updating in real-time
3. The returned `RivetQueryResult<T>` exposes reactive accessors (`data()`, `isLoading()`, `error()`, `isConnected()`)

---

## API Reference

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

Creates the `useActor` hook from an existing client instance. Use this when you need access to the client elsewhere (e.g. for `rivetLoad`).

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

#### `rivetLoad<T>(client, opts)`

Fetches actor data for use in SolidStart route data functions. Returns a `RivetQueryResult<T>` with reactive signal accessors.

```typescript
const count = await rivetLoad<number>(rivetClient, {
  actor: "counter",
  key: ["test-counter"],
  action: "getCount",
  event: "newCount",
  params: { token: "abc123" },  // Optional connection params
});

// Access values via signal accessors
count.data()         // number | undefined
count.isLoading()    // boolean
count.error()        // Error | undefined
count.isConnected()  // boolean
```

**Options (`RivetLoadOptions<T>`):**

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
| `data()` | `T \| undefined` | The current value |
| `isLoading()` | `boolean` | Whether data is being loaded |
| `error()` | `Error \| undefined` | Any error that occurred |
| `isConnected()` | `boolean` | Whether the live WebSocket is connected |

---

#### `encodeRivetLoad(value)`

Encodes a `RivetLoadResult` for serialization across the SSR boundary. Returns a plain object or `false` if the value isn't a RivetLoadResult.

#### `decodeRivetLoad<Registry>(encoded, client, transform?)`

Decodes a serialized `RivetLoadResult` into a live actor subscription on the client side.

---

## Connection Parameters

You can pass `params` when connecting to actors — both via `useActor` and `rivetLoad`. These are `Record<string, string>` values sent with the connection handshake, typically used for authentication:

```typescript
// Client-side via useActor
const actor = useActor({
  name: "counter",
  key: ["test-counter"],
  params: { token: "user-auth-token" },
});

// SSR via rivetLoad
const data = await rivetLoad<number>(rivetClient, {
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
      // Access params on the connection
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
│   │   ├── actor.client.ts  # RivetKit client + useActor export
│   │   └── index.ts         # Re-exports
│   ├── routes/
│   │   ├── index.tsx         # Client-side page
│   │   ├── ssr.tsx           # SSR page with rivetLoad
│   │   └── api/
│   │       └── rivet/
│   │           └── [...rest].ts  # Catch-all RivetKit handler
│   ├── entry-client.tsx
│   ├── entry-server.tsx
│   └── app.tsx
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
