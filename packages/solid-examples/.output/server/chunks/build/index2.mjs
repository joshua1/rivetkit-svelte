import { createComponent, ssr, ssrHydrationKey, escape } from 'solid-js/web';
import { g as bt } from '../nitro/nitro.mjs';
import { Show } from 'solid-js';
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

var s = ["<div", "><h1>Counter: <!--$-->", "<!--/--></h1><button>Increment</button><button>Reset</button><h1>Counter 2: <!--$-->", "<!--/--></h1><button>Double Count</button></div>"], l = ["<p", ">Loading...</p>"];
function h() {
  var _a;
  const t = (_a = bt) == null ? void 0 : _a({ name: "counter", key: ["test-counter"] }), e = t == null ? void 0 : t.useActionQuery({ action: "getCount", event: "newCount", initialValue: 2 }), o = t == null ? void 0 : t.useActionQuery({ action: "getCountDouble", event: "newDoubleCount", initialValue: 3 });
  return createComponent(Show, { get when() {
    return !(e == null ? void 0 : e.isLoading) && !(o == null ? void 0 : o.isLoading);
  }, get fallback() {
    return ssr(l, ssrHydrationKey());
  }, get children() {
    return ssr(s, ssrHydrationKey(), escape(e == null ? void 0 : e.value), escape(o == null ? void 0 : o.value));
  } });
}

export { h as default };
//# sourceMappingURL=index2.mjs.map
