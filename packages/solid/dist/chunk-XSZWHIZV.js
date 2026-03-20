import { __commonJS, __toESM, useRivet } from './chunk-GEAEWIF6.js';
import { createClient } from 'rivetkit/client';
export { createClient } from 'rivetkit/client';
import { createRoot, createSignal, onCleanup, createEffect } from 'solid-js';

// ../../node_modules/.pnpm/fast-deep-equal@3.1.3/node_modules/fast-deep-equal/index.js
var require_fast_deep_equal = __commonJS({
  "../../node_modules/.pnpm/fast-deep-equal@3.1.3/node_modules/fast-deep-equal/index.js"(exports, module) {
    module.exports = function equal2(a, b) {
      if (a === b) return true;
      if (a && b && typeof a == "object" && typeof b == "object") {
        if (a.constructor !== b.constructor) return false;
        var length, i, keys;
        if (Array.isArray(a)) {
          length = a.length;
          if (length != b.length) return false;
          for (i = length; i-- !== 0; )
            if (!equal2(a[i], b[i])) return false;
          return true;
        }
        if (a.constructor === RegExp) return a.source === b.source && a.flags === b.flags;
        if (a.valueOf !== Object.prototype.valueOf) return a.valueOf() === b.valueOf();
        if (a.toString !== Object.prototype.toString) return a.toString() === b.toString();
        keys = Object.keys(a);
        length = keys.length;
        if (length !== Object.keys(b).length) return false;
        for (i = length; i-- !== 0; )
          if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false;
        for (i = length; i-- !== 0; ) {
          var key = keys[i];
          if (!equal2(a[key], b[key])) return false;
        }
        return true;
      }
      return a !== a && b !== b;
    };
  }
});

// ../../node_modules/.pnpm/@tanstack+store@0.7.4/node_modules/@tanstack/store/dist/esm/scheduler.js
var __storeToDerived = /* @__PURE__ */ new WeakMap();
var __derivedToStore = /* @__PURE__ */ new WeakMap();
var __depsThatHaveWrittenThisTick = {
  current: []
};
var __isFlushing = false;
var __pendingUpdates = /* @__PURE__ */ new Set();
var __initialBatchValues = /* @__PURE__ */ new Map();
function __flush_internals(relatedVals) {
  const sorted = Array.from(relatedVals).sort((a, b) => {
    if (a instanceof Derived && a.options.deps.includes(b)) return 1;
    if (b instanceof Derived && b.options.deps.includes(a)) return -1;
    return 0;
  });
  for (const derived of sorted) {
    if (__depsThatHaveWrittenThisTick.current.includes(derived)) {
      continue;
    }
    __depsThatHaveWrittenThisTick.current.push(derived);
    derived.recompute();
    const stores = __derivedToStore.get(derived);
    if (stores) {
      for (const store of stores) {
        const relatedLinkedDerivedVals = __storeToDerived.get(store);
        if (!relatedLinkedDerivedVals) continue;
        __flush_internals(relatedLinkedDerivedVals);
      }
    }
  }
}
function __notifyListeners(store) {
  store.listeners.forEach(
    (listener) => listener({
      prevVal: store.prevState,
      currentVal: store.state
    })
  );
}
function __notifyDerivedListeners(derived) {
  derived.listeners.forEach(
    (listener) => listener({
      prevVal: derived.prevState,
      currentVal: derived.state
    })
  );
}
function __flush(store) {
  __pendingUpdates.add(store);
  if (__isFlushing) return;
  try {
    __isFlushing = true;
    while (__pendingUpdates.size > 0) {
      const stores = Array.from(__pendingUpdates);
      __pendingUpdates.clear();
      for (const store2 of stores) {
        const prevState = __initialBatchValues.get(store2) ?? store2.prevState;
        store2.prevState = prevState;
        __notifyListeners(store2);
      }
      for (const store2 of stores) {
        const derivedVals = __storeToDerived.get(store2);
        if (!derivedVals) continue;
        __depsThatHaveWrittenThisTick.current.push(store2);
        __flush_internals(derivedVals);
      }
      for (const store2 of stores) {
        const derivedVals = __storeToDerived.get(store2);
        if (!derivedVals) continue;
        for (const derived of derivedVals) {
          __notifyDerivedListeners(derived);
        }
      }
    }
  } finally {
    __isFlushing = false;
    __depsThatHaveWrittenThisTick.current = [];
    __initialBatchValues.clear();
  }
}

