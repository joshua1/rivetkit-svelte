import { createComponent, isServer, getRequestEvent, delegateEvents } from 'solid-js/web';
import { w as wo, $ as $t, s as sn, _ as _t, c as bt, F as Ft, o as on$1, G, H as Ht, r as rn, t as tn, d as we, R as Rt, n as nn } from '../nitro/nitro.mjs';
import { Suspense, createSignal, onCleanup, children, createMemo, getOwner, sharedConfig, untrack, Show, on, createRoot } from 'solid-js';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:async_hooks';
import 'vinxi/lib/invariant';
import 'vinxi/lib/path';
import 'node:url';
import 'solid-js/web/storage';
import 'rivetkit/log';
import 'rivetkit/client';

const q = (t) => (n) => {
  const { base: o } = n, r = children(() => n.children), e = createMemo(() => $t(r(), n.base || ""));
  let s;
  const u = sn(t, e, () => s, { base: o, singleFlight: n.singleFlight, transformUrl: n.transformUrl });
  return t.create && t.create(u), createComponent(_t.Provider, { value: u, get children() {
    return createComponent(tt, { routerState: u, get root() {
      return n.root;
    }, get preload() {
      return n.rootPreload || n.rootLoad;
    }, get children() {
      return [(s = getOwner()) && null, createComponent(et, { routerState: u, get branches() {
        return e();
      } })];
    } });
  } });
};
function tt(t) {
  const n = t.routerState.location, o = t.routerState.params, r = createMemo(() => t.preload && untrack(() => {
    rn(true), t.preload({ params: o, location: n, intent: Ft() || "initial" }), rn(false);
  }));
  return createComponent(Show, { get when() {
    return t.root;
  }, keyed: true, get fallback() {
    return t.children;
  }, children: (e) => createComponent(e, { params: o, location: n, get data() {
    return r();
  }, get children() {
    return t.children;
  } }) });
}
function et(t) {
  if (isServer) {
    const e = getRequestEvent();
    if (e && e.router && e.router.dataOnly) {
      nt(e, t.routerState, t.branches);
      return;
    }
    e && ((e.router || (e.router = {})).matches || (e.router.matches = t.routerState.matches().map(({ route: s, path: u, params: m }) => ({ path: s.originalPath, pattern: s.pattern, match: u, params: m, info: s.info }))));
  }
  const n = [];
  let o;
  const r = createMemo(on(t.routerState.matches, (e, s, u) => {
    let m = s && e.length === s.length;
    const h = [];
    for (let l = 0, w = e.length; l < w; l++) {
      const b = s && s[l], g = e[l];
      u && b && g.route.key === b.route.key ? h[l] = u[l] : (m = false, n[l] && n[l](), createRoot((v) => {
        n[l] = v, h[l] = on$1(t.routerState, h[l - 1] || t.routerState.base, C(() => r()[l + 1]), () => {
          var _a;
          const p = t.routerState.matches();
          return (_a = p[l]) != null ? _a : p[0];
        });
      }));
    }
    return n.splice(e.length).forEach((l) => l()), u && m ? u : (o = h[0], h);
  }));
  return C(() => r() && o)();
}
const C = (t) => () => createComponent(Show, { get when() {
  return t();
}, keyed: true, children: (n) => createComponent(Ht.Provider, { value: n, get children() {
  return n.outlet();
} }) });
function nt(t, n, o) {
  const r = new URL(t.request.url), e = G(o, new URL(t.router.previousUrl || t.request.url).pathname), s = G(o, r.pathname);
  for (let u = 0; u < s.length; u++) {
    (!e[u] || s[u].route !== e[u].route) && (t.router.dataOnly = true);
    const { route: m, params: h } = s[u];
    m.preload && m.preload({ params: h, location: n.location, intent: "preload" });
  }
}
function rt([t, n], o, r) {
  return [t, r ? (e) => n(r(e)) : n];
}
function ot(t) {
  let n = false;
  const o = (e) => typeof e == "string" ? { value: e } : e, r = rt(createSignal(o(t.get()), { equals: (e, s) => e.value === s.value && e.state === s.state }), void 0, (e) => (!n && t.set(e), sharedConfig.registry && !sharedConfig.done && (sharedConfig.done = true), e));
  return t.init && onCleanup(t.init((e = t.get()) => {
    n = true, r[1](o(e)), n = false;
  })), q({ signal: r, create: t.create, utils: t.utils });
}
function at(t, n, o) {
  return t.addEventListener(n, o), () => t.removeEventListener(n, o);
}
function it(t, n) {
  const o = t && document.getElementById(t);
  o ? o.scrollIntoView() : n && window.scrollTo(0, 0);
}
function st(t) {
  const n = new URL(t);
  return n.pathname + n.search;
}
function ut(t) {
  let n;
  const o = { value: t.url || (n = getRequestEvent()) && st(n.request.url) || "" };
  return q({ signal: [() => o, (r) => Object.assign(o, r)] })(t);
}
const ct = /* @__PURE__ */ new Map();
function lt(t = true, n = false, o = "/_server", r) {
  return (e) => {
    const s = e.base.path(), u = e.navigatorFactory(e.base);
    let m, h;
    function l(a) {
      return a.namespaceURI === "http://www.w3.org/2000/svg";
    }
    function w(a) {
      if (a.defaultPrevented || a.button !== 0 || a.metaKey || a.altKey || a.ctrlKey || a.shiftKey) return;
      const i = a.composedPath().find((A) => A instanceof Node && A.nodeName.toUpperCase() === "A");
      if (!i || n && !i.hasAttribute("link")) return;
      const d = l(i), c = d ? i.href.baseVal : i.href;
      if ((d ? i.target.baseVal : i.target) || !c && !i.hasAttribute("state")) return;
      const R = (i.getAttribute("rel") || "").split(/\s+/);
      if (i.hasAttribute("download") || R && R.includes("external")) return;
      const y = d ? new URL(c, document.baseURI) : new URL(c);
      if (!(y.origin !== window.location.origin || s && y.pathname && !y.pathname.toLowerCase().startsWith(s.toLowerCase()))) return [i, y];
    }
    function b(a) {
      const i = w(a);
      if (!i) return;
      const [d, c] = i, E = e.parsePath(c.pathname + c.search + c.hash), R = d.getAttribute("state");
      a.preventDefault(), u(E, { resolve: false, replace: d.hasAttribute("replace"), scroll: !d.hasAttribute("noscroll"), state: R ? JSON.parse(R) : void 0 });
    }
    function g(a) {
      const i = w(a);
      if (!i) return;
      const [d, c] = i;
      r && (c.pathname = r(c.pathname)), e.preloadRoute(c, d.getAttribute("preload") !== "false");
    }
    function v(a) {
      clearTimeout(m);
      const i = w(a);
      if (!i) return h = null;
      const [d, c] = i;
      h !== d && (r && (c.pathname = r(c.pathname)), m = setTimeout(() => {
        e.preloadRoute(c, d.getAttribute("preload") !== "false"), h = d;
      }, 20));
    }
    function p(a) {
      if (a.defaultPrevented) return;
      let i = a.submitter && a.submitter.hasAttribute("formaction") ? a.submitter.getAttribute("formaction") : a.target.getAttribute("action");
      if (!i) return;
      if (!i.startsWith("https://action/")) {
        const c = new URL(i, bt);
        if (i = e.parsePath(c.pathname + c.search), !i.startsWith(o)) return;
      }
      if (a.target.method.toUpperCase() !== "POST") throw new Error("Only POST forms are supported for Actions");
      const d = ct.get(i);
      if (d) {
        a.preventDefault();
        const c = new FormData(a.target, a.submitter);
        d.call({ r: e, f: a.target }, a.target.enctype === "multipart/form-data" ? c : new URLSearchParams(c));
      }
    }
    delegateEvents(["click", "submit"]), document.addEventListener("click", b), t && (document.addEventListener("mousemove", v, { passive: true }), document.addEventListener("focusin", g, { passive: true }), document.addEventListener("touchstart", g, { passive: true })), document.addEventListener("submit", p), onCleanup(() => {
      document.removeEventListener("click", b), t && (document.removeEventListener("mousemove", v), document.removeEventListener("focusin", g), document.removeEventListener("touchstart", g)), document.removeEventListener("submit", p);
    });
  };
}
function dt(t) {
  if (isServer) return ut(t);
  const n = () => {
    const r = window.location.pathname.replace(/^\/+/, "/") + window.location.search, e = window.history.state && window.history.state._depth && Object.keys(window.history.state).length === 1 ? void 0 : window.history.state;
    return { value: r + window.location.hash, state: e };
  }, o = Rt();
  return ot({ get: n, set({ value: r, replace: e, scroll: s, state: u }) {
    e ? window.history.replaceState(tn(u), "", r) : window.history.pushState(u, "", r), it(decodeURIComponent(window.location.hash.slice(1)), s), we();
  }, init: (r) => at(window, "popstate", nn(r, (e) => {
    if (e) return !o.confirm(e);
    {
      const s = n();
      return !o.confirm(s.value, { state: s.state });
    }
  })), create: lt(t.preload, t.explicitLinks, t.actionBase, t.transformUrl), utils: { go: (r) => window.history.go(r), beforeLeave: o } })(t);
}
function St() {
  return createComponent(dt, { root: (t) => createComponent(Suspense, { get children() {
    return t.children;
  } }), get children() {
    return createComponent(wo, {});
  } });
}

export { St as default };
//# sourceMappingURL=app-PN6qWyv6.mjs.map
