# rivetkit-better-auth

Adapter to use [better-auth](https://www.better-auth.com) with [RivetKit](https://rivetkit.com) actors

## Installation

```sh
pnpm add @joshua1/rivetkit-better-auth

# or

npm i @joshua1/rivetkit-better-auth
```

## Overview

This adapter provides seamless integration between Better Auth and RivetKit actors, allowing you to use Better Auth's authentication system with RivetKit's actor-based architecture. The adapter handles data operations through RivetKit actors and provides LINQ-style querying capabilities.

## Features

- **RivetKit Actor Integration** - Works with RivetKit's actor system
- **LINQ-Extensions Support** - Advanced querying with LINQ-style operations
- **Type Safety** - Full TypeScript support with proper type inference
- **Flexible Querying** - Support for complex where conditions and operators
- **Better Auth Compatibility** - Full compatibility with Better Auth's adapter interface
- **Extensible Actions & State** - Default actions and state can be extended for custom functionality

## Usage

### Basic Setup

First, set up your RivetKit actor using the provided `defaultActions` and `defaultActorState`:

```typescript
// auth-actor.ts
import { defineActor } from '@rivetkit/actor'
import { defaultActions, defaultActorState, tableNames } from '@joshua1/rivetkit-better-auth'

export const authActor = defineActor({
  name: 'auth',
  state: defaultActorState,
  vars: { tableNames },
  actions: defaultActions
})
```

### Create RivetKit Server and Client

```typescript
// server.ts
import { registry } from '@rivetkit/actor'
import { authActor } from './auth-actor'

const server = registry.createServer({
  authActor
})

const client = server.createClient()
```

### Initialize Better Auth with RivetKit Adapter

```typescript
import { betterAuth } from "better-auth"
import { rivetKitAdapter } from "@joshua1/rivetkit-better-auth"
import { client } from "./server"

export const auth = betterAuth({
  database: rivetKitAdapter(client, {
    debugLogs: true, // optional, for debugging
    modelNames: ['users', 'sessions'] // optional, specify which models to use
  }),
  // ... other Better Auth options
})
```

## Configuration Options

The `rivetKitAdapter` accepts the following parameters:

1. **`actorClient`**: **Required** - The client from `registry.createServer().createClient()`
2. **`config`**: **Optional** - Configuration object with:
   - `debugLogs`: **Optional** (default: `false`) - Enable debug logging for adapter operations
   - `modelNames`: **Optional** (default: all models) - Array of model names to use

## Advanced Usage

### Extending Default Actions

You can extend the default actions with your own custom methods:

```typescript
import { defineActor } from '@rivetkit/actor'
import { defaultActions, defaultActorState, tableNames } from '@joshua1/rivetkit-better-auth'

export const authActor = defineActor({
  name: 'auth',
  state: defaultActorState,
  vars: { tableNames },
  actions: {
    ...defaultActions,
    // Add your custom actions
    customUserSearch: async (c: any, params: { query: string }) => {
      const users = c.state.users.where((user: any) =>
        user.name.includes(params.query) || user.email.includes(params.query)
      ).toArray()
      return users
    },

    getUserStats: async (c: any) => {
      return {
        totalUsers: c.state.users.length,
        activeUsers: c.state.users.where((u: any) => u.isActive).count(),
        totalSessions: c.state.sessions.length
      }
    }
  }
})
```

### Extending Default State

You can also extend the default actor state with additional properties:

```typescript
import { defaultActorState } from '@joshua1/rivetkit-better-auth'

const extendedState = {
  ...defaultActorState,
  // Add custom state properties
  userPreferences: [] as UserPreference[],
  auditLogs: [] as AuditLog[]
}

export const authActor = defineActor({
  name: 'auth',
  state: extendedState,
  vars: { tableNames },
  actions: {
    ...defaultActions(),
    // Custom actions that work with extended state
    saveUserPreference: async (c: any, params: { userId: string, preference: any }) => {
      c.state.userPreferences.push({
        id: crypto.randomUUID(),
        userId: params.userId,
        ...params.preference
      })
    }
  }
})
```

### Default Actions Available as per better-auth specs

The `defaultActions()` function provides all the necessary methods for Better Auth integration:

- `create` - Create new records
- `findOne` - Find a single record
- `findMany` - Find multiple records with filtering, sorting, and pagination
- `update` - Update a single record
- `updateMany` - Update multiple records
- `delete` - Delete records
- `deleteMany` - Delete multiple records
- `count` - Count records with optional filtering

### Default State Structure

The `defaultActorState` includes arrays for all Better Auth entities:

```typescript
export const defaultActorState = {
  users: [] as User[],
  sessions: [] as Session[],
  accounts: [] as Account[],
  verifications: [] as Verification[],
  passkeys: [] as Passkey[],
  organizations: [] as Organization[],
  members: [] as Member[],
  invitations: [] as Invitation[],
  teams: [] as Team[]
}
```

## API Reference

For detailed API documentation, see [LINQ Transform README](./examples/LINQ_TRANSFORM_README.md).

## Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests to our repository.

## License

MIT License - see LICENSE file for details.
