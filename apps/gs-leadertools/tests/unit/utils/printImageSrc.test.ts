import { describe, expect, it } from 'vitest';
import { printImageSrc } from '@/utils/printImageSrc';

describe('printImageSrc', () => {
  it('routes through the grayscale proxy in black & white mode', () => {
    expect(printImageSrc('/img/a/b.png', false)).toBe('/img/g/a/b.png');
    expect(printImageSrc('/img/a/b.svg', false)).toBe('/img/g/a/b.svg');
  });

  it('passes raster sources through untouched in color mode', () => {
    expect(printImageSrc('/img/a/b.png', true)).toBe('/img/a/b.png');
    expect(printImageSrc('/img/a/b.jpg', true)).toBe('/img/a/b.jpg');
  });

  it('rasterizes SVG sources in color mode (react-pdf can not draw SVG)', () => {
    expect(printImageSrc('/img/a/b.svg', true)).toBe('/img/r/a/b.svg');
    expect(printImageSrc('/img/a/b.svg?v=2', true)).toBe('/img/r/a/b.svg?v=2');
  });
});
