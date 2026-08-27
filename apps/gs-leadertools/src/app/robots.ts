import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  if (process.env.NOINDEX !== 'true') {
    return { rules: { userAgent: '*', allow: '/' } };
  }
  return { rules: { userAgent: '*', disallow: '/' } };
}
