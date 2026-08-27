import { NextRequest } from "next/server";

/**
 * `request.nextUrl.origin` reflects wherever the Next.js dev server is actually
 * bound (e.g. localhost:3000), not the client-facing Host — Next.js doesn't
 * rewrite it behind a reverse proxy like Caddy, even with `trustHost`/
 * `allowedDevOrigins` set. Use the forwarded headers instead, which Caddy
 * (and any standard reverse proxy) sets correctly by default.
 */
export function getRequestOrigin(request: NextRequest): string {
  const forwardedHost = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!forwardedHost) return request.nextUrl.origin;

  const forwardedProto = request.headers.get("x-forwarded-proto") ?? request.nextUrl.protocol.replace(":", "");
  return `${forwardedProto}://${forwardedHost}`;
}
