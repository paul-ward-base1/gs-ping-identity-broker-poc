import { test, expect, type Page } from '@playwright/test';

async function waitForAppReady(page: Page) {
  await page.waitForSelector('header', { state: 'visible', timeout: 30000 });
}

// ─── Navigation & Routing ─────────────────────────────────────────────────────

test.describe('Navigation', () => {
  test('root / redirects to a valid locale', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/(en|es)/);
  });

  test('badge detail pages are reachable via direct URL', async ({ page }) => {
    // Verify badge detail routing works (independent of landing page card links)
    await page.goto('/en/badge/brownie/pets', { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    await expect(page).toHaveURL(/\/en\/badge\/brownie\/pets/);
    const h1 = page.locator('main h1').first();
    await expect(h1).toBeAttached({ timeout: 10000 });
  });

  test('back button / breadcrumb is present on badge detail', async ({ page }) => {
    await page.goto('/en/badge/brownie/pets', { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);

    const breadcrumb = page.locator('[class*="gs-breadcrumb"], [class*="breadcrumb"]').first();
    await expect(breadcrumb).toBeAttached({ timeout: 10000 });
  });

  test('unknown locale redirects gracefully', async ({ page }) => {
    const response = await page.goto('/fr/badge/test', { waitUntil: 'domcontentloaded' });
    expect(response?.status(), 'Unknown locale does not 500').not.toBe(500);
    // Should redirect to a valid locale
    await expect(page).toHaveURL(/\/(en|es)\//);
  });

  test('catch-all route handles unknown paths', async ({ page }) => {
    const response = await page.goto('/en/totally/unknown/path', { waitUntil: 'domcontentloaded' });
    expect(response?.status()).not.toBe(500);
  });
});
