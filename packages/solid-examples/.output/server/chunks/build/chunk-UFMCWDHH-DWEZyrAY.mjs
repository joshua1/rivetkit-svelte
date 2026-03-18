import { z, n as ne, t as te } from './chunk-ACNSKN6D-CWv6jrK3.mjs';
import { createRoot, createSignal, onCleanup, createEffect } from 'solid-js';

var Q = te({ "../../node_modules/.pnpm/fast-deep-equal@3.1.3/node_modules/fast-deep-equal/index.js"(s, r) {
  r.exports = function t(e, n) {
    if (e === n) return true;
    if (e && n && typeof e == "object" && typeof n == "object") {
      if (e.constructor !== n.constructor) return false;
      var c, a, o;
      if (Array.isArray(e)) {
        if (c = e.length, c != n.length) return false;
        for (a = c; a-- !== 0; ) if (!t(e[a], n[a])) return false;
        return true;
      }
      if (e.constructor === RegExp) return e.source === n.source && e.flags === n.flags;
      if (e.valueOf !== Object.prototype.valueOf) return e.valueOf() === n.valueOf();
      if (e.toString !== Object.prototype.toString) return e.toString() === n.toString();
      if (o = Object.keys(e), c = o.length, c !== Object.keys(n).length) return false;
      for (a = c; a-- !== 0; ) if (!Object.prototype.hasOwnProperty.call(n, o[a])) return false;
      for (a = c; a-- !== 0; ) {
        var d = o[a];
        if (!t(e[d], n[d])) return false;
      }
      return true;
    }
    return e !== e && n !== n;
  };
} }), D = /* @__PURE__ */ new WeakMap(), L = /* @__PURE__ */ new WeakMap(), j = { current: [] }, M = false, F = /* @__PURE__ */ new Set(), $ = /* @__PURE__ */ new Map();
function H(s) {
  const r = Array.from(s).sort((t, e) => t instanceof I && t.options.deps.includes(e) ? 1 : e instanceof I && e.options.deps.includes(t) ? -1 : 0);
  for (const t of r) {
    if (j.current.includes(t)) continue;
    j.current.push(t), t.recompute();
    const e = L.get(t);
    if (e) for (const n of e) {
      const c = D.get(n);
      c && H(c);
    }
  }
}
function B(s) {
  s.listeners.forEach((r) => r({ prevVal: s.prevState, currentVal: s.state }));
}
function X(s) {
  s.listeners.forEach((r) => r({ prevVal: s.prevState, currentVal: s.state }));
}
function Y(s) {
  var _a;
  if (F.add(s), !M) try {
    for (M = true; F.size > 0; ) {
      const r = Array.from(F);
      F.clear();
      for (const t of r) {
        const e = (_a = $.get(t)) != null ? _a : t.prevState;
        t.prevState = e, B(t);
      }
      for (const t of r) {
        const e = D.get(t);
        e && (j.current.push(t), H(e));
      }
      for (const t of r) {
        const e = D.get(t);
        if (e) for (const n of e) X(n);
      }
    }
  } finally {
    M = false, j.current = [], $.clear();
  }
}
function Z(s) {
  return typeof s == "function";
}
var k = class {
  constructor(s, r) {
    this.listeners = /* @__PURE__ */ new Set(), this.subscribe = (t) => {
      var e, n;
      this.listeners.add(t);
      const c = (n = (e = this.options) == null ? void 0 : e.onSubscribe) == null ? void 0 : n.call(e, t, this);
      return () => {
        this.listeners.delete(t), c == null ? void 0 : c();
      };
    }, this.prevState = s, this.state = s, this.options = r;
  }
  setState(s) {
    var r, t, e;
    this.prevState = this.state, (r = this.options) != null && r.updateFn ? this.state = this.options.updateFn(this.prevState)(s) : Z(s) ? this.state = s(this.prevState) : this.state = s, (e = (t = this.options) == null ? void 0 : t.onUpdate) == null || e.call(t), Y(this);
  }
}, I = class R {
  constructor(r) {
    this.listeners = /* @__PURE__ */ new Set(), this._subscriptions = [], this.lastSeenDepValues = [], this.getDepVals = () => {
      var _a;
      const t = [], e = [];
      for (const n of this.options.deps) t.push(n.prevState), e.push(n.state);
      return this.lastSeenDepValues = e, { prevDepVals: t, currDepVals: e, prevVal: (_a = this.prevState) != null ? _a : void 0 };
    }, this.recompute = () => {
      var t, e;
      this.prevState = this.state;
      const { prevDepVals: n, currDepVals: c, prevVal: a } = this.getDepVals();
      this.state = this.options.fn({ prevDepVals: n, currDepVals: c, prevVal: a }), (e = (t = this.options).onUpdate) == null || e.call(t);
    }, this.checkIfRecalculationNeededDeeply = () => {
      for (const c of this.options.deps) c instanceof R && c.checkIfRecalculationNeededDeeply();
      let t = false;
      const e = this.lastSeenDepValues, { currDepVals: n } = this.getDepVals();
      for (let c = 0; c < n.length; c++) if (n[c] !== e[c]) {
        t = true;
        break;
      }
      t && this.recompute();
    }, this.mount = () => (this.registerOnGraph(), this.checkIfRecalculationNeededDeeply(), () => {
      this.unregisterFromGraph();
      for (const t of this._subscriptions) t();
    }), this.subscribe = (t) => {
      var e, n;
      this.listeners.add(t);
      const c = (n = (e = this.options).onSubscribe) == null ? void 0 : n.call(e, t, this);
      return () => {
        this.listeners.delete(t), c == null ? void 0 : c();
      };
    }, this.options = r, this.state = r.fn({ prevDepVals: void 0, prevVal: void 0, currDepVals: this.getDepVals().currDepVals });
  }
  registerOnGraph(r = this.options.deps) {
    for (const t of r) if (t instanceof R) t.registerOnGraph(), this.registerOnGraph(t.options.deps);
    else if (t instanceof k) {
      let e = D.get(t);
      e || (e = /* @__PURE__ */ new Set(), D.set(t, e)), e.add(this);
      let n = L.get(this);
      n || (n = /* @__PURE__ */ new Set(), L.set(this, n)), n.add(t);
    }
  }
  unregisterFromGraph(r = this.options.deps) {
    for (const t of r) if (t instanceof R) this.unregisterFromGraph(t.options.deps);
    else if (t instanceof k) {
      const e = D.get(t);
      e && e.delete(this);
      const n = L.get(this);
      n && n.delete(t);
    }
  }
}, q = class {
  constructor(s) {
    const { eager: r, fn: t, ...e } = s;
    this._derived = new I({ ...e, fn: () => {
    }, onUpdate() {
      t();
    } }), r && t();
  }
  mount() {
    return this._derived.mount();
  }
}, tt = ne(Q());
function et(s, r = {}) {
  const t = new k({ actors: {} }), e = /* @__PURE__ */ new Map();
  return { getOrCreateActor: (n) => nt(s, r, t, e, n), store: t };
}
function C(s, r, t) {
  s.setState((e) => ({ ...e, actors: { ...e.actors, [r]: { ...e.actors[r], ...t } } }));
}
function nt(s, r, t, e, n) {
  var _a;
  const c = r.hashFunction || ot, a = { ...n, enabled: (_a = n.enabled) != null ? _a : true }, o = c(a), d = t.state.actors[o];
  d ? rt(d.opts, a) || queueMicrotask(() => {
    C(t, o, { opts: a });
  }) : t.setState((i) => ({ ...i, actors: { ...i.actors, [o]: { hash: o, connStatus: "idle", connection: null, handle: null, error: null, opts: a } } }));
  const A = e.get(o);
  if (A) return { ...A, state: A.state };
  const _ = new I({ fn: ({ currDepVals: [i] }) => {
    const l = i.actors[o];
    return { ...l, isConnected: l.connStatus === "connected" };
  }, deps: [t] }), O = new q({ fn: () => {
    const i = t.state.actors[o];
    if (!i) throw new Error(`Actor with key "${o}" not found in store. This indicates a bug in cleanup logic.`);
    if (!i.opts.enabled && i.connection) {
      i.connection.dispose(), C(t, o, { connection: null, handle: null, connStatus: "idle" });
      return;
    }
    i.connStatus === "idle" && i.opts.enabled && queueMicrotask(() => {
      const l = t.state.actors[o];
      l && l.connStatus === "idle" && l.opts.enabled && W(s, t, o);
    });
  }, deps: [_] });
  let b = null, w = null;
  const u = () => {
    const i = e.get(o);
    if (!i) throw new Error(`Actor with key "${o}" not found in cache. This indicates a bug in cleanup logic.`);
    if (i.cleanupTimeout !== null && (clearTimeout(i.cleanupTimeout), i.cleanupTimeout = null), i.refCount++, i.refCount === 1) {
      b = _.mount(), w = O.mount();
      const l = t.state.actors[o];
      l && l.opts.enabled && l.connStatus === "idle" && W(s, t, o);
    }
    return () => {
      i.refCount--, i.refCount === 0 && (i.cleanupTimeout = setTimeout(() => {
        if (i.cleanupTimeout = null, i.refCount > 0) return;
        b == null ? void 0 : b(), w == null ? void 0 : w(), b = null, w = null;
        const l = t.state.actors[o];
        (l == null ? void 0 : l.connection) && l.connection.dispose(), t.setState((g) => {
          const { [o]: v, ...V } = g.actors;
          return { ...g, actors: V };
        }), e.delete(o);
      }, 0));
    };
  };
  return e.set(o, { state: _, key: o, mount: u, create: W.bind(void 0, s, t, o), refCount: 0, cleanupTimeout: null }), { mount: u, state: _, key: o };
}
function W(s, r, t) {
  const e = r.state.actors[t];
  if (!e) throw new Error(`Actor with key "${t}" not found in store. This indicates a bug in cleanup logic.`);
  C(r, t, { connStatus: "connecting", error: null });
  try {
    const n = e.opts.noCreate ? s.get(e.opts.name, e.opts.key, { params: e.opts.params }) : s.getOrCreate(e.opts.name, e.opts.key, { params: e.opts.params, createInRegion: e.opts.createInRegion, createWithInput: e.opts.createWithInput }), c = n.connect();
    C(r, t, { handle: n, connection: c }), c.onStatusChange((a) => {
      r.setState((o) => {
        var d;
        return ((d = o.actors[t]) == null ? void 0 : d.connection) === c ? { ...o, actors: { ...o.actors, [t]: { ...o.actors[t], connStatus: a, ...a === "connected" ? { error: null } : {} } } } : o;
      });
    }), c.onError((a) => {
      r.setState((o) => {
        var d;
        return ((d = o.actors[t]) == null ? void 0 : d.connection) !== c ? o : { ...o, actors: { ...o.actors, [t]: { ...o.actors[t], error: a } } };
      });
    });
  } catch (n) {
    console.error("Failed to create actor connection", n), C(r, t, { connStatus: "disconnected", error: n });
  }
}
function ot({ name: s, key: r, params: t, noCreate: e }) {
  return JSON.stringify({ name: s, key: r, params: t, noCreate: e });
}
function rt(s, r) {
  return (0, tt.default)(s, r);
}
function st(s, r = {}) {
  const { getOrCreateActor: t } = et(s, r);
  function e(n) {
    const { mount: c, state: a } = t(n);
    createRoot(() => {
      c();
    });
    const [o, d] = createSignal(void 0), A = a == null ? void 0 : a.subscribe((u) => {
      d(u.currentVal);
    });
    onCleanup(() => A == null ? void 0 : A());
    function _(u, i) {
      let l = i;
      createEffect(() => {
        l = i;
      }), createEffect(() => {
        var _a;
        const g = o();
        if (!(g == null ? void 0 : g.connection)) return;
        function v(...S) {
          l(...S);
        }
        const V = (_a = g.connection) == null ? void 0 : _a.on(u, v);
        onCleanup(() => V == null ? void 0 : V());
      });
    }
    const O = { connect() {
      var _a, _b;
      (_b = (_a = o()) == null ? void 0 : _a.connection) == null ? void 0 : _b.connect();
    }, get connection() {
      var _a;
      return (_a = o()) == null ? void 0 : _a.connection;
    }, get handle() {
      var _a;
      return (_a = o()) == null ? void 0 : _a.handle;
    }, get isConnected() {
      var _a;
      return ((_a = o()) == null ? void 0 : _a.connStatus) === "connected";
    }, get isConnecting() {
      var _a;
      return ((_a = o()) == null ? void 0 : _a.connStatus) === "connecting";
    }, get isError() {
      var _a;
      return !!((_a = o()) == null ? void 0 : _a.error);
    }, get error() {
      var _a;
      return (_a = o()) == null ? void 0 : _a.error;
    }, get opts() {
      var _a;
      return (_a = o()) == null ? void 0 : _a.opts;
    }, get hash() {
      var _a;
      return (_a = o()) == null ? void 0 : _a.hash;
    } };
    function b(u) {
      var _a;
      const [i, l] = createSignal(u.initialValue), [g, v] = createSignal(true), [V, S] = createSignal(null), x = (_a = u.transform) != null ? _a : ((f, p) => f !== null && p !== null && typeof f == "object" && typeof p == "object" && !Array.isArray(f) && !Array.isArray(p) ? { ...f, ...p } : p);
      return _(u.event, (...f) => {
        const p = f.length === 1 ? f[0] : f;
        l(() => x(i(), p)), v(false), S(null);
      }), createEffect(() => {
        var _a2, _b;
        const f = (_a2 = o()) == null ? void 0 : _a2.connection;
        if (!f) return;
        const p = f[u.action];
        if (typeof p != "function") {
          S(new Error(`Action '${u.action}' not found on actor connection`)), v(false);
          return;
        }
        const G = (_b = u.args) != null ? _b : [];
        Promise.resolve(p.call(f, ...G)).then((h) => {
          l(() => h), v(false);
        }).catch((h) => {
          S(h instanceof Error ? h : new Error(String(h))), v(false);
        });
      }), { get value() {
        return i();
      }, get isLoading() {
        return g();
      }, get error() {
        return V();
      } };
    }
    function w(u) {
      const [i, l] = createSignal(u.initialValue), [g, v] = createSignal(true), [V, S] = createSignal(null), [x, f] = createSignal(0);
      function p() {
        var _a, _b, _c;
        const h = (_a = o()) == null ? void 0 : _a.connection;
        if (!h) return;
        const T = h[u.action];
        if (typeof T != "function") {
          S(new Error(`Action '${u.action}' not found on actor connection`)), v(false);
          return;
        }
        const N = (_c = (_b = u.args) == null ? void 0 : _b.call(u)) != null ? _c : [];
        v(true), Promise.resolve(T.call(h, ...N)).then((E) => {
          l(() => E), v(false), S(null);
        }).catch((E) => {
          S(E instanceof Error ? E : new Error(String(E))), v(false);
        });
      }
      const G = Array.isArray(u.event) ? u.event : [u.event];
      for (const h of G) _(h, () => {
        f((T) => T + 1);
      });
      return createEffect(() => {
        var _a, _b;
        const h = (_a = o()) == null ? void 0 : _a.connection;
        (_b = u.args) == null ? void 0 : _b.call(u), x(), h && p();
      }), { get value() {
        return i();
      }, get isLoading() {
        return g();
      }, get error() {
        return V();
      }, refetch: p };
    }
    return { current: O, useEvent: _, useQuery: b, useActionQuery: w };
  }
  return { useActor: e };
}
function at(s) {
  const { client: r } = z(), { useActor: t } = st(r);
  return t(s);
}

export { at as a };
//# sourceMappingURL=chunk-UFMCWDHH-DWEZyrAY.mjs.map
