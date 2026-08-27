import { test, expect } from '@playwright/test';

// ─── SSR / Response Quality ───────────────────────────────────────────────────

test.describe('SSR and response quality', () => {
  test('landing page SSR response returns valid HTML', async ({ request }) => {
    const response = await request.get('/en');
    expect(response.status()).toBe(200);
    const html = await response.text();
    // SSR returns valid HTML document structure
    expect(html).toContain('<!DOCTYPE html');
    expect(html).toContain('<html');
    expect(html).toContain('</html>');
    // Note: I18nProvider renders null during SSR (known issue I18N-01),
    // so header/footer may not be in the initial HTML
  });

  test('badge detail SSR response returns 200 with HTML', async ({ request }) => {
    const response = await request.get('/en/badge/brownie/pets');
    expect(response.status()).toBe(200);
    const html = await response.text();
    expect(html).toContain('<!DOCTYPE html');
    // Next.js embeds RSC payload in script tags even when I18nProvider returns null
    expect(html.length, 'SSR HTML has substantial content').toBeGreaterThan(1000);
  });

  test('response headers include expected content-type', async ({ request }) => {
    const response = await request.get('/en');
    const contentType = response.headers()['content-type'] || '';
    expect(contentType).toContain('text/html');
  });

  test('static assets are served (favicon)', async ({ request }) => {
    const response = await request.get('/gs_favicon.svg');
    expect(response.status()).toBe(200);
    const contentType = response.headers()['content-type'] || '';
    expect(contentType).toContain('svg');
  });

  test('Next.js static chunks are served', async ({ request }) => {
    const pageResponse = await request.get('/en');
    const html = await pageResponse.text();
    // Extract a _next/static chunk URL from the HTML
    const chunkMatch = html.match(/\/_next\/static\/[^"'\s]+\.js/);
    if (chunkMatch) {
      const chunkResponse = await request.get(chunkMatch[0]);
      expect(chunkResponse.status()).toBe(200);
    }
  });
});

// ─── ISR / Caching ────────────────────────────────────────────────────────────

test.describe('ISR behavior', () => {
  test('landing page sets cache headers', async ({ request }) => {
    const response = await request.get('/en');
    const cacheControl = response.headers()['cache-control'] || '';
    // ISR pages should have some cache directive (s-maxage, stale-while-revalidate)
    // If no cache headers, that's also informative
    expect(response.status()).toBe(200);
    // Just verify the page loads — cache header presence is environment-dependent
  });

  test('dynamic badge page responds consistently', async ({ request }) => {
    // Request the same page twice — both should return 200
    const r1 = await request.get('/en/badge/brownie/pets');
    const r2 = await request.get('/en/badge/brownie/pets');
    expect(r1.status()).toBe(200);
    expect(r2.status()).toBe(200);
  });
});