// ../../node_modules/.pnpm/@tanstack+store@0.7.4/node_modules/@tanstack/store/dist/esm/types.js
function isUpdaterFunction(updater) {
  return typeof updater === "function";
}

// ../../node_modules/.pnpm/@tanstack+store@0.7.4/node_modules/@tanstack/store/dist/esm/store.js
var Store = class {
  constructor(initialState, options) {
    this.listeners = /* @__PURE__ */ new Set();
    this.subscribe = (listener) => {
      var _a, _b;
      this.listeners.add(listener);
      const unsub = (_b = (_a = this.options) == null ? void 0 : _a.onSubscribe) == null ? void 0 : _b.call(_a, listener, this);
      return () => {
        this.listeners.delete(listener);
        unsub == null ? void 0 : unsub();
      };
    };
    this.prevState = initialState;
    this.state = initialState;
    this.options = options;
  }
  setState(updater) {
    var _a, _b, _c;
    this.prevState = this.state;
    if ((_a = this.options) == null ? void 0 : _a.updateFn) {
      this.state = this.options.updateFn(this.prevState)(updater);
    } else {
      if (isUpdaterFunction(updater)) {
        this.state = updater(this.prevState);
      } else {
        this.state = updater;
      }
    }
    (_c = (_b = this.options) == null ? void 0 : _b.onUpdate) == null ? void 0 : _c.call(_b);
    __flush(this);
  }
};

// ../../node_modules/.pnpm/@tanstack+store@0.7.4/node_modules/@tanstack/store/dist/esm/derived.js
var Derived = class _Derived {
  constructor(options) {
    this.listeners = /* @__PURE__ */ new Set();
    this._subscriptions = [];
    this.lastSeenDepValues = [];
    this.getDepVals = () => {
      const prevDepVals = [];
      const currDepVals = [];
      for (const dep of this.options.deps) {
        prevDepVals.push(dep.prevState);
        currDepVals.push(dep.state);
      }
      this.lastSeenDepValues = currDepVals;
      return {
        prevDepVals,
        currDepVals,
        prevVal: this.prevState ?? void 0
      };
    };
    this.recompute = () => {
      var _a, _b;
      this.prevState = this.state;
      const { prevDepVals, currDepVals, prevVal } = this.getDepVals();
      this.state = this.options.fn({
        prevDepVals,
        currDepVals,
        prevVal
      });
      (_b = (_a = this.options).onUpdate) == null ? void 0 : _b.call(_a);
    };
    this.checkIfRecalculationNeededDeeply = () => {
      for (const dep of this.options.deps) {
        if (dep instanceof _Derived) {
          dep.checkIfRecalculationNeededDeeply();
        }
      }
      let shouldRecompute = false;
      const lastSeenDepValues = this.lastSeenDepValues;
      const { currDepVals } = this.getDepVals();
      for (let i = 0; i < currDepVals.length; i++) {
        if (currDepVals[i] !== lastSeenDepValues[i]) {
          shouldRecompute = true;
          break;
        }
      }
      if (shouldRecompute) {
        this.recompute();
      }
    };
    this.mount = () => {
      this.registerOnGraph();
      this.checkIfRecalculationNeededDeeply();
      return () => {
        this.unregisterFromGraph();
        for (const cleanup of this._subscriptions) {
          cleanup();
        }
      };
    };
    this.subscribe = (listener) => {
      var _a, _b;
      this.listeners.add(listener);
      const unsub = (_b = (_a = this.options).onSubscribe) == null ? void 0 : _b.call(_a, listener, this);
      return () => {
        this.listeners.delete(listener);
        unsub == null ? void 0 : unsub();
      };
    };
    this.options = options;
    this.state = options.fn({
      prevDepVals: void 0,
      prevVal: void 0,
      currDepVals: this.getDepVals().currDepVals
    });
  }
  registerOnGraph(deps = this.options.deps) {
    for (const dep of deps) {
      if (dep instanceof _Derived) {
        dep.registerOnGraph();
        this.registerOnGraph(dep.options.deps);
      } else if (dep instanceof Store) {
        let relatedLinkedDerivedVals = __storeToDerived.get(dep);
        if (!relatedLinkedDerivedVals) {
          relatedLinkedDerivedVals = /* @__PURE__ */ new Set();
          __storeToDerived.set(dep, relatedLinkedDerivedVals);
        }
        relatedLinkedDerivedVals.add(this);
        let relatedStores = __derivedToStore.get(this);
        if (!relatedStores) {
          relatedStores = /* @__PURE__ */ new Set();
          __derivedToStore.set(this, relatedStores);
        }
        relatedStores.add(dep);
      }
    }
  }
  unregisterFromGraph(deps = this.options.deps) {
    for (const dep of deps) {
      if (dep instanceof _Derived) {
        this.unregisterFromGraph(dep.options.deps);
      } else if (dep instanceof Store) {
        const relatedLinkedDerivedVals = __storeToDerived.get(dep);
        if (relatedLinkedDerivedVals) {
          relatedLinkedDerivedVals.delete(this);
        }
        const relatedStores = __derivedToStore.get(this);
        if (relatedStores) {
          relatedStores.delete(dep);
        }
      }
    }
  }
};

