import { e as en, q, v as vt } from '../nitro/nitro.mjs';
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
import 'solid-js';
import 'solid-js/web';
import 'solid-js/web/storage';
import 'rivetkit/log';
import 'rivetkit/client';

const D = en(async () => {
  const r = await q(vt, { actor: "counter", key: ["test-counter"], action: "getCount", event: "newCount" }), o = await q(vt, { actor: "counter", key: ["test-counter"], action: "getCountDouble", event: "newDoubleCount" });
  return { count: r, countDouble: o };
}, "src_routes_ssr_tsx--getCounterData_cache", "/Users/josi/Documents/ShiftLabs/Projects/rivetkit-svelte/packages/solid-examples/src/routes/ssr.tsx?pick=route&tsr-directive-use-server=");

export { D as getCounterData_cache };
//# sourceMappingURL=ssr-GlLJj5UT.mjs.map
