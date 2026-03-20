import { useRivet } from './chunk-GEAEWIF6.js';
import { getLogger } from 'rivetkit/log';
import { createResource, createSignal, createEffect, onCleanup } from 'solid-js';

var _devRunnerVersion = Math.floor(Date.now() / 1e3);
var _logger = getLogger("driver-solidstart");
var handler = async (event, opts) => {
  const { request } = event;
  const _requestUrl = new URL(request.url);
  const rivetSiteUrl = opts?.rivetSiteUrl;
  if (!rivetSiteUrl) {
    throw new Error("rivetSiteUrl is required");
  }
  const registry = opts?.registry;
  if (!registry) {
    throw new Error("registry is not set");
  }
  registry.config.serveManager = false;
  registry.config.serverless = {
    ...registry.config.serverless,
    basePath: "/api/rivet"
  };
  if (opts?.isDev) {
    _logger.debug(
      "detected development environment, auto-starting engine and auto-configuring serverless"
    );
    registry.config.serverless.spawnEngine = true;
    registry.config.serverless.configureRunnerPool = {
      url: `${rivetSiteUrl}/api/rivet`,
      minRunners: 0,
      maxRunners: 1e5,
      requestLifespan: 300,
      slotsPerRunner: 1,
      metadata: { provider: "solidstart" }
    };
    registry.config.runner = {
      ...registry.config.runner,
      version: _devRunnerVersion
    };
  } else {
    _logger.debug(
      "detected production environment, will not auto-start engine and auto-configure serverless"
    );
  }
  const newUrl = `${rivetSiteUrl}${_requestUrl.pathname}`;
  const newRequest = new Request(newUrl, request);
  newRequest.headers.set("host", new URL(newUrl).host);
  newRequest.headers.set("accept-encoding", "application/json");
  if (opts?.headers) {
    for (const [key, value] of Object.entries(opts.headers)) {
      newRequest.headers.set(key, value);
    }
  }
  if (opts?.getHeaders) {
    const dynamicHeaders = await opts.getHeaders(event);
    for (const [key, value] of Object.entries(dynamicHeaders)) {
      newRequest.headers.set(key, value);
    }
  }
  return await registry.handler(newRequest);
};
var createRivetKitHandler = (opts) => {
  const requestHandler = async (event) => {
    return handler(event, opts);
  };
  return {
    GET: requestHandler,
    POST: requestHandler,
    PUT: requestHandler,
    DELETE: requestHandler,
    PATCH: requestHandler,
    HEAD: requestHandler,
    OPTIONS: requestHandler
  };
};
var IS_BROWSER = typeof globalThis.document !== "undefined";
function useRivetQuery(opts) {
  const { client } = useRivet();
  return createRivetQuery(client, opts);
}
function createRivetQuery(client, opts) {
  const {
    actor: actorName,
    key,
    action,
    args = [],
    params,
    createInRegion,
    createWithInput,
    event,
    transform = (_current, incoming) => incoming
  } = opts;
  const normalizedKey = Array.isArray(key) ? key : [key];
  const [resource, { refetch }] = createResource(async () => {
    const handle = client.getOrCreate(actorName, normalizedKey, {
      params,
      createInRegion,
      createWithInput
    });
    return handle.action({ name: action, args });
  });
  const [liveData, setLiveData] = createSignal(void 0);
  const [isConnected, setIsConnected] = createSignal(false);
  const [liveError, setLiveError] = createSignal(void 0);
  if (IS_BROWSER) {
    createEffect(() => {
      const initialValue = resource();
      if (initialValue === void 0) return;
      setLiveData(() => initialValue);
      const handle = client.getOrCreate(actorName, normalizedKey, {
        params,
        createInRegion,
        createWithInput
      });
      const conn = handle.connect();
      conn.onOpen(() => setIsConnected(true));
      conn.onClose(() => setIsConnected(false));
      conn.onError((err) => {
        setLiveError(err instanceof Error ? err : new Error(String(err)));
      });
      const events = Array.isArray(event) ? event : [event];
      const unsubs = [];
      for (const evt of events) {
        const unsub = conn.on(evt, (...eventArgs) => {
          const incoming = eventArgs.length === 1 ? eventArgs[0] : eventArgs;
          setLiveData(
            (prev) => transform(prev ?? initialValue, incoming)
          );
          setLiveError(void 0);
        });
        unsubs.push(unsub);
      }
      onCleanup(() => {
        for (const unsub of unsubs) unsub();
        conn.disconnect();
        setIsConnected(false);
      });
    });
  }
  const data = () => {
    const live = liveData();
    if (live !== void 0) return live;
    return resource();
  };
  const isLoading = () => resource.loading;
  const error = () => {
    const le = liveError();
    if (le) return le;
    const re = resource.error;
    return re instanceof Error ? re : re ? new Error(String(re)) : void 0;
  };
  return { data, isLoading, error, isConnected, refetch };
}
async function rivetLoad(client, opts) {
  const {
    actor: actorName,
    key,
    action,
    args = [],
    event,
    params,
    createInRegion,
    createWithInput,
    transform = (_current, incoming) => incoming
  } = opts;
  const normalizedKey = Array.isArray(key) ? key : [key];
  const handle = client.getOrCreate(actorName, normalizedKey, {
    params,
    createInRegion,
    createWithInput
  });
  const initialData = await handle.action({
    name: action,
    args
  });
  if (IS_BROWSER) {
    return createLegacyLiveQuery(client, opts, initialData, transform);
  }
  return createStaticResult(initialData);
}
function createStaticResult(initialData) {
  const [data] = createSignal(initialData);
  const [isLoading] = createSignal(false);
  const [error] = createSignal(void 0);
  const [isConnected] = createSignal(false);
  return { data, isLoading, error, isConnected, refetch: () => {
  } };
}
function createLegacyLiveQuery(client, opts, initialData, transform) {
  const {
    actor: actorName,
    key,
    event,
    params,
    createInRegion,
    createWithInput
  } = opts;
  const [data, setData] = createSignal(initialData);
  const [isLoading] = createSignal(false);
  const [error, setError] = createSignal(void 0);
  const [isConnected, setIsConnected] = createSignal(false);
  const normalizedKey = Array.isArray(key) ? key : [key];
  const handle = client.getOrCreate(actorName, normalizedKey, {
    params,
    createInRegion,
    createWithInput
  });
  const conn = handle.connect();
  conn.onOpen(() => setIsConnected(true));
  conn.onClose(() => setIsConnected(false));
  conn.onError((err) => {
    setError(err instanceof Error ? err : new Error(String(err)));
  });
  const events = Array.isArray(event) ? event : [event];
  for (const evt of events) {
    conn.on(evt, (...args) => {
      const incoming = args.length === 1 ? args[0] : args;
      setData(() => transform(data(), incoming));
      setError(void 0);
    });
  }
  return { data, isLoading, error, isConnected, refetch: () => {
  } };
}
var RivetLoadResult = class {
  constructor(actorName, key, action, args, event, data, params, createInRegion, createWithInput) {
    this.actorName = actorName;
    this.key = key;
    this.action = action;
    this.args = args;
    this.event = event;
    this.data = data;
    this.params = params;
    this.createInRegion = createInRegion;
    this.createWithInput = createWithInput;
  }
  __rivetLoad = true;
};
function encodeRivetLoad(value) {
  if (value instanceof RivetLoadResult || value != null && typeof value === "object" && "__rivetLoad" in value) {
    const v = value;
    return {
      actorName: v.actorName,
      key: v.key,
      action: v.action,
      args: v.args,
      event: v.event,
      data: v.data,
      params: v.params,
      createInRegion: v.createInRegion,
      createWithInput: v.createWithInput
    };
  }
  return false;
}
function decodeRivetLoad(encoded, client, transform) {
  return createLegacyLiveQuery(
    client,
    {
      actor: encoded.actorName,
      key: encoded.key,
      action: encoded.action,
      args: encoded.args,
      event: encoded.event,
      params: encoded.params,
      createInRegion: encoded.createInRegion,
      createWithInput: encoded.createWithInput},
    encoded.data,
    transform ?? ((_c, incoming) => incoming)
  );
}

export { RivetLoadResult, createRivetKitHandler, createRivetQuery, decodeRivetLoad, encodeRivetLoad, rivetLoad, useRivetQuery };
