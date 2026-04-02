import * as solid_js from 'solid-js';
import { ParentProps, Accessor } from 'solid-js';
import { AnyActorRegistry, CreateRivetKitOptions, ActorOptions } from '@rivetkit/framework-base';
import { Client, AnyActorDefinition, ActorHandle, ActorConn, createClient, ExtractActorsFromRegistry } from 'rivetkit/client';
export { createClient } from 'rivetkit/client';
export { C as CrudEvent, a as CrudTransformOptions, c as createTransform, b as crudTransform, d as deleteTransform, u as updateTransform } from '../crud-transforms-BmSOkyC0.js';

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
    useActor: <ActorName extends keyof ExtractActorsFromRegistry<Registry> & string>(opts: ActorOptions<Registry, ActorName>) => {
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
    useActor: <ActorName extends keyof ExtractActorsFromRegistry<Registry> & string>(opts: ActorOptions<Registry, ActorName>) => {
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
declare function useActorFromContext<Registry extends AnyActorRegistry = AnyActorRegistry, ActorName extends keyof ExtractActorsFromRegistry<Registry> & string = keyof ExtractActorsFromRegistry<Registry> & string>(opts: ActorOptions<Registry, ActorName>): {
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

export { type ActorStateReference, RivetContext, RivetProvider, createRivetKit, createRivetKitWithClient, useActorFromContext, useRivet };
