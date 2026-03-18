import { createContext, useContext, createResource, createSignal, createEffect, onCleanup } from 'solid-js';
import { getLogger } from 'rivetkit/log';

var W = Object.create, E = Object.defineProperty, $ = Object.getOwnPropertyDescriptor, m = Object.getOwnPropertyNames, K = Object.getPrototypeOf, Q = Object.prototype.hasOwnProperty, te = (r, e) => function() {
  return e || (0, r[m(r)[0]])((e = { exports: {} }).exports, e), e.exports;
}, V = (r, e, t, a) => {
  if (e && typeof e == "object" || typeof e == "function") for (let n of m(e)) !Q.call(r, n) && n !== t && E(r, n, { get: () => e[n], enumerable: !(a = $(e, n)) || a.enumerable });
  return r;
}, ne = (r, e, t) => (t = r != null ? W(K(r)) : {}, V(E(t, "default", { value: r, enumerable: true }), r)), S = createContext(), oe = (r) => React.createElement(S.Provider, { value: { client: r.client } }, r.children);
function z() {
  const r = useContext(S);
  if (!r) throw new Error("useRivet() must be used inside a <RivetProvider>. Wrap your app with <RivetProvider client={...}>.");
  return r;
}
var B = Math.floor(Date.now() / 1e3), b = getLogger("driver-solidstart"), G = async (r, e) => {
  const { request: t } = r, a = new URL(t.url), n = e == null ? void 0 : e.rivetSiteUrl;
  if (!n) throw new Error("rivetSiteUrl is required");
  const o = e == null ? void 0 : e.registry;
  if (!o) throw new Error("registry is not set");
  o.config.serveManager = false, o.config.serverless = { ...o.config.serverless, basePath: "/api/rivet" }, (e == null ? void 0 : e.isDev) ? (b.debug("detected development environment, auto-starting engine and auto-configuring serverless"), o.config.serverless.spawnEngine = true, o.config.serverless.configureRunnerPool = { url: `${n}/api/rivet`, minRunners: 0, maxRunners: 1e5, requestLifespan: 300, slotsPerRunner: 1, metadata: { provider: "solidstart" } }, o.config.runner = { ...o.config.runner, version: B }) : b.debug("detected production environment, will not auto-start engine and auto-configure serverless");
  const d = `${n}${a.pathname}`, i = new Request(d, t);
  if (i.headers.set("host", new URL(d).host), i.headers.set("accept-encoding", "application/json"), e == null ? void 0 : e.headers) for (const [v, c] of Object.entries(e.headers)) i.headers.set(v, c);
  if (e == null ? void 0 : e.getHeaders) {
    const v = await e.getHeaders(r);
    for (const [c, p] of Object.entries(v)) i.headers.set(c, p);
  }
  return await o.handler(i);
}, se = (r) => {
  const e = async (t) => G(t, r);
  return { GET: e, POST: e, PUT: e, DELETE: e, PATCH: e, HEAD: e, OPTIONS: e };
}, J = typeof globalThis.document < "u";
function ae(r) {
  const { client: e } = z();
  return F(e, r);
}
function F(r, e) {
  const { actor: t, key: a, action: n, args: o = [], params: d, createInRegion: i, createWithInput: v, event: c, transform: p = (s, u) => u } = e, w = Array.isArray(a) ? a : [a], [g, { refetch: j }] = createResource(async () => r.getOrCreate(t, w, { params: d, createInRegion: i, createWithInput: v }).action({ name: n, args: o })), [C, R] = createSignal(void 0), [x, h] = createSignal(false), [L, O] = createSignal(void 0);
  return J && createEffect(() => {
    const s = g();
    if (s === void 0) return;
    R(() => s);
    const f = r.getOrCreate(t, w, { params: d, createInRegion: i, createWithInput: v }).connect();
    f.onOpen(() => h(true)), f.onClose(() => h(false)), f.onError((l) => {
      O(l instanceof Error ? l : new Error(String(l)));
    });
    const q = Array.isArray(c) ? c : [c], P = [];
    for (const l of q) {
      const D = f.on(l, (...y) => {
        const U = y.length === 1 ? y[0] : y;
        R((H) => p(H != null ? H : s, U)), O(void 0);
      });
      P.push(D);
    }
    onCleanup(() => {
      for (const l of P) l();
      f.disconnect(), h(false);
    });
  }), { data: () => {
    const s = C();
    return s !== void 0 ? s : g();
  }, isLoading: () => g.loading, error: () => {
    const s = L();
    if (s) return s;
    const u = g.error;
    return u instanceof Error ? u : u ? new Error(String(u)) : void 0;
  }, isConnected: x, refetch: j };
}

export { ae as a, ne as n, oe as o, se as s, te as t, z };
//# sourceMappingURL=chunk-ACNSKN6D-CWv6jrK3.mjs.map
