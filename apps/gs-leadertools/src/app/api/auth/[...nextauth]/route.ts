import { NextRequest } from "next/server";
import { handlers } from "@/auth";
import { getRequestOrigin } from "@/lib/requestOrigin";

/**
 * @auth/core's toInternalRequest() builds every action URL (including the
 * OAuth redirect_uri) from `req.url` directly, ignoring x-forwarded-host
 * even with trustHost enabled. Behind Caddy, req.url reflects the dev
 * server's own bind address (localhost:3000), not the proxied hostname —
 * so rewrite it here before NextAuth ever sees the request.
 */
function withForwardedOrigin(request: NextRequest): NextRequest {
  const origin = getRequestOrigin(request);
  const url = new URL(request.nextUrl.pathname + request.nextUrl.search, origin);
  return new NextRequest(url, request);
}

type RouteContext = { params: Promise<{ nextauth: string[] }> };

export async function GET(request: NextRequest, ctx: RouteContext) {
  return handlers.GET(withForwardedOrigin(request), ctx);
}

export async function POST(request: NextRequest, ctx: RouteContext) {
  return handlers.POST(withForwardedOrigin(request), ctx);
}
