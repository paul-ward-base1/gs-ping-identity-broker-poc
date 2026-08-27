import { test, expect } from '@playwright/test';

/**
 * Smoke checks for the Rich Text sanitization pipeline (VTKN-452).
 *
 * The activity/badge content tree is rendered by 'use client' components, so
 * the initial HTTP response contains an RSC payload rather than fully-rendered
 * HTML. Sanitization is applied by `<RichText>` during client render, so we
 * load the page in a real browser and inspect the hydrated DOM.
 *
 * Assertions only check DOM attributes and are not viewport-dependent, so we
 * run this suite on the `app:desktop` project only to avoid duplicating work
 * across mobile/tablet/desktop projects.
 */
test.describe('RichText sanitization (DOMPurify hook)', () => {
  test.beforeEach(async ({}, testInfo) => {
    test.skip(
      testInfo.project.name !== 'app:desktop',
      'Sanitization assertions are not viewport-dependent; runs on app:desktop only.',
    );
  });

  test('badge closing-question external links carry target/rel/data-external', async ({ page }) => {
    await page.goto('/en/badge/junior/automotive');
    const closingQuestion = page.locator('.gs-closing-question .gs-rich-text');
    await closingQuestion.waitFor({ state: 'attached' });

    const externalLinks = closingQuestion.locator('a[href^="http"]');
    const count = await externalLinks.count();
    expect(count, 'at least one external link in closing question RTE').toBeGreaterThan(0);

    for (let i = 0; i < count; i += 1) {
      const a = externalLinks.nth(i);
      await expect(a).toHaveAttribute('target', '_blank');
      await expect(a).toHaveAttribute('rel', 'noopener noreferrer');
      await expect(a).toHaveAttribute('data-external', 'true');
    }
  });

  test('AEM-relative image src is routed through the /img proxy on the activity page', async ({ page }) => {
    await page.goto('/en/activity/badge/a-f/design-your-dream-vehicle');
    const richTextImages = page.locator('.gs-rich-text img');
    await richTextImages.first().waitFor({ state: 'attached' });

    const srcs = await richTextImages.evaluateAll((els: HTMLImageElement[]) =>
      els.map(el => el.getAttribute('src') ?? ''),
    );

    expect(srcs.length, 'rich text content has images').toBeGreaterThan(0);
    for (const src of srcs) {
      // Image proxy (VTKN-423) hides the AEM origin from the browser.
      expect(src, `image src goes through /img proxy (${src})`).toMatch(/^\/img\//);
      expect(src, `image src does not leak AEM origin (${src})`).not.toMatch(/girlscouts\.org/);
    }
  });

  test('no <script>, no inline event handlers in any rich-text DOM', async ({ page }) => {
    await page.goto('/en/activity/badge/a-f/design-your-dream-vehicle');
    await page.locator('.gs-rich-text').first().waitFor({ state: 'attached' });

    const scriptCount = await page.locator('.gs-rich-text script').count();
    expect(scriptCount, 'no <script> tags inside rich text content').toBe(0);

    const dangerousAttrs = await page.evaluate(() => {
      const violations: string[] = [];
      document.querySelectorAll('.gs-rich-text *').forEach(el => {
        for (const attr of el.attributes) {
          if (/^on[a-z]+/i.test(attr.name)) violations.push(`${el.tagName}@${attr.name}`);
          if (attr.name.toLowerCase() === 'style') violations.push(`${el.tagName}@style`);
        }
      });
      return violations;
    });
    expect(dangerousAttrs, 'no on* event handlers and no inline style attributes').toEqual([]);
  });

  test('donor description renders sanitized RTE with external-link tagging', async ({ page }) => {
    await page.goto('/en/badge/cadette/first-aid');
    const donor = page.locator('.gs-donor-recognition .gs-rich-text').first();
    await donor.waitFor({ state: 'attached' });

    const externalCount = await donor.locator('a[data-external="true"]').count();
    expect(externalCount, 'donor RTE has at least one external link tagged').toBeGreaterThan(0);
  });
});
