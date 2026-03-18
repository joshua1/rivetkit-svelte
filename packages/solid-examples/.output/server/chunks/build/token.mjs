import { SignJWT } from 'jose';
import { o } from './auth-BxWnXXi5.mjs';
import 'better-auth';
import 'better-sqlite3';

const i = new TextEncoder().encode(process.env.JWT_SECRET || "rivetkit-solid-example-dev-secret-key!!");
async function c(s) {
  const e = await o.api.getSession({ headers: s.request.headers });
  if (!(e == null ? void 0 : e.user)) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
  const t = await new SignJWT({ sub: e.user.id, email: e.user.email }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("1h").sign(i);
  return new Response(JSON.stringify({ token: t }), { headers: { "Content-Type": "application/json" } });
}

export { c as GET };
//# sourceMappingURL=token.mjs.map
