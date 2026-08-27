/**
 * Base URL the server uses to fetch its OWN assets (fonts, /img proxy) and
 * self-routes (warm-up requests).
 *
 * In AWS deployments the public hostname routes through an ALB that does not
 * reliably support hairpin NAT from inside the same VPC: a container trying
 * to reach https://<public-host> times out (or, intermittently, hits an
 * upstream that isn't speaking TLS, producing ERR_SSL_WRONG_VERSION_NUMBER).
 * INTERNAL_BASE_URL bypasses the public path by pointing self-fetches at the
 * container's own loopback interface.
 *
 * Resolution:
 *   1. `process.env.INTERNAL_BASE_URL` if set (trailing slashes stripped).
 *   2. Otherwise `http://127.0.0.1:${PORT}`, where PORT defaults to 3000
 *      (matches `next dev` / `next start` default). The production Docker
 *      image sets PORT=80, so containers default to http://127.0.0.1:80.
 *
 * Only used server-side. The public origin (`request.nextUrl.origin`) must
 * still be used for anything user-visible — most notably the URL encoded
 * into the QR code printed on the PDF.
 */
export const getInternalBaseUrl = (): string => {
  const explicit = process.env.INTERNAL_BASE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, '');

  const rawPort = process.env.PORT?.trim() || '3000';
  const port = parseInt(rawPort, 10);
  if (isNaN(port) || port < 1 || port > 65535) {
    console.warn(`[internalBaseUrl] PORT="${rawPort}" is not a valid port number; falling back to 3000`);
    return 'http://127.0.0.1:3000';
  }
  return `http://127.0.0.1:${port}`;
};
