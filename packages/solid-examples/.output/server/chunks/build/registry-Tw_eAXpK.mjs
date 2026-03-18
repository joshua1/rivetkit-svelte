import { jwtVerify } from 'jose';
import { actor, setup } from 'rivetkit';

const a = new TextEncoder().encode(process.env.JWT_SECRET || "rivetkit-solid-example-dev-secret-key!!"), c = actor({ state: { count: 0, countDouble: 3 }, onBeforeConnect: async (t, e) => {
  const n = e == null ? void 0 : e.token;
  if (!n) throw new Error("Unauthorized: No token provided");
  try {
    const { payload: o } = await jwtVerify(n, a);
    if (!o.sub) throw new Error("Invalid token: no subject");
  } catch (o) {
    throw new Error(`Unauthorized: ${o instanceof Error ? o.message : "Invalid token"}`);
  }
}, onStateChange: (t, e) => {
  console.log("state changed", JSON.stringify(e)), console.log("previous state", JSON.stringify(t.state));
}, actions: { increment: (t, e) => (console.log("incrementing by", e), t.state.count += e, t.broadcast("newCount", t.state.count), t.state.count), getCount: (t) => t.state.count, getCountDouble: (t) => t.state.countDouble, reset: (t) => (t.state.count = 0, t.state.countDouble = 3, t.broadcast("newCount", t.state.count), t.broadcast("newDoubleCount", t.state.countDouble), t.state.count), doubleIncrement: (t, e) => (console.log("incrementing by ", e), t.state.countDouble += e, t.broadcast("newDoubleCount", t.state.countDouble), t.state.countDouble) } }), b = setup({ use: { counter: c } });

export { b };
//# sourceMappingURL=registry-Tw_eAXpK.mjs.map
