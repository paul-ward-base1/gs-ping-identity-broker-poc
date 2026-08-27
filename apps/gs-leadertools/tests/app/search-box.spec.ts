import { test, expect, type Page } from '@playwright/test';

/**
 * VTKN-524 — mobile "Search" bar fixes.
 *
 * The two reported bugs only reproduce on real iOS hardware (the page auto-zooms when
 * the field is focused, and the keyboard needs two taps), so they cannot be asserted
 * directly from Playwright. These tests instead lock in the root-cause fixes that
 * prevent them:
 *
 *   1. The search input renders at >= 16px. iOS Safari/WebKit auto-zooms the page when
 *      a focused input has font-size < 16px; 16px is the threshold that disables it.
 *   2. Tapping anywhere on the search pill focuses THAT input in a single click. The
 *      input is wrapped in a native <label>, and each SearchBox instance gets a unique
 *      id (the landing page renders the component twice — a mobile and a desktop copy),
 *      so a label never resolves to the other, hidden instance's input.
 *
 * Only one SearchBox is visible per viewport (filters-mobile < 768px, filters-desktop
 * >= 768px), so these run across the mobile/tablet/desktop projects. On >= 768px the
 * visible instance is the SECOND in the DOM, which is exactly where an id collision
 * would send focus to the wrong (hidden) input — so the click test guards that too.
 */

// I18nProvider renders null until async init completes; a visible <header> marks readiness.
async function waitForAppReady(page: Page) {
  await page.waitForSelector('header', { state: 'visible', timeout: 30000 });
}

test.describe('VTKN-524 — search bar', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en', { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    await page.locator('.gs-search-box__input').first().waitFor({ state: 'attached', timeout: 10000 });
  });

  test('input font-size is >= 16px on every instance (prevents iOS focus zoom)', async ({ page }) => {
    const inputs = page.locator('.gs-search-box__input');
    const count = await inputs.count();
    expect(count, 'at least one SearchBox is rendered').toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const px = await inputs.nth(i).evaluate(el => parseFloat(getComputedStyle(el).fontSize));
      expect(px, `SearchBox input #${i} font-size (px)`).toBeGreaterThanOrEqual(16);
    }
  });

  test('each search pill is a <label> bound to its own input (unique ids)', async ({ page }) => {
    const result = await page.evaluate(() => {
      const labels = Array.from(document.querySelectorAll('label.gs-search-box'));
      const fors = labels.map(l => l.getAttribute('for'));
      const eachOwnsTarget = labels.every(l => {
        const id = l.getAttribute('for');
        if (!id) return false;
        const target = document.getElementById(id);
        // getElementById returns the FIRST match — with colliding ids a later label's
        // target would be another instance's input, which it does not contain.
        return !!target && l.contains(target);
      });
      return {
        labelCount: labels.length,
        uniqueIds: fors.every(Boolean) && new Set(fors).size === fors.length,
        eachOwnsTarget,
      };
    });

    expect(result.labelCount, 'SearchBox renders as a <label>').toBeGreaterThan(0);
    expect(result.uniqueIds, 'every SearchBox instance has a unique input id').toBe(true);
    expect(result.eachOwnsTarget, "each label's htmlFor points to its own nested input").toBe(true);
  });

  test('clicking the search icon focuses the visible input in a single click', async ({ page }) => {
    const box = page.locator('.gs-search-box:visible').first();
    await expect(box).toBeVisible();
    await box.scrollIntoViewIfNeeded();

    const input = box.locator('.gs-search-box__input');
    await expect(input).not.toBeFocused();

    // Click the magnifying-glass icon — part of the <label> but NOT the input itself —
    // so a pass proves the label focuses its associated input on one click/tap.
    await box.locator('.gs-search-box__icon').click();
    await expect(input).toBeFocused();
  });
});
