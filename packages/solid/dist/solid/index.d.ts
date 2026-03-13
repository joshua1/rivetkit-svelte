import { AnyActorRegistry, CreateRivetKitOptions, ActorOptions } from '@rivetkit/framework-base';
import { AnyActorDefinition, ActorHandle, ActorConn, createClient, ExtractActorsFromRegistry, Client } from 'rivetkit/client';
export { createClient } from 'rivetkit/client';
import { Accessor } from 'solid-js';

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

export { type ActorStateReference, createRivetKit, createRivetKitWithClient };
