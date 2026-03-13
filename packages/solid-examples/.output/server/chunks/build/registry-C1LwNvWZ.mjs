import { actor, setup } from 'rivetkit';

const u = actor({ state: { count: 0, countDouble: 3 }, onStateChange: (t, e) => {
  console.log("state changed", JSON.stringify(e)), console.log("previous state", JSON.stringify(t.state));
}, actions: { increment: (t, e) => (console.log("incrementing by", e), t.state.count += e, t.broadcast("newCount", t.state.count), t.state.count), getCount: (t) => t.state.count, getCountDouble: (t) => t.state.countDouble, reset: (t) => (t.state.count = 0, t.state.countDouble = 3, t.broadcast("newCount", t.state.count), t.broadcast("newDoubleCount", t.state.countDouble), t.state.count), doubleIncrement: (t, e) => (console.log("incrementing by ", e), t.state.countDouble += e, t.broadcast("newDoubleCount", t.state.countDouble), t.state.countDouble) } }), a = setup({ use: { counter: u } });

export { a };
//# sourceMappingURL=registry-C1LwNvWZ.mjs.map
