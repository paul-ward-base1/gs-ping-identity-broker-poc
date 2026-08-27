/**
 * Insert the `/g/` grayscale token into a URL that already points at the
 * local `/img/...` proxy. Idempotent. Returns non-proxy URLs unchanged.
 */
export const toGrayscaleProxyPath = (src: string | undefined): string => {
  if (!src) return '';
  return src.replace(/(\/img\/)(?!g\/)/, '$1g/');
};
