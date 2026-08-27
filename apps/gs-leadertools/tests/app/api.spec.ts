import { test, expect } from '@playwright/test';

// ─── API Route Health Checks ──────────────────────────────────────────────────

test.describe('API routes', () => {
  test('/health returns 200 with status and commit', async ({ request }) => {
    const response = await request.get('/health');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.status).toBe('ok');
    expect(typeof body.commit).toBe('string');
  });

  test('/api/activity-details returns JSON (no params → error)', async ({ request }) => {
    const response = await request.get('/api/activity-details');
    expect(response.status()).toBeLessThan(500);
    const contentType = response.headers()['content-type'] || '';
    expect(contentType).toContain('application/json');
  });

  test('/api/search/reindex responds without 500', async ({ request }) => {
    const response = await request.get('/api/search/reindex');
    // May return 200 or error — but should NOT 500
    expect(response.status(), 'reindex endpoint does not crash').not.toBe(500);
  });
});
