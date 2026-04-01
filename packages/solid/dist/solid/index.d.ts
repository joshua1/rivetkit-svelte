import * as solid_js from 'solid-js';
import { ParentProps, Accessor } from 'solid-js';
import { AnyActorRegistry, CreateRivetKitOptions, ActorOptions } from '@rivetkit/framework-base';
import { Client, AnyActorDefinition, ActorHandle, ActorConn, createClient, ExtractActorsFromRegistry } from 'rivetkit/client';
export { createClient } from 'rivetkit/client';

interface RivetContextValue<Registry extends AnyActorRegistry = AnyActorRegistry> {
    client: Client<Registry>;
}
declare const RivetContext: solid_js.Context<RivetContextValue<AnyActorRegistry> | undefined>;
/**
 * Provides the RivetKit client to the component tree.
 *
 * Wrap your app (or a subtree) with this provider so that `useRivet()`,
 * `useActor()`, and `useRivetQuery()` can access the client via context.
 *
 * ```tsx
 * import { RivetProvider } from "@blujosi/rivetkit-solid";
 *
 * <RivetProvider client={rivetClient}>
 *   <Router>...</Router>
 * </RivetProvider>
 * ```
 */
declare function RivetProvider<R extends AnyActorRegistry = AnyActorRegistry>(props: ParentProps<{
    client: Client<R>;
}>): solid_js.JSX.Element;
/**
 * Access the RivetKit client from context.
 *
 * Must be called inside a `<RivetProvider>`.
 *
 * ```tsx
 * const { client } = useRivet<Registry>();
 * ```
 */
declare function useRivet<Registry extends AnyActorRegistry = AnyActorRegistry>(): RivetContextValue<Registry>;

/**
 * Generic CRUD transform factories for use with `useQuery` and `useRivetQuery`.
 *
 * These produce `transform` functions that handle incoming create/update/delete
 * events against a list of items, keyed by an identifier field.
 *
 * @example
 * ```ts
 * const tasks = useRivetQuery<Task[]>({
 *   actor: "taskList",
 *   key: ["my-list"],
 *   action: "getTasks",
 *   event: ["taskCreated", "taskUpdated", "taskDeleted"],
 *   transform: crudTransform<Task>({ key: "id" }),
 * });
 * ```
 */
/**
 * An incoming event payload that carries a CRUD operation type.
 *
 * Actors should broadcast events in this shape:
 * ```ts
 * c.broadcast("todoListUpdate", { data: todo, type: "created" })
 * ```
 */
interface CrudEvent<T> {
    data: T;
    type: "created" | "updated" | "deleted";
}
/** Options shared by all CRUD transform factories. */
interface CrudTransformOptions<T> {
    /**
     * Property name (or accessor) used to uniquely identify items.
     * Defaults to `"id"`.
     */
    key?: keyof T | ((item: T) => unknown);
}
/**
 * Transform for a **create** event.
 * - **Array:** appends the incoming item; duplicates (same key) are ignored.
 * - **Single item:** replaces the current value with the incoming item.
 */
declare function createTransform<T>(opts?: CrudTransformOptions<T>): <C extends T[] | T>(current: C, incoming: unknown) => C;
/**
 * Transform for an **update** event.
 * - **Array:** replaces the matching item in-place; returns unchanged if no match.
 * - **Single item:** replaces the current value with the incoming item.
 */
declare function updateTransform<T>(opts?: CrudTransformOptions<T>): <C extends T[] | T>(current: C, incoming: unknown) => C;
/**
 * Transform for a **delete** event.
 * - **Array:** removes the matching item. `incoming` can be the full item or just the key value.
 * - **Single item:** returns the current value unchanged (cannot delete a scalar).
 */
declare function deleteTransform<T>(opts?: CrudTransformOptions<T>): <C extends T[] | T>(current: C, incoming: unknown) => C;
/**
 * A single transform that handles create, update, and delete events.
 *
 * Incoming payloads must be a `CrudEvent<T>` with `{ data, type }`:
 * ```ts
 * { data: item, type: "created" }
 * { data: item, type: "updated" }
 * { data: item, type: "deleted" }
 * ```
 *
 * Actors should broadcast in this shape:
 * ```ts
 * c.broadcast("todoListUpdate", { data: todo, type: "created" })
 * ```
 *
 * @example
 * ```ts
 * const users = useRivetQuery<User[]>({
 *   actor: "userList",
 *   key: ["all"],
 *   action: "getUsers",
 *   event: "userListUpdate",
 *   transform: crudTransform<User>({ key: "id" }),
 * });
 * ```
 */
declare function crudTransform<T>(opts?: CrudTransformOptions<T>): <C extends T[] | T>(current: C, incoming: CrudEvent<T>) => C;

