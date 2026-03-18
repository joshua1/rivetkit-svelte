import { SignJWT } from "jose"
import { auth } from "~/lib/auth"

const JWT_SECRET = new TextEncoder().encode(
	process.env.JWT_SECRET || "rivetkit-solid-example-dev-secret-key!!",
)

export async function GET(event: { request: Request }) {
	const session = await auth.api.getSession({
		headers: event.request.headers,
	})

	if (!session?.user) {
		return new Response(JSON.stringify({ error: "Unauthorized" }), {
			status: 401,
			headers: { "Content-Type": "application/json" },
		})
	}

	const token = await new SignJWT({
		sub: session.user.id,
		email: session.user.email,
	})
		.setProtectedHeader({ alg: "HS256" })
		.setIssuedAt()
		.setExpirationTime("1h")
		.sign(JWT_SECRET)

	return new Response(JSON.stringify({ token }), {
		headers: { "Content-Type": "application/json" },
	})
}
