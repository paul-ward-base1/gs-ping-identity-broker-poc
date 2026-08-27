import https from 'https';
import sharp from 'sharp';
import { imageProxyAxios } from '@/lib/imageProxyCache';
import { getOrProduceTransform, transformCacheKey, type TransformResult } from '@/lib/imageTransformCache';

// libvips threads per op; tune via SHARP_CONCURRENCY for the task's vCPU (unset = sharp default).
const sharpConcurrency = Number.parseInt(process.env.SHARP_CONCURRENCY ?? '', 10);
if (Number.isFinite(sharpConcurrency) && sharpConcurrency > 0) {
  sharp.concurrency(sharpConcurrency);
}

// WebP effort 0–6; default 4 keeps output unchanged, lower is faster.
const parsedEffort = Number.parseInt(process.env.IMAGE_WEBP_EFFORT ?? '', 10);
const WEBP_EFFORT = Number.isFinite(parsedEffort) && parsedEffort >= 0 && parsedEffort <= 6 ? parsedEffort : 4;

// DPI for rasterizing SVG inputs, so small badge icons stay crisp.
const SVG_RENDER_DENSITY = 288;

// Pooled keepAlive sockets so an image grid reuses one warm TLS connection (mirrors api.ts).
const httpsAgent = new https.Agent({
  keepAlive: true,
  keepAliveMsecs: 30000,
  maxSockets: 50,
  rejectUnauthorized: process.env.DISABLE_TLS_VERIFY !== 'true',
});

// Bounds time-in-system so a slow AEM under a burst can't tie up sockets/memory.
const UPSTREAM_TIMEOUT_MS = 10000;

const authHeader = process.env.AEM_AUTH
  ? { Authorization: `Basic ${Buffer.from(process.env.AEM_AUTH).toString('base64')}` }
  : {};

export interface TransformOptions {
  assetPath: string;
  width: number | undefined;
  quality: number | undefined;
  grayscale: boolean;
  /** 6-digit hex (no `#`) to repaint a monochrome icon via its alpha mask. */
  tint?: string;
  /** Force rasterizing an SVG to PNG (full color) for renderers that can't draw SVG. */
  raster?: boolean;
}

export interface UpstreamResult {
  status: number;
  buffer?: Buffer;
  contentType?: string;
}

/** Fetch the raw AEM master (cached + concurrent-deduped by imageProxyAxios). */
export const fetchUpstreamImage = async (assetPath: string): Promise<UpstreamResult> => {
  const aemApi = process.env.AEM_API;
  const damPath = process.env.AEM_DAM_PATH;
  if (!aemApi || !damPath) return { status: 503 };

  const url = `${aemApi}${damPath}/${assetPath}`;
  const response = await imageProxyAxios.get<ArrayBuffer>(url, {
    httpsAgent,
    headers: authHeader,
    responseType: 'arraybuffer',
    timeout: UPSTREAM_TIMEOUT_MS,
    validateStatus: () => true,
  });

  if (response.status !== 200) return { status: response.status };
  return {
    status: 200,
    buffer: Buffer.from(response.data),
    contentType: (response.headers['content-type'] as string | undefined) ?? 'application/octet-stream',
  };
};

/** Run the sharp pipeline for a transform variant. Pure CPU; no fetch, no cache. */
export const runSharpTransform = async (buffer: Buffer, opts: TransformOptions): Promise<TransformResult> => {
  // Recolor: paint a solid brand color through the icon's alpha (mirrors the
  // web CSS mask-image); PNG keeps transparency.
  if (opts.tint) {
    let base = sharp(buffer, { density: SVG_RENDER_DENSITY }).ensureAlpha();
    if (opts.width !== undefined) {
      base = base.resize({ width: opts.width, fit: 'inside', withoutEnlargement: true });
    }
    const mask = await base.png().toBuffer();
    const { width: w = 0, height: h = 0 } = await sharp(mask).metadata();
    if (w > 0 && h > 0) {
      const body = await sharp({ create: { width: w, height: h, channels: 4, background: `#${opts.tint}` } })
        .composite([{ input: mask, blend: 'dest-in' }])
        .png()
        .toBuffer();
      return { body, contentType: 'image/png' };
    }
    return { body: mask, contentType: 'image/png' };
  }

  let pipeline = sharp(buffer, { density: SVG_RENDER_DENSITY });
  if (opts.width !== undefined) {
    pipeline = pipeline.resize({ width: opts.width, fit: 'inside', withoutEnlargement: true });
  }
  if (opts.grayscale) {
    pipeline = pipeline.grayscale();
  }
  const body =
    opts.width === undefined
      ? await pipeline.png().toBuffer()
      : await pipeline.webp({ quality: opts.quality ?? 75, effort: WEBP_EFFORT }).toBuffer();
  return { body, contentType: opts.width === undefined ? 'image/png' : 'image/webp' };
};

// Fetch + transform + cache a variant, single-flighted. Used by the warmer (the route fetches first).
export const getOrProduceTransformedImage = async (opts: TransformOptions): Promise<TransformResult | null> => {
  const key = transformCacheKey(opts);
  return getOrProduceTransform(key, async () => {
    const upstream = await fetchUpstreamImage(opts.assetPath);
    if (upstream.status !== 200 || !upstream.buffer) {
      throw new Error(`upstream ${upstream.status} for ${opts.assetPath}`);
    }
    // SVGs with resize-only stay passthrough elsewhere; the warmer only feeds raster paths.
    if (!upstream.contentType?.startsWith('image/')) {
      throw new Error(`non-image content-type ${upstream.contentType} for ${opts.assetPath}`);
    }
    return runSharpTransform(upstream.buffer, opts);
  });
};
