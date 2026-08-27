import { toGrayscaleProxyPath } from './toGrayscaleProxyPath';
import { toRasterProxyPath } from './toRasterProxyPath';

const isSvg = (src: string): boolean => /\.svg(\?|$)/i.test(src);

/**
 * Resolve an image src for print: grayscale in B&W; in color, SVGs are
 * rasterized to PNG (react-pdf can't draw SVG) and rasters pass through.
 */
export const printImageSrc = (src: string, color: boolean): string => {
  if (!color) return toGrayscaleProxyPath(src);
  return isSvg(src) ? toRasterProxyPath(src) : src;
};
