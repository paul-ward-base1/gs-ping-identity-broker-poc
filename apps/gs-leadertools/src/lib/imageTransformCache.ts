import { ByteBudgetLruCache } from '@/lib/byteBudgetLruCache';

export interface TransformResult {
  body: Buffer;
  contentType: string;
}

const DEFAULT_MAX_BYTES = 64 * 1024 * 1024; // override via IMAGE_TRANSFORM_CACHE_MAX_BYTES once task limit is known

const parseMaxBytes = (): number => {
  const raw = process.env.IMAGE_TRANSFORM_CACHE_MAX_BYTES;
  const parsed = raw ? Number.parseInt(raw, 10) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_MAX_BYTES;
};

const IDLE_TTL_MS = 60 * 60 * 1000; // 1h

// Anchor on globalThis so the warmer (instrumentation) and the route share one instance across Next's module scopes.
const globalStore = globalThis as unknown as {
  __imageTransformCache?: ByteBudgetLruCache<TransformResult>;
  __imageTransformInflight?: Map<string, Promise<TransformResult>>;
};

const cache = (globalStore.__imageTransformCache ??= new ByteBudgetLruCache<TransformResult>({
  name: 'image-transform',
  maxBytes: parseMaxBytes(),
  idleTtlMs: IDLE_TTL_MS,
  sizeOf: r => r.body.byteLength,
}));

const inflight = (globalStore.__imageTransformInflight ??= new Map<string, Promise<TransformResult>>());

export const transformCacheKey = (opts: {
  grayscale: boolean;
  tint?: string;
  raster?: boolean;
  width: number | undefined;
  quality: number | undefined;
  assetPath: string;
}): string =>
  `${opts.grayscale ? 'g/' : ''}${opts.tint ? `c${opts.tint}/` : ''}${opts.raster ? 'r/' : ''}w${opts.width ?? ''}/q${opts.quality ?? ''}/${opts.assetPath}`;

export const getCachedTransform = (key: string): TransformResult | undefined => cache.get(key);

// Returns cache, joins an in-flight encode, or produces once. Concurrent identical keys collapse to one encode.
export const getOrProduceTransform = async (
  key: string,
  produce: () => Promise<TransformResult>
): Promise<TransformResult> => {
  const cached = cache.get(key);
  if (cached) return cached;

  const existing = inflight.get(key);
  if (existing) return existing;

  const promise = (async () => {
    const result = await produce();
    cache.set(key, result);
    return result;
  })();
  inflight.set(key, promise);
  try {
    return await promise;
  } finally {
    inflight.delete(key);
  }
};

export const clearImageTransformCache = (): void => {
  cache.clear();
  inflight.clear();
};

export const imageTransformCacheStats = () => ({
  totalBytes: cache.totalBytes,
  entries: cache.size,
  inflight: inflight.size,
});
