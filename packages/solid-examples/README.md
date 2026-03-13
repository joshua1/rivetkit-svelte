# SolidStart RivetKit Example

This is a SolidStart example app demonstrating `@blujosi/rivetkit-solid` integration with RivetKit actors.

## Features

- **Client-side reactive counter** — Uses `useActor` + `useActionQuery` with SolidJS signals
- **SSR counter** — Server-rendered data that upgrades to live WebSocket subscriptions
- **RivetKit API handler** — Catch-all API route for the RivetKit registry

## Getting started

```bash
# From the monorepo root
pnpm install
pnpm --filter solid-rivetkit-example dev
```

## Structure

```
backend/
  registry.ts           # Actor definitions (counter with increment/reset/doubleIncrement)
src/
  lib/
    actor.client.ts     # RivetKit client + useActor setup
  routes/
    index.tsx           # Client-side counter page
    ssr.tsx              # SSR + live counter demo
    api/rivet/[...rest].ts  # RivetKit API handler
```
