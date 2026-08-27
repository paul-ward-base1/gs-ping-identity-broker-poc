import { type NextRequest, NextResponse } from 'next/server';
import { fetchUpstreamImage, runSharpTransform } from '@/lib/imageProxyCore';
import {
  getCachedTransform,
  getOrProduceTransform,
  transformCacheKey,
  type TransformResult,
} from '@/lib/imageTransformCache';
import { debugLog } from '@/lib/debug';

// Node.js runtime is required: sharp uses native bindings and https.Agent is Node-only
export const runtime = 'nodejs';

// Bounds: prevent abusing the resize transform as a DoS vector.
const MAX_WIDTH = 4096;
const MIN_QUALITY = 1;
const MAX_QUALITY = 100;

const CACHE_CONTROL = 'public, max-age=86400, stale-while-revalidate=604800';

const ms = (start: bigint, end: bigint) => Number(end - start) / 1e6;

/**
 * Parses optional transform tokens from the leading path segments.
 *
 * Token order (each optional, must appear in this order when present):
 *   1. `g`                    → grayscale
 *   2. `w<N>` + `q<N>` pair   → resize to width N, transcode at quality N (both or neither)
 *
 * Examples:
 *   /img/path/to/asset                 → no transforms
 *   /img/w828/q75/path/to/asset        → resize only
 *   /img/g/path/to/asset               → grayscale only
 *   /img/g/w828/q75/path/to/asset      → grayscale + resize
 *
 * Out-of-range width / quality values are dropped (transform skipped) rather
 * than echoed back into a sharp pipeline.
 */
function parsePath(segments: string[]): {
  width: number | undefined;
  quality: number | undefined;
  grayscale: boolean;
  tint: string | undefined;
  raster: boolean;
  assetPath: string;
} {
  let idx = 0;
  let grayscale = false;
  let tint: string | undefined;
  let raster = false;
  let width: number | undefined;
  let quality: number | undefined;

  // `g` (grayscale), `c<hex>` (recolor) and `r` (rasterize) are mutually
  // exclusive color ops.
  if (segments[idx] === 'g') {
    grayscale = true;
    idx += 1;
  } else if (/^c[0-9a-f]{6}$/i.test(segments[idx] ?? '')) {
    tint = segments[idx].slice(1).toLowerCase();
    idx += 1;
  } else if (segments[idx] === 'r') {
    raster = true;
    idx += 1;
  }

  const first = segments[idx];
  const second = segments[idx + 1];
  if (first && second && /^w\d+$/.test(first) && /^q\d+$/.test(second)) {
    const w = parseInt(first.slice(1), 10);
    const q = parseInt(second.slice(1), 10);
    if (w >= 1 && w <= MAX_WIDTH && q >= MIN_QUALITY && q <= MAX_QUALITY) {
      width = w;
      quality = q;
      idx += 2;
    }
  }

  return {
    width,
    quality,
    grayscale,
    tint,
    raster,
    assetPath: segments.slice(idx).join('/'),
  };
}

const imageResponse = ({ body, contentType }: TransformResult) =>
  new NextResponse(new Uint8Array(body), {
    status: 200,
    headers: { 'Content-Type': contentType, 'Cache-Control': CACHE_CONTROL },
  });

/**
 * Reverse-proxy for AEM DAM assets.
 *
 * Keeps the AEM origin hidden from the browser and prevents /_next/image
 * from being used as a hotlinking or SSRF vector.
 *
 * Routes:
 *   GET /img/<asset-path>               → serves the asset as-is
 *   GET /img/w<N>/q<N>/<asset-path>     → resizes to width N, converts to WebP at quality N
 */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const t0 = process.hrtime.bigint();
  const { path } = await params;

  if (!process.env.AEM_API || !process.env.AEM_DAM_PATH) {
    return new NextResponse('Image proxy not configured', { status: 503 });
  }

  const { width, quality, grayscale, tint, raster, assetPath } = parsePath(path);

  // Reject traversal attempts before constructing the upstream URL.
  if (!assetPath || assetPath.includes('..')) {
    return new NextResponse(null, { status: 400 });
  }

  const wantsTransform = width !== undefined || grayscale || tint !== undefined || raster;
  const cacheKey = transformCacheKey({ grayscale, tint, raster, width, quality, assetPath });

  // Transform-cache hit: skip both the AEM fetch and the sharp re-encode.
  if (wantsTransform) {
    const cached = getCachedTransform(cacheKey);
    if (cached) {
      debugLog('img-proxy', 'done', { assetPath, hit: true, totalMs: ms(t0, process.hrtime.bigint()) });
      return imageResponse(cached);
    }
  }

  const tFetch = process.hrtime.bigint();
  let upstream;
  try {
    upstream = await fetchUpstreamImage(assetPath);
  } catch (err) {
    console.error('[img-proxy] upstream fetch failed', { assetPath, err });
    return new NextResponse(null, { status: 502 });
  }
  if (upstream.status !== 200 || !upstream.buffer) {
    return new NextResponse(null, { status: upstream.status });
  }
  const upstreamMs = ms(tFetch, process.hrtime.bigint());
  const { buffer: upstreamBuffer, contentType = 'application/octet-stream' } = upstream;

  const isImage = contentType.startsWith('image/');
  const isSvg = contentType.includes('svg');
  const needsTransform = isImage && wantsTransform;

  // Resize-only on SVGs stays a passthrough so vector logos remain crisp;
  // grayscale / recolor / rasterize on SVGs goes through sharp (libvips rasterises).
  const canTransform = needsTransform && (!isSvg || grayscale || tint !== undefined || raster);

  if (canTransform) {
    try {
      const result = await getOrProduceTransform(cacheKey, async () => {
        const tSharp = process.hrtime.bigint();
        const produced = await runSharpTransform(upstreamBuffer, {
          assetPath,
          width,
          quality,
          grayscale,
          tint,
          raster,
        });
        debugLog('img-proxy', 'encode', {
          assetPath,
          width,
          grayscale,
          outBytes: produced.body.byteLength,
          sharpMs: ms(tSharp, process.hrtime.bigint()),
        });
        return produced;
      });
      debugLog('img-proxy', 'done', { assetPath, hit: false, upstreamMs, totalMs: ms(t0, process.hrtime.bigint()) });
      return imageResponse(result);
    } catch (err) {
      console.error('[img-proxy] sharp processing failed', { assetPath, width, grayscale, err });
      return new NextResponse(null, { status: 500 });
    }
  }

  debugLog('img-proxy', 'done', { assetPath, hit: false, passthrough: true, upstreamMs });
  return new NextResponse(new Uint8Array(upstreamBuffer), {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Cache-Control': CACHE_CONTROL,
      ...(isSvg && { 'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'" }),
    },
  });
}
