import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { proxy } from '@/proxy';

const req = (path: string, cookies: Record<string, string> = {}) => {
  const url = `https://example.com${path}`;
  const headers = new Headers();
  if (Object.keys(cookies).length) {
    headers.set(
      'cookie',
      Object.entries(cookies)
        .map(([k, v]) => `${k}=${v}`)
        .join('; ')
    );
  }
  return new NextRequest(url, { headers });
};

describe('proxy', () => {
  describe('locale routes', () => {
    it('passes through and sets Cache-Control', () => {
      const res = proxy(req('/en/badge/junior/auto-by-design'));
      expect(res.headers.get('Cache-Control')).toBe('public, s-maxage=300, stale-while-revalidate=60');
    });

    it('sets Vary for RSC headers to prevent CDN serving flight payloads as HTML', () => {
      const res = proxy(req('/en/badge/junior/auto-by-design'));
      expect(res.headers.get('Vary')).toBe('RSC, Next-Router-State-Tree, Next-Router-Prefetch');
    });

    it('sets NEXT_LOCALE cookie to the locale in the path', () => {
      const res = proxy(req('/en/badge/junior/auto-by-design'));
      const cookie = res.cookies.get('NEXT_LOCALE');
      expect(cookie?.value).toBe('en');
    });

    it('sets NEXT_LOCALE cookie for spanish locale', () => {
      const res = proxy(req('/es/insignia/junior/auto-by-design'));
      const cookie = res.cookies.get('NEXT_LOCALE');
      expect(cookie?.value).toBe('es');
    });
  });

  describe('no-locale routes', () => {
    it('redirects to the locale from the NEXT_LOCALE cookie', () => {
      const res = proxy(req('/badge/junior/auto-by-design', { NEXT_LOCALE: 'es' }));
      expect(res.status).toBe(307);
      expect(res.headers.get('location')).toContain('/es/badge/junior/auto-by-design');
    });

    it('redirects to the en fallback when no cookie is set', () => {
      const res = proxy(req('/badge/junior/auto-by-design'));
      expect(res.status).toBe(307);
      expect(res.headers.get('location')).toContain('/en/badge/junior/auto-by-design');
    });
  });

  describe('passthrough paths', () => {
    it('does not set cache headers for /_next/ paths', () => {
      const res = proxy(req('/_next/static/chunks/main.js'));
      expect(res.headers.get('Cache-Control')).toBeNull();
    });

    it('does not set cache headers for /api/ paths', () => {
      const res = proxy(req('/api/search/badge/en'));
      expect(res.headers.get('Cache-Control')).toBeNull();
    });
  });

  describe('/health', () => {
    it('returns 200 with status ok', async () => {
      const res = proxy(req('/health'));
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.status).toBe('ok');
    });
  });
});
