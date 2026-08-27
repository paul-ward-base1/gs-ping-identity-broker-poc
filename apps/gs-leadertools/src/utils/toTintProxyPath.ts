/**
 * Insert a `/c<hex>/` recolor token into an `/img/...` proxy URL so a monochrome
 * SVG icon is repainted in the given brand color. Idempotent; returns the src
 * unchanged for a non-proxy URL or an invalid color.
 */
export const toTintProxyPath = (src: string | undefined, hex: string | undefined): string => {
  if (!src) return '';
  const token = (hex ?? '').replace('#', '').toLowerCase();
  if (!/^[0-9a-f]{6}$/.test(token)) return src;
  return src.replace(/(\/img\/)(?!c[0-9a-f]{6}\/)/, `$1c${token}/`);
};