// ../../node_modules/.pnpm/@tanstack+store@0.7.4/node_modules/@tanstack/store/dist/esm/effect.js
var Effect = class {
  constructor(opts) {
    const { eager, fn, ...derivedProps } = opts;
    this._derived = new Derived({
      ...derivedProps,
      fn: () => {
      },
      onUpdate() {
        fn();
      }
    });
    if (eager) {
      fn();
    }
  }
  mount() {
    return this._derived.mount();
  }
};

// ../../node_modules/.pnpm/@rivetkit+framework-base@2.1.3_@hono+node-server@1.19.9_hono@4.12.3__@hono+node-ws@1.3._833b1cc672daea6c64e06ed8e72b4074/node_modules/@rivetkit/framework-base/dist/mod.mjs
var import_fast_deep_equal = __toESM(require_fast_deep_equal(), 1);
function createRivetKit(client, createOpts = {}) {
  const store = new Store({
    actors: {}
  });
  const cache = /* @__PURE__ */ new Map();
  return {
    getOrCreateActor: (actorOpts) => getOrCreateActor(client, createOpts, store, cache, actorOpts),
    store
  };
}
function updateActor(store, key, updates) {
  store.setState((prev) => ({
    ...prev,
    actors: {
      ...prev.actors,
      [key]: { ...prev.actors[key], ...updates }
    }
  }));
}
function getOrCreateActor(client, createOpts, store, cache, actorOpts) {
  const hash = createOpts.hashFunction || defaultHashFunction;
  const normalizedOpts = {
    ...actorOpts,
    enabled: actorOpts.enabled ?? true
  };
  const key = hash(normalizedOpts);
  const existing = store.state.actors[key];
  if (!existing) {
    store.setState((prev) => ({
      ...prev,
      actors: {
        ...prev.actors,
        [key]: {
          hash: key,
          connStatus: "idle",
          connection: null,
          handle: null,
          error: null,
          opts: normalizedOpts
        }
      }
    }));
  } else if (!optsEqual(existing.opts, normalizedOpts)) {
    queueMicrotask(() => {
      updateActor(store, key, { opts: normalizedOpts });
    });
  }
  const cached = cache.get(key);
  if (cached) {
    return {
      ...cached,
      state: cached.state
    };
  }
  const derived = new Derived({
    fn: ({ currDepVals: [store2] }) => {
      const actor = store2.actors[key];
      return {
        ...actor,
        /** @deprecated Use `connStatus === "connected"` instead */
        isConnected: actor.connStatus === "connected"
      };
    },
    deps: [store]
  });
  const effect = new Effect({
    fn: () => {
      const actor = store.state.actors[key];
      if (!actor) {
        throw new Error(
          `Actor with key "${key}" not found in store. This indicates a bug in cleanup logic.`
        );
      }
      if (!actor.opts.enabled && actor.connection) {
        actor.connection.dispose();
        updateActor(store, key, {
          connection: null,
          handle: null,
          connStatus: "idle"
        });
        return;
      }
      if (actor.connStatus === "idle" && actor.opts.enabled) {
        queueMicrotask(() => {
          const currentActor = store.state.actors[key];
          if (currentActor && currentActor.connStatus === "idle" && currentActor.opts.enabled) {
            create(client, store, key);
          }
        });
      }
    },
    deps: [derived]
  });
  let unsubscribeDerived = null;
  let unsubscribeEffect = null;
  const mount = () => {
    const cached2 = cache.get(key);
    if (!cached2) {
      throw new Error(
        `Actor with key "${key}" not found in cache. This indicates a bug in cleanup logic.`
      );
    }
    if (cached2.cleanupTimeout !== null) {
      clearTimeout(cached2.cleanupTimeout);
      cached2.cleanupTimeout = null;
    }
    cached2.refCount++;
    if (cached2.refCount === 1) {
      unsubscribeDerived = derived.mount();
      unsubscribeEffect = effect.mount();
      const actor = store.state.actors[key];
      if (actor && actor.opts.enabled && actor.connStatus === "idle") {
        create(client, store, key);
      }
    }
    return () => {
      cached2.refCount--;
      if (cached2.refCount === 0) {
        cached2.cleanupTimeout = setTimeout(() => {
          cached2.cleanupTimeout = null;
          if (cached2.refCount > 0) return;
          unsubscribeDerived == null ? void 0 : unsubscribeDerived();
          unsubscribeEffect == null ? void 0 : unsubscribeEffect();
          unsubscribeDerived = null;
          unsubscribeEffect = null;
          const actor = store.state.actors[key];
          if (actor == null ? void 0 : actor.connection) {
            actor.connection.dispose();
          }
          store.setState((prev) => {
            const { [key]: _, ...rest } = prev.actors;
            return { ...prev, actors: rest };
          });
          cache.delete(key);
        }, 0);
      }
    };
  };
  cache.set(key, {
    state: derived,
    key,
    mount,
    create: create.bind(void 0, client, store, key),
    refCount: 0,
    cleanupTimeout: null
  });
  return {
    mount,
    state: derived,
    key
  };
}
function create(client, store, key) {
  const actor = store.state.actors[key];
  if (!actor) {
    throw new Error(
      `Actor with key "${key}" not found in store. This indicates a bug in cleanup logic.`
    );
  }
  updateActor(store, key, {
    connStatus: "connecting",
    error: null
  });
  try {
    const handle = actor.opts.noCreate ? client.get(
      actor.opts.name,
      actor.opts.key,
      {
        params: actor.opts.params
      }
    ) : client.getOrCreate(
      actor.opts.name,
      actor.opts.key,
      {
        params: actor.opts.params,
        createInRegion: actor.opts.createInRegion,
        createWithInput: actor.opts.createWithInput
      }
    );
    const connection = handle.connect();
    updateActor(store, key, {
      handle,
      connection
    });
    connection.onStatusChange((status) => {
      store.setState((prev) => {
        var _a;
        const isActiveConnection = ((_a = prev.actors[key]) == null ? void 0 : _a.connection) === connection;
        if (!isActiveConnection) return prev;
        return {
          ...prev,
          actors: {
            ...prev.actors,
            [key]: {
              ...prev.actors[key],
              connStatus: status,
              // Only clear error when successfully connected
              ...status === "connected" ? { error: null } : {}
            }
          }
        };
      });
    });
    connection.onError((error) => {
      store.setState((prev) => {
        var _a;
        if (((_a = prev.actors[key]) == null ? void 0 : _a.connection) !== connection) return prev;
        return {
          ...prev,
          actors: {
            ...prev.actors,
            [key]: {
              ...prev.actors[key],
              error
            }
          }
        };
      });
    });
  } catch (error) {
    console.error("Failed to create actor connection", error);
    updateActor(store, key, {
      connStatus: "disconnected",
      error
    });
  }
}
function defaultHashFunction({ name, key, params, noCreate }) {
  return JSON.stringify({ name, key, params, noCreate });
}
function optsEqual(a, b) {
  return (0, import_fast_deep_equal.default)(a, b);
}
function createRivetKit2(clientInput = void 0, opts = {}) {
  return createRivetKitWithClient(
    createClient(clientInput),
    opts
  );
}
function createRivetKitWithClient(client, opts = {}) {
  const { getOrCreateActor: getOrCreateActor2 } = createRivetKit(client, opts);
  function useActor(opts2) {
    const { mount, state } = getOrCreateActor2(opts2);
    createRoot(() => {
      mount();
    });
    const [actorState, setActorState] = createSignal(
      void 0
    );
    const unsubscribe = state?.subscribe((res) => {
      setActorState(res.currentVal);
    });
    onCleanup(() => unsubscribe?.());
    function useEvent(eventName, handler) {
      let currentHandler = handler;
      createEffect(() => {
        currentHandler = handler;
      });
      createEffect(() => {
        const s = actorState();
        if (!s?.connection) return;
        function eventHandler(...args) {
          currentHandler(...args);
        }
        const unsub = s.connection?.on(eventName, eventHandler);
        onCleanup(() => unsub?.());
      });
    }
    const current = {
      connect() {
        actorState()?.connection?.connect();
      },
      get connection() {
        return actorState()?.connection;
      },
      get handle() {
        return actorState()?.handle;
      },
      get isConnected() {
        return actorState()?.connStatus === "connected";
      },
      get isConnecting() {
        return actorState()?.connStatus === "connecting";
      },
      get isError() {
        return !!actorState()?.error;
      },
      get error() {
        return actorState()?.error;
      },
      get opts() {
        return actorState()?.opts;
      },
      get hash() {
        return actorState()?.hash;
      }
    };
    function useQuery(queryOpts) {
      const [value, setValue] = createSignal(queryOpts.initialValue);
      const [isLoading, setIsLoading] = createSignal(true);
      const [error, setError] = createSignal(null);
      const transform = queryOpts.transform ?? ((current2, incoming) => {
        if (current2 !== null && incoming !== null && typeof current2 === "object" && typeof incoming === "object" && !Array.isArray(current2) && !Array.isArray(incoming)) {
          return { ...current2, ...incoming };
        }
        return incoming;
      });
      useEvent(queryOpts.event, (...args) => {
        const incoming = args.length === 1 ? args[0] : args;
        setValue(() => transform(value(), incoming));
        setIsLoading(false);
        setError(null);
      });
      createEffect(() => {
        const conn = actorState()?.connection;
        if (!conn) return;
        const action = conn[queryOpts.action];
        if (typeof action !== "function") {
          setError(
            new Error(
              `Action '${queryOpts.action}' not found on actor connection`
            )
          );
          setIsLoading(false);
          return;
        }
        const callArgs = queryOpts.args ?? [];
        Promise.resolve(action.call(conn, ...callArgs)).then((result) => {
          setValue(() => result);
          setIsLoading(false);
        }).catch((err) => {
          setError(err instanceof Error ? err : new Error(String(err)));
          setIsLoading(false);
        });
      });
      return {
        get value() {
          return value();
        },
        get isLoading() {
          return isLoading();
        },
        get error() {
          return error();
        }
      };
    }
    function useActionQuery(queryOpts) {
      const [value, setValue] = createSignal(queryOpts.initialValue);
      const [isLoading, setIsLoading] = createSignal(true);
      const [error, setError] = createSignal(null);
      const [fetchVersion, setFetchVersion] = createSignal(0);
      function callAction() {
        const conn = actorState()?.connection;
        if (!conn) return;
        const action = conn[queryOpts.action];
        if (typeof action !== "function") {
          setError(
            new Error(
              `Action '${queryOpts.action}' not found on actor connection`
            )
          );
          setIsLoading(false);
          return;
        }
        const callArgs = queryOpts.args?.() ?? [];
        setIsLoading(true);
        Promise.resolve(action.call(conn, ...callArgs)).then((result) => {
          setValue(() => result);
          setIsLoading(false);
          setError(null);
        }).catch((err) => {
          setError(err instanceof Error ? err : new Error(String(err)));
          setIsLoading(false);
        });
      }
      const events = Array.isArray(queryOpts.event) ? queryOpts.event : [queryOpts.event];
      for (const evt of events) {
        useEvent(evt, () => {
          setFetchVersion((v) => v + 1);
        });
      }
      createEffect(() => {
        const _conn = actorState()?.connection;
        queryOpts.args?.();
        fetchVersion();
        if (!_conn) return;
        callAction();
      });
      return {
        get value() {
          return value();
        },
        get isLoading() {
          return isLoading();
        },
        get error() {
          return error();
        },
        refetch: callAction
      };
    }
    return {
      current,
      useEvent,
      useQuery,
      useActionQuery
    };
  }
  return {
    useActor
  };
}
function useActorFromContext(opts) {
  const { client } = useRivet();
  const { useActor } = createRivetKitWithClient(client);
  return useActor(opts);
}

export { createRivetKit2 as createRivetKit, createRivetKitWithClient, useActorFromContext };
