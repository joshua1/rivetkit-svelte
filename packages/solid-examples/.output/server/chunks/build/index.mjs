import { ssr, ssrHydrationKey, escape, createComponent } from 'solid-js/web';
import { a as at } from './chunk-UFMCWDHH-DWEZyrAY.mjs';
import { createSignal, createEffect, Show } from 'solid-js';
import { a } from './auth-client-soFIT0rW.mjs';
import './chunk-ACNSKN6D-CWv6jrK3.mjs';
import 'rivetkit/log';
import 'better-auth/solid';

var g = ["<p", ">Loading session...</p>"], m = ["<p", '><a href="/auth">Sign in</a> to access your personal counter.</p>'], h = ["<p", ">Signed in as <strong>", "</strong></p>"], b = ["<div", "><!--$-->", "<!--/--><!--$-->", "<!--/--><!--$-->", "<!--/--></div>"], f = ["<div", "><h1>Counter: <!--$-->", '<!--/--></h1><button type="button">Increment</button><button type="button">Reset</button><h1>Counter 2: <!--$-->', '<!--/--></h1><button type="button">Double Count</button></div>'], y = ["<p", ">Loading counter...</p>"];
function D() {
  const t = a.useSession(), [i, n] = createSignal(null);
  return createEffect(() => {
    var _a;
    ((_a = t()) == null ? void 0 : _a.data) ? fetch("/api/token", { credentials: "include" }).then((e) => e.ok ? e.json() : null).then((e) => (e == null ? void 0 : e.token) && n(e.token)).catch(() => n(null)) : n(null);
  }), ssr(b, ssrHydrationKey(), escape(createComponent(Show, { get when() {
    var _a;
    return (_a = t()) == null ? void 0 : _a.isPending;
  }, get children() {
    return ssr(g, ssrHydrationKey());
  } })), escape(createComponent(Show, { get when() {
    var _a, _b;
    return !((_a = t()) == null ? void 0 : _a.isPending) && !((_b = t()) == null ? void 0 : _b.data);
  }, get children() {
    return ssr(m, ssrHydrationKey());
  } })), escape(createComponent(Show, { get when() {
    var _a;
    return ((_a = t()) == null ? void 0 : _a.data) && i();
  }, get children() {
    var _a, _b;
    return [ssr(h, ssrHydrationKey(), escape((_b = (_a = t()) == null ? void 0 : _a.data) == null ? void 0 : _b.user.email)), createComponent(C, { get userId() {
      return t().data.user.id;
    }, get token() {
      return i();
    } })];
  } })));
}
function C(t) {
  const i = at({ name: "counter", key: ["user-counter", t.userId], params: { token: t.token } }), n = i == null ? void 0 : i.useActionQuery({ action: "getCount", event: "newCount", initialValue: 0 }), e = i == null ? void 0 : i.useActionQuery({ action: "getCountDouble", event: "newDoubleCount", initialValue: 0 });
  return createComponent(Show, { get when() {
    return !(n == null ? void 0 : n.isLoading) && !(e == null ? void 0 : e.isLoading);
  }, get fallback() {
    return ssr(y, ssrHydrationKey());
  }, get children() {
    return ssr(f, ssrHydrationKey(), escape(n == null ? void 0 : n.value), escape(e == null ? void 0 : e.value));
  } });
}

export { D as default };
//# sourceMappingURL=index.mjs.map
