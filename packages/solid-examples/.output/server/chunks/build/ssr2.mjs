import { ssr, ssrHydrationKey, escape, createComponent } from 'solid-js/web';
import { createSignal, createEffect, Show, Suspense } from 'solid-js';
import { b as ae, a as at } from '../nitro/nitro.mjs';
import { a } from './auth-client-soFIT0rW2.mjs';
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
import 'better-auth/solid';

var h = ["<p", ">Loading session...</p>"], b = ["<p", '><a href="/auth">Sign in</a> to access your personal counter.</p>'], k = ["<p", ">Signed in as <strong>", "</strong></p>"], f = ["<div", "><h2>SSR + Live Counter Demo</h2><p><em>Initial data loaded via createResource, then upgraded to live subscriptions.</em></p><!--$-->", "<!--/--><!--$-->", "<!--/--><!--$-->", "<!--/--></div>"], C = ["<div", "><h1>Counter: <!--$-->", '<!--/--></h1><button type="button">Increment</button><button type="button">Reset</button><h1>Counter 2: <!--$-->', '<!--/--></h1><button type="button">Double Count</button></div>'], S = ["<p", ">Loading counter...</p>"];
function L() {
  const t = a.useSession(), [s, r] = createSignal(null);
  return createEffect(() => {
    var _a;
    ((_a = t()) == null ? void 0 : _a.data) ? fetch("/api/token", { credentials: "include" }).then((u) => u.ok ? u.json() : null).then((u) => (u == null ? void 0 : u.token) && r(u.token)).catch(() => r(null)) : r(null);
  }), ssr(f, ssrHydrationKey(), escape(createComponent(Show, { get when() {
    var _a;
    return (_a = t()) == null ? void 0 : _a.isPending;
  }, get children() {
    return ssr(h, ssrHydrationKey());
  } })), escape(createComponent(Show, { get when() {
    var _a, _b;
    return !((_a = t()) == null ? void 0 : _a.isPending) && !((_b = t()) == null ? void 0 : _b.data);
  }, get children() {
    return ssr(b, ssrHydrationKey());
  } })), escape(createComponent(Show, { get when() {
    var _a;
    return ((_a = t()) == null ? void 0 : _a.data) && s();
  }, get children() {
    var _a, _b;
    return [ssr(k, ssrHydrationKey(), escape((_b = (_a = t()) == null ? void 0 : _a.data) == null ? void 0 : _b.user.email)), createComponent(v, { get userId() {
      return t().data.user.id;
    }, get token() {
      return s();
    } })];
  } })));
}
function v(t) {
  const s = ae({ actor: "counter", key: ["user-counter", t.userId], action: "getCount", event: "newCount", params: { token: t.token } }), r = ae({ actor: "counter", key: ["user-counter", t.userId], action: "getCountDouble", event: "newDoubleCount", params: { token: t.token } });
  return at({ name: "counter", key: ["user-counter", t.userId], params: { token: t.token } }), createComponent(Suspense, { get fallback() {
    return ssr(S, ssrHydrationKey());
  }, get children() {
    return ssr(C, ssrHydrationKey(), escape(s.data()), escape(r.data()));
  } });
}

export { L as default };
//# sourceMappingURL=ssr2.mjs.map