interface ActorStateReference<AD extends AnyActorDefinition> {
    hash: string;
    handle: ActorHandle<AD> | null;
    connection: ActorConn<AD> | null;
    isConnected?: boolean;
    isConnecting?: boolean;
    isError?: boolean;
    error: Error | null;
    opts: {
        name: keyof AD;
        key: string | string[];
        params?: Record<string, string>;
        createInRegion?: string;
        createWithInput?: unknown;
        enabled?: boolean;
    };
}

declare function createRivetKit<Registry extends AnyActorRegistry>(clientInput?: Parameters<typeof createClient>[0], opts?: CreateRivetKitOptions<Registry>): {
    useActor: <ActorName extends keyof ExtractActorsFromRegistry<Registry>>(opts: ActorOptions<Registry, ActorName>) => {
        current: {
            connect(): void;
            readonly connection: any;
            readonly handle: any;
            readonly isConnected: boolean;
            readonly isConnecting: boolean;
            readonly isError: boolean;
            readonly error: any;
            readonly opts: any;
            readonly hash: any;
        };
        useEvent: (eventName: string, handler: (...args: any[]) => void) => void;
        useQuery: <T>(queryOpts: {
            action: string;
            args?: any[];
            event: string;
            initialValue: T;
            transform?: ((current: T, incoming: any) => T) | undefined;
        }) => {
            readonly value: T;
            readonly isLoading: boolean;
            readonly error: Error | null;
        };
        useActionQuery: <T>(queryOpts: {
            action: string;
            args?: Accessor<any[]>;
            event: string | string[];
            initialValue: T;
        }) => {
            readonly value: T;
            readonly isLoading: boolean;
            readonly error: Error | null;
            refetch: () => void;
        };
    };
};
declare function createRivetKitWithClient<Registry extends AnyActorRegistry>(client: Client<Registry>, opts?: CreateRivetKitOptions<Registry>): {
    useActor: <ActorName extends keyof ExtractActorsFromRegistry<Registry>>(opts: ActorOptions<Registry, ActorName>) => {
        current: {
            connect(): void;
            readonly connection: any;
            readonly handle: any;
            readonly isConnected: boolean;
            readonly isConnecting: boolean;
            readonly isError: boolean;
            readonly error: any;
            readonly opts: any;
            readonly hash: any;
        };
        useEvent: (eventName: string, handler: (...args: any[]) => void) => void;
        useQuery: <T>(queryOpts: {
            action: string;
            args?: any[];
            event: string;
            initialValue: T;
            transform?: (current: T, incoming: any) => T;
        }) => {
            readonly value: T;
            readonly isLoading: boolean;
            readonly error: Error | null;
        };
        useActionQuery: <T>(queryOpts: {
            action: string;
            args?: Accessor<any[]>;
            event: string | string[];
            initialValue: T;
        }) => {
            readonly value: T;
            readonly isLoading: boolean;
            readonly error: Error | null;
            refetch: () => void;
        };
    };
};
/**
 * Context-aware useActor that pulls the client from `<RivetProvider>`.
 *
 * Must be called inside a component wrapped in `<RivetProvider>`.
 * This is the recommended approach — no need to manually create a client
 * or call `createRivetKitWithClient`.
 *
 * ```tsx
 * function Counter() {
 *   const actor = useActorFromContext({
 *     name: "counter",
 *     key: ["test-counter"],
 *   });
 *   // actor.current.connection, actor.useActionQuery, etc.
 * }
 * ```
 */
declare function useActorFromContext<Registry extends AnyActorRegistry = AnyActorRegistry, ActorName extends keyof ExtractActorsFromRegistry<Registry> = keyof ExtractActorsFromRegistry<Registry>>(opts: ActorOptions<Registry, ActorName>): {
    current: {
        connect(): void;
        readonly connection: any;
        readonly handle: any;
        readonly isConnected: boolean;
        readonly isConnecting: boolean;
        readonly isError: boolean;
        readonly error: any;
        readonly opts: any;
        readonly hash: any;
    };
    useEvent: (eventName: string, handler: (...args: any[]) => void) => void;
    useQuery: <T>(queryOpts: {
        action: string;
        args?: any[];
        event: string;
        initialValue: T;
        transform?: ((current: T, incoming: any) => T) | undefined;
    }) => {
        readonly value: T;
        readonly isLoading: boolean;
        readonly error: Error | null;
    };
    useActionQuery: <T>(queryOpts: {
        action: string;
        args?: Accessor<any[]>;
        event: string | string[];
        initialValue: T;
    }) => {
        readonly value: T;
        readonly isLoading: boolean;
        readonly error: Error | null;
        refetch: () => void;
    };
};

export { type ActorStateReference, type CrudEvent, type CrudTransformOptions, RivetContext, RivetProvider, createRivetKit, createRivetKitWithClient, createTransform, crudTransform, deleteTransform, updateTransform, useActorFromContext, useRivet };
