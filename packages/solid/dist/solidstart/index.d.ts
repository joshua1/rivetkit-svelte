import { Registry } from 'rivetkit';
import { AnyActorRegistry } from '@rivetkit/framework-base';
import { Client } from 'rivetkit/client';
import { Accessor } from 'solid-js';

interface RivetKitHandlerOpts {
    registry: Registry<any>;
    isDev: boolean;
    rivetSiteUrl?: string;
    /** Static headers added to every request sent to the registry handler */
    headers?: Record<string, string>;
    /** Dynamic headers resolved per-request. Receives the full event. */
    getHeaders?: (event: {
        request: Request;
        locals: any;
    }) => Record<string, string> | Promise<Record<string, string>>;
    /**
     * The runtime to use for handling requests.
     *
     * - `"default"` — uses the built-in registry handler (Node.js / Bun compatible).
     * - `"cloudflare"` — delegates to `@rivetkit/cloudflare-workers`'s `createHandler`.
     *   Requires `@rivetkit/cloudflare-workers` to be installed as a peer dependency.
     *
     * @default "default"
     */
    runtime?: "default" | "cloudflare";
}
/**
 * Creates SolidStart API route handlers for a catch-all route.
 *
 * Usage in `src/routes/api/rivet/[...rest].ts`:
 * ```ts
 * import { createRivetKitHandler } from "@blujosi/rivetkit-solid/solidstart";
 * import { registry } from "~/backend/registry";
 *
 * export const { GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS } =
 *   createRivetKitHandler({ isDev: true, registry, rivetSiteUrl: "http://localhost:3000" });
 * ```
 */
declare const createRivetKitHandler: (opts?: RivetKitHandlerOpts) => {
    GET: (event: {
        request: Request;
        locals: any;
    }) => Promise<Response>;
    POST: (event: {
        request: Request;
        locals: any;
    }) => Promise<Response>;
    PUT: (event: {
        request: Request;
        locals: any;
    }) => Promise<Response>;
    DELETE: (event: {
        request: Request;
        locals: any;
    }) => Promise<Response>;
    PATCH: (event: {
        request: Request;
        locals: any;
    }) => Promise<Response>;
    HEAD: (event: {
        request: Request;
        locals: any;
    }) => Promise<Response>;
    OPTIONS: (event: {
        request: Request;
        locals: any;
    }) => Promise<Response>;
};

/**
 * SSR bridge — useRivetQuery() for SolidStart.
 *
 * On the server, useRivetQuery uses createResource to fetch data via a stateless
 * RivetKit action call. SolidStart serializes the resource automatically.
 * On the client, it upgrades to a live actor subscription via WebSocket.
 *
 * This module uses SolidJS context via RivetProvider — all signals are created
 * within the component ownership tree, ensuring proper disposal and cleanup.
 */

/** Reactive query result returned by useRivetQuery. */
interface RivetQueryResult<T = unknown> {
    /** The current value. On SSR this is the server-fetched value; on client it upgrades to live. */
    readonly data: Accessor<T | undefined>;
    /** Whether the initial data is being loaded. */
    readonly isLoading: Accessor<boolean>;
    /** Any error from the action call or connection. */
    readonly error: Accessor<Error | undefined>;
    /** Whether the live WebSocket connection is active (always false on server). */
    readonly isConnected: Accessor<boolean>;
    /** Manually refetch the action value. */
    readonly refetch: () => void;
}
interface RivetQueryOptions<T = unknown> {
    /** Actor name from the registry (e.g. 'counter'). */
    actor: string;
    /** Unique key for the actor instance. */
    key: string | string[];
    /** Action name to call for the initial value. */
    action: string;
    /** Arguments to pass to the action. */
    args?: unknown[];
    /** Event name(s) to subscribe to for live updates. */
    event: string | string[];
    /** Optional connection params (e.g. auth tokens). */
    params?: Record<string, string>;
    /** Optional region to create the actor in. */
    createInRegion?: string;
    /** Optional input data for actor creation. */
    createWithInput?: unknown;
    /** Transform incoming event data into the new value. Default: full replacement. */
    transform?: (current: T, incoming: unknown) => T;
}
/**
 * Fetch actor data with SSR support and automatic live upgrade.
 *
 * Uses SolidJS `createResource` for SSR serialization, then upgrades to a
 * live WebSocket subscription on the client. Must be called inside a
 * component wrapped in `<RivetProvider>`.
 *
 * ```tsx
 * function SSRPage() {
 *   const count = useRivetQuery<number>({
 *     actor: "counter",
 *     key: ["test-counter"],
 *     action: "getCount",
 *     event: "newCount",
 *   });
 *
 *   return <h1>Counter: {count.data()}</h1>;
 * }
 * ```
 */
declare function useRivetQuery<T = unknown>(opts: RivetQueryOptions<T>): RivetQueryResult<T>;
/**
 * Fetch actor data with SSR support using an explicit client reference.
 *
 * Same as `useRivetQuery` but doesn't require `<RivetProvider>` — you pass
 * the client directly. Useful when the client is available but you
 * haven't set up a provider.
 *
 * Must still be called inside a component (for signal ownership).
 */
declare function createRivetQuery<T = unknown>(client: Client<any>, opts: RivetQueryOptions<T>): RivetQueryResult<T>;
/** @deprecated Use `RivetQueryOptions` instead. */
type RivetLoadOptions<T = unknown> = RivetQueryOptions<T>;
/** @deprecated Use `useRivetQuery` or `createRivetQuery` instead. */
declare function rivetLoad<T = unknown, Registry extends AnyActorRegistry = AnyActorRegistry>(client: Client<Registry>, opts: RivetQueryOptions<T>): Promise<RivetQueryResult<T>>;
/** @deprecated No longer needed with the Provider-based approach. */
declare class RivetLoadResult<T = unknown> {
    readonly actorName: string;
    readonly key: string | string[];
    readonly action: string;
    readonly args: unknown[];
    readonly event: string | string[];
    readonly data: T;
    readonly params?: Record<string, string> | undefined;
    readonly createInRegion?: string | undefined;
    readonly createWithInput?: unknown | undefined;
    readonly __rivetLoad = true;
    constructor(actorName: string, key: string | string[], action: string, args: unknown[], event: string | string[], data: T, params?: Record<string, string> | undefined, createInRegion?: string | undefined, createWithInput?: unknown | undefined);
}
/** @deprecated No longer needed with the Provider-based approach. */
declare function encodeRivetLoad(value: unknown): false | Record<string, unknown>;
/** @deprecated No longer needed with the Provider-based approach. */
declare function decodeRivetLoad<Registry extends AnyActorRegistry>(encoded: Record<string, any>, client: Client<Registry>, transform?: (current: unknown, incoming: unknown) => unknown): RivetQueryResult<unknown>;

export { type RivetKitHandlerOpts, type RivetLoadOptions, RivetLoadResult, type RivetQueryOptions, type RivetQueryResult, createRivetKitHandler, createRivetQuery, decodeRivetLoad, encodeRivetLoad, rivetLoad, useRivetQuery };
