import { ssr, ssrHydrationKey, escape, createComponent, isServer } from 'solid-js/web';
import { g as bt, h as on, Z as Zt, i as q, j as vt } from '../nitro/nitro.mjs';
import { Suspense, Show, createResource, catchError, untrack, sharedConfig } from 'solid-js';
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

function S(r, e) {
  let n, o = () => !n || n.state === "unresolved" ? void 0 : n.latest;
  [n] = createResource(() => $(r, catchError(() => untrack(o), () => {
  })), (p) => p, e);
  const c = () => n();
  return Object.defineProperty(c, "latest", { get() {
    return n.latest;
  } }), c;
}
class t {
  static all() {
    return new t();
  }
  static allSettled() {
    return new t();
  }
  static any() {
    return new t();
  }
  static race() {
    return new t();
  }
  static reject() {
    return new t();
  }
  static resolve() {
    return new t();
  }
  catch() {
    return new t();
  }
  then() {
    return new t();
  }
  finally() {
    return new t();
  }
}
function $(r, e) {
  if (isServer || !sharedConfig.context) return r(e);
  const n = fetch, o = Promise;
  try {
    return window.fetch = () => new t(), Promise = t, r(e);
  } finally {
    window.fetch = n, Promise = o;
  }
}
var j = ["<div", "><h2>SSR + Live Counter Demo</h2><p><em>Initial data loaded server-side, then upgraded to live subscriptions.</em></p><!--$-->", "<!--/--></div>"], x = ["<p", ">Loading...</p>"], R = ["<div", "><h1>Counter: <!--$-->", "<!--/--></h1><button>Increment</button><button>Reset</button><h1>Counter 2: <!--$-->", "<!--/--></h1><button>Double Count</button></div>"];
const L = Zt(async () => {
  const r = await q(vt, { actor: "counter", key: ["test-counter"], action: "getCount", event: "newCount" }), e = await q(vt, { actor: "counter", key: ["test-counter"], action: "getCountDouble", event: "newDoubleCount" });
  return { count: r, countDouble: e };
}, "src_routes_ssr_tsx--getCounterData_cache", "/Users/josi/Documents/ShiftLabs/Projects/rivetkit-svelte/packages/solid-examples/src/routes/ssr.tsx?pick=default&pick=%24css&tsr-directive-use-server="), A = on(L, "counter-data");
function B() {
  var _a;
  const r = S(() => A());
  return (_a = bt) == null ? void 0 : _a({ name: "counter", key: ["test-counter"] }), ssr(j, ssrHydrationKey(), escape(createComponent(Suspense, { get fallback() {
    return ssr(x, ssrHydrationKey());
  }, get children() {
    return createComponent(Show, { get when() {
      return r();
    }, children: (e) => ssr(R, ssrHydrationKey(), escape(e().count.data()), escape(e().countDouble.data())) });
  } })));
}

export { B as default };
//# sourceMappingURL=ssr2.mjs.map
