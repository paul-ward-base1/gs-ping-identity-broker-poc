import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  clearImageTransformCache,
  getCachedTransform,
  getOrProduceTransform,
  transformCacheKey,
  type TransformResult,
} from '@/lib/imageTransformCache';

const result = (n: number): TransformResult => ({ body: Buffer.alloc(n), contentType: 'image/webp' });

describe('imageTransformCache', () => {
  afterEach(() => clearImageTransformCache());

  it('builds a stable key from the transform tuple', () => {
    expect(transformCacheKey({ grayscale: false, width: 828, quality: 75, assetPath: 'a/b.png' })).toBe(
      'w828/q75/a/b.png'
    );
    expect(transformCacheKey({ grayscale: true, width: undefined, quality: undefined, assetPath: 'a/b.png' })).toBe(
      'g/w/q/a/b.png'
    );
  });

  it('encodes the tint and raster transforms in the key', () => {
    expect(
      transformCacheKey({
        grayscale: false,
        tint: 'e22f22',
        width: undefined,
        quality: undefined,
        assetPath: 'a/b.svg',
      })
    ).toBe('ce22f22/w/q/a/b.svg');
    expect(
      transformCacheKey({ grayscale: false, raster: true, width: undefined, quality: undefined, assetPath: 'a/b.svg' })
    ).toBe('r/w/q/a/b.svg');
  });

  it('produces once, then serves from cache', async () => {
    const produce = vi.fn().mockResolvedValue(result(10));
    const first = await getOrProduceTransform('k1', produce);
    const second = await getOrProduceTransform('k1', produce);

    expect(first).toBe(second);
    expect(produce).toHaveBeenCalledTimes(1);
    expect(getCachedTransform('k1')?.body.byteLength).toBe(10);
  });

  it('collapses concurrent identical requests into a single produce (single-flight)', async () => {
    let resolveProduce: (r: TransformResult) => void = () => {};
    const produce = vi.fn(
      () =>
        new Promise<TransformResult>(resolve => {
          resolveProduce = resolve;
        })
    );

    const a = getOrProduceTransform('k2', produce);
    const b = getOrProduceTransform('k2', produce);
    resolveProduce(result(20));
    const [ra, rb] = await Promise.all([a, b]);

    expect(produce).toHaveBeenCalledTimes(1);
    expect(ra).toBe(rb);
  });

  it('does not cache a failed produce and retries on the next call', async () => {
    const produce = vi.fn().mockRejectedValueOnce(new Error('boom')).mockResolvedValueOnce(result(5));

    await expect(getOrProduceTransform('k3', produce)).rejects.toThrow('boom');
    expect(getCachedTransform('k3')).toBeUndefined();

    const recovered = await getOrProduceTransform('k3', produce);
    expect(recovered.body.byteLength).toBe(5);
    expect(produce).toHaveBeenCalledTimes(2);
  });

  it('clearImageTransformCache empties the cache', async () => {
    await getOrProduceTransform('k4', () => Promise.resolve(result(8)));
    clearImageTransformCache();
    expect(getCachedTransform('k4')).toBeUndefined();
  });
});
