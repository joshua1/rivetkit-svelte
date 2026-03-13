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
    /** Dynamic headers resolved per-request. Receives the full request. */
    getHeaders?: (request: Request) => Record<string, string> | Promise<Record<string, string>>;
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
    GET: ({ request }: {
        request: Request;
    }) => Promise<Response>;
    POST: ({ request }: {
        request: Request;
    }) => Promise<Response>;
    PUT: ({ request }: {
        request: Request;
    }) => Promise<Response>;
    DELETE: ({ request }: {
        request: Request;
    }) => Promise<Response>;
    PATCH: ({ request }: {
        request: Request;
    }) => Promise<Response>;
    HEAD: ({ request }: {
        request: Request;
    }) => Promise<Response>;
    OPTIONS: ({ request }: {
        request: Request;
    }) => Promise<Response>;
};

/**
 * SSR bridge — rivetLoad() for SolidStart.
 *
 * On the server, rivetLoad fetches via a stateless RivetKit action call.
 * On the client, it upgrades to a live actor subscription via WebSocket.
 * On client-side navigation, rivetLoad creates a live subscription directly.
 */

/** Reactive query result returned by rivetLoad. */
interface RivetQueryResult<T = unknown> {
    readonly data: Accessor<T | undefined>;
    readonly isLoading: Accessor<boolean>;
    readonly error: Accessor<Error | undefined>;
    readonly isConnected: Accessor<boolean>;
}
interface RivetLoadOptions<T = unknown> {
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
/** Marker class for serialization recognition. */
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
interface RivetLoadEncoded {
    actorName: string;
    key: string | string[];
    action: string;
    args: unknown[];
    event: string | string[];
    data: unknown;
    params?: Record<string, string>;
    createInRegion?: string;
    createWithInput?: unknown;
}
/**
 * Fetch actor data for use in SolidStart route data functions.
 *
 * - **Server (SSR):** calls the action via stateless HTTP, wraps the result in
 *   a RivetLoadResult for serialization.
 * - **Client (navigation):** calls the action for initial data, then immediately
 *   creates a live subscription via createDetachedActorQuery().
 *
 * ```ts
 * // routes/ssr.tsx
 * import { rivetLoad } from "@blujosi/rivetkit-solid/solidstart";
 *
 * export const route = {
 *   preload: () => ({
 *     count: rivetLoad(rivetClient, {
 *       actor: 'counter',
 *       key: ['test-counter'],
 *       action: 'getCount',
 *       event: 'newCount',
 *     })
 *   })
 * };
 * ```
 */
declare function rivetLoad<T = unknown, Registry extends AnyActorRegistry = AnyActorRegistry>(client: Client<Registry>, opts: RivetLoadOptions<T>): Promise<RivetQueryResult<T>>;
/**
 * Encode a RivetLoadResult for serialization across SSR boundary.
 */
declare function encodeRivetLoad(value: unknown): false | RivetLoadEncoded;
/**
 * Decode a serialized RivetLoadResult into a live actor subscription.
 */
declare function decodeRivetLoad<Registry extends AnyActorRegistry>(encoded: RivetLoadEncoded, client: Client<Registry>, transform?: (current: unknown, incoming: unknown) => unknown): RivetQueryResult<unknown>;

export { type RivetLoadOptions, RivetLoadResult, type RivetQueryResult, createRivetKitHandler, decodeRivetLoad, encodeRivetLoad, rivetLoad };
