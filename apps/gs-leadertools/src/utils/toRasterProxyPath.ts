/**
 * Insert the `/r/` token into an `/img/...` proxy URL to rasterize an SVG to PNG
 * (react-pdf `<Image>` can't draw SVG). Idempotent; non-proxy URLs unchanged.
 */
export const toRasterProxyPath = (src: string | undefined): string => {
  if (!src) return '';
  return src.replace(/(\/img\/)(?!r\/)/, '$1r/');
};
