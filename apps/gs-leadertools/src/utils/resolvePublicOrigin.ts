import { NextRequest } from 'next/server';

/**
 * Returns the public origin to embed in PDFs (footer URL, QR code).
 *
 * Warm-up self-fetches pass the real public origin as `?origin=` because
 * req.nextUrl.origin inside those requests resolves to the loopback address
 * (http://127.0.0.1:PORT). The param is URL-encoded and validated here before
 * being trusted: only https: URLs (or http: localhost/127.0.0.1 for local dev)
 * are accepted — everything else falls back to the host-header origin.
 *
 * Direct browser requests carry no ?origin param and derive the origin from
 * the Host and X-Forwarded-Proto headers. This is reliable across both Next.js
 * dev (which normalises req.nextUrl.origin to localhost regardless of the Host
 * header) and production (where the ALB sets the correct Host and proto).
 */
export function resolvePublicOrigin(req: NextRequest): string {
  const raw = req.nextUrl.searchParams.get('origin');
  if (!raw) {
    const proto = req.headers.get('x-forwarded-proto') ?? req.nextUrl.protocol.replace(':', '');
    const host = req.headers.get('host') ?? req.nextUrl.host;
    return `${proto}://${host}`;
  }

  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return req.nextUrl.origin;
  }

  const isHttps = parsed.protocol === 'https:';
  const isLocalHttp =
    parsed.protocol === 'http:' && (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1');

  if (!isHttps && !isLocalHttp) return req.nextUrl.origin;

  return parsed.origin;
}
