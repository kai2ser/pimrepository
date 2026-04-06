import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/auth";
import { rateLimit } from "@/lib/rate-limit";
import type { Session } from "next-auth";

type AuthSuccess = {
  authorized: true;
  session: Session;
};

type AuthFailure = {
  authorized: false;
  response: NextResponse;
};

/**
 * Guard for API route handlers. Checks authentication and applies
 * rate limiting (30 write requests per minute per IP).
 *
 * Usage:
 *   const authResult = await requireAuth();
 *   if (!authResult.authorized) return authResult.response;
 *   // authResult.session is available here
 */
export async function requireAuth(): Promise<AuthSuccess | AuthFailure> {
  const session = await auth();

  if (!session?.user) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      ),
    };
  }

  // Rate limit write operations by IP
  const hdrs = await headers();
  const ip =
    hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    hdrs.get("x-real-ip") ??
    "unknown";

  const rl = rateLimit(ip, { limit: 30, windowSeconds: 60 });

  if (!rl.allowed) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
          },
        }
      ),
    };
  }

  return { authorized: true, session: session as Session };
}

/** Re-export auth as getSession for use in Server Components */
export { auth as getSession } from "@/auth";
