import type { ImageLoaderProps } from 'next/image';

export default function aemImageLoader({ src, width, quality }: ImageLoaderProps): string {
  // Static public assets (e.g. /gs_logo.svg) are not AEM DAM images — serve as-is
  if (!src.startsWith('/img/')) return src;
  // Strip /img/ prefix so resize tokens are inserted right after /img/
  const path = src.slice('/img/'.length);
  return `/img/w${width}/q${quality ?? 75}/${path}`;
}
