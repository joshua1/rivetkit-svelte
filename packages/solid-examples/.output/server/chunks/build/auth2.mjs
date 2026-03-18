import { ssr, ssrHydrationKey, escape, createComponent, ssrAttribute, ssrStyleProperty } from 'solid-js/web';
import { createSignal, Show } from 'solid-js';
import { a } from './auth-client-soFIT0rW2.mjs';
import 'better-auth/solid';

var S = ["<p", ">Signed in as <strong>", "</strong></p>"], f = ["<button", ' type="button">Sign Out</button>'], v = ["<p", '><a href="/">Go to counter</a></p>'], y = ["<h1", ">", "</h1>"], $ = ["<div", '><input type="text" placeholder="Name"', " required></div>"], b = ["<form", "><!--$-->", '<!--/--><div><input type="email" placeholder="Email"', ' required></div><div><input type="password" placeholder="Password (min 8 chars)"', ' minlength="8" required></div><button type="submit"', ">", "</button></form>"], w = ["<p", ' style="', '">', "</p>"], _ = ["<p", '><button type="button">', "</button></p>"], P = ["<div", "><!--$-->", "<!--/--><!--$-->", "<!--/--></div>"];
function H() {
  const [a$1, U] = createSignal(false), [d, I] = createSignal(""), [m, q] = createSignal(""), [g, A] = createSignal(""), [l, E] = createSignal(""), [u, N] = createSignal(false), i = a.useSession();
  return ssr(P, ssrHydrationKey(), escape(createComponent(Show, { get when() {
    var _a;
    return (_a = i()) == null ? void 0 : _a.data;
  }, get children() {
    var _a, _b;
    return [ssr(S, ssrHydrationKey(), escape((_b = (_a = i()) == null ? void 0 : _a.data) == null ? void 0 : _b.user.email)), ssr(f, ssrHydrationKey()), ssr(v, ssrHydrationKey())];
  } })), escape(createComponent(Show, { get when() {
    var _a, _b;
    return !((_a = i()) == null ? void 0 : _a.data) && !((_b = i()) == null ? void 0 : _b.isPending);
  }, get children() {
    return [ssr(y, ssrHydrationKey(), a$1() ? "Sign Up" : "Sign In"), ssr(b, ssrHydrationKey(), escape(createComponent(Show, { get when() {
      return a$1();
    }, get children() {
      return ssr($, ssrHydrationKey(), ssrAttribute("value", escape(g(), true), false));
    } })), ssrAttribute("value", escape(d(), true), false), ssrAttribute("value", escape(m(), true), false), ssrAttribute("disabled", u(), true), u() ? "Loading..." : a$1() ? "Sign Up" : "Sign In"), createComponent(Show, { get when() {
      return l();
    }, get children() {
      return ssr(w, ssrHydrationKey(), ssrStyleProperty("color:", "red"), escape(l()));
    } }), ssr(_, ssrHydrationKey(), a$1() ? "Already have an account? Sign In" : "Need an account? Sign Up")];
  } })));
}

export { H as default };
//# sourceMappingURL=auth2.mjs.map
