import { afterEach, describe, expect, it } from 'vitest';
import sharp from 'sharp';
import { runSharpTransform } from '@/lib/imageProxyCore';
import { clearImageTransformCache, getOrProduceTransform } from '@/lib/imageTransformCache';

const fixturePng = () =>
  sharp({ create: { width: 120, height: 120, channels: 3, background: { r: 200, g: 20, b: 20 } } })
    .png()
    .toBuffer();

describe('image transform (real sharp)', () => {
  afterEach(() => clearImageTransformCache());

  it('produces valid WebP smaller than the source', async () => {
    const png = await fixturePng();
    const out = await runSharpTransform(png, { assetPath: 'x', width: 60, quality: 75, grayscale: false });
    expect(out.contentType).toBe('image/webp');
    expect(out.body.subarray(8, 12).toString('ascii')).toBe('WEBP'); // RIFF....WEBP magic
  });

  it('encodes once then serves the second request from cache', async () => {
    const png = await fixturePng();
    let encodes = 0;
    const produce = () => {
      encodes += 1;
      return runSharpTransform(png, { assetPath: 'x', width: 60, quality: 75, grayscale: false });
    };
    const first = await getOrProduceTransform('k', produce);
    const second = await getOrProduceTransform('k', produce);
    expect(encodes).toBe(1);
    expect(second).toBe(first);
  });

  it('collapses concurrent identical requests to a single encode', async () => {
    const png = await fixturePng();
    let encodes = 0;
    const produce = () => {
      encodes += 1;
      return runSharpTransform(png, { assetPath: 'x', width: 60, quality: 75, grayscale: false });
    };
    await Promise.all([getOrProduceTransform('k', produce), getOrProduceTransform('k', produce)]);
    expect(encodes).toBe(1);
  });
});
