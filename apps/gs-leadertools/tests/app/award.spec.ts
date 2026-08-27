import { test, expect, type Page } from '@playwright/test';

/**
 * VTKN-505 — Awards indexed on the landing page, inside the "Badges" tab.
 *
 * Acceptance criteria covered:
 *   1. Awards show up inside the "Badges" tab (merged with badges).
 *   2. Awards can be searched by keyword.
 *   3. Awards can be filtered by the 3 existing filters (Program level, Theme, Badge Family).
 *
 * The landing page runs against the dev/mock search engine (ENV=dev → SEARCH_TYPE=mock),
 * which the Playwright webServer starts automatically. mockEngine.ts merges the 6 award
 * fixtures into the badge results and honours keyword + the 3 filters, so all three
 * criteria are exercised here without depending on real OpenSearch.
 *
 * Search/filter state is driven through URL params (?q / ?programLevel / ?theme /
 * ?badgeFamily) instead of clicking the widgets. The client restores that state on mount
 * (useLandingPageClient), so the assertions are viewport-independent — no need to special
 * case the mobile side-panel layout, and no clash with the duplicated search-box input.
 *
 * Award DETAIL pages always hit real AEM, so that block tolerates env noise the same way
 * smoke.spec.ts does.
 */

// The 6 award fixtures from mockEngine.ts `allAwards`, paired with the client route each
// DAM path normalises to (normalizeAwardPath) — i.e. where the card link should point.
const AWARDS = [
  { name: 'Junior True North Award', route: '/en/award/junior/true-north-award' },
  { name: 'Cadette True North Award', route: '/en/award/cadette/true-north-award' },
  { name: 'Bronze Award', route: '/en/award/junior/bronze-award' },
  { name: 'Silver Award', route: '/en/award/cadette/silver-award' },
  { name: 'Senior Ambassador True North Award', route: '/en/award/senior/senior-true-north' },
  { name: 'Brownie Leadership Award', route: '/en/award/brownie/brownie-leadership-award' },
];

const TRUE_NORTH_AWARDS = ['Junior True North Award', 'Cadette True North Award', 'Senior Ambassador True North Award'];

const cards = (page: Page) => page.locator('.gs-card-list .gs-card');
const cardTitle = (page: Page, name: string) => page.locator('.gs-card__title', { hasText: name });

async function waitForAppReady(page: Page) {
  await page.waitForSelector('header', { state: 'visible', timeout: 30000 });
}

async function gotoLanding(page: Page, query = '') {
  await page.goto(`/en${query}`, { waitUntil: 'domcontentloaded' });
  await waitForAppReady(page);
}

async function cardHrefs(page: Page): Promise<string[]> {
  return cards(page).evaluateAll(els => els.map(el => el.getAttribute('href') ?? ''));
}

// ─── Criterion 1: awards appear inside the Badges tab ───────────────────────────

test.describe('VTKN-505 — awards in the Badges tab', () => {
  test('awards are merged into the Badges tab results with /award/ links', async ({ page }) => {
    // Searching "award" isolates the 6 award fixtures (no badge name contains "award").
    await gotoLanding(page, '?q=award');
    await expect(cards(page)).toHaveCount(AWARDS.length);

    const hrefs = await cardHrefs(page);
    expect(hrefs.every(href => href.includes('/award/'))).toBe(true);

    for (const award of AWARDS) {
      await expect(cardTitle(page, award.name)).toBeVisible();
    }
  });

  test('award card images load through the /img proxy', async ({ page }) => {
    await gotoLanding(page, '?q=award');
    await expect(cards(page)).toHaveCount(AWARDS.length);

    const images = page.locator('.gs-card-list .gs-card .gs-card__image');
    await expect(images).toHaveCount(AWARDS.length);

    const count = await images.count();
    for (let i = 0; i < count; i++) {
      const image = images.nth(i);
      await image.scrollIntoViewIfNeeded();
      // naturalWidth > 0 means the proxied image actually decoded (a 404 stays at 0).
      await expect
        .poll(() => image.evaluate((el: HTMLImageElement) => el.naturalWidth), { timeout: 10000 })
        .toBeGreaterThan(0);
    }
  });
});

// ─── Criterion 2: awards searchable by keyword ──────────────────────────────────

test.describe('VTKN-505 — awards searchable by keyword', () => {
  test('keyword "true north" narrows results to the 3 True North awards', async ({ page }) => {
    await gotoLanding(page, '?q=true%20north');
    await expect(cards(page)).toHaveCount(TRUE_NORTH_AWARDS.length);

    for (const name of TRUE_NORTH_AWARDS) {
      await expect(cardTitle(page, name)).toBeVisible();
    }

    const hrefs = await cardHrefs(page);
    expect(hrefs.every(href => href.includes('/award/'))).toBe(true);
  });

  test('keyword "bronze" narrows results to the Bronze Award', async ({ page }) => {
    await gotoLanding(page, '?q=bronze');
    await expect(cards(page)).toHaveCount(1);
    await expect(cardTitle(page, 'Bronze Award')).toBeVisible();
    expect((await cardHrefs(page))[0]).toContain('/award/junior/bronze-award');
  });
});

// ─── Criterion 3: awards filterable by the 3 existing filters ───────────────────

test.describe('VTKN-505 — awards filterable by the 3 filters', () => {
  test('Badge Family "True North Award" returns only the 3 True North awards', async ({ page }) => {
    await gotoLanding(page, '?badgeFamily=true-north-award');
    await expect(cards(page)).toHaveCount(TRUE_NORTH_AWARDS.length);

    const hrefs = await cardHrefs(page);
    expect(hrefs.every(href => href.includes('/award/'))).toBe(true);

    for (const name of TRUE_NORTH_AWARDS) {
      await expect(cardTitle(page, name)).toBeVisible();
    }
  });

  test('Theme "Balanced Living" includes the matching awards alongside badges', async ({ page }) => {
    await gotoLanding(page, '?theme=balanced-living');
    // 4 Balanced Living badges + 2 Balanced Living awards (Junior & Cadette True North).
    await expect(cards(page)).toHaveCount(6);

    await expect(cardTitle(page, 'Junior True North Award')).toBeVisible();
    await expect(cardTitle(page, 'Cadette True North Award')).toBeVisible();

    const awardHrefs = (await cardHrefs(page)).filter(href => href.includes('/award/'));
    expect(awardHrefs.length).toBe(2);
  });

  test('Program level "Junior" includes the Junior awards', async ({ page }) => {
    await gotoLanding(page, '?programLevel=junior');

    // Junior True North Award and Bronze Award are both Junior-level awards.
    await expect(cardTitle(page, 'Junior True North Award')).toBeVisible();
    await expect(cardTitle(page, 'Bronze Award')).toBeVisible();

    const awardHrefs = (await cardHrefs(page)).filter(href => href.includes('/award/'));
    expect(awardHrefs.length).toBeGreaterThanOrEqual(2);
  });
});

// ─── Award detail pages resolve (real AEM — the path-normalisation fix) ──────────

test.describe('VTKN-505 — award detail pages resolve', () => {
  for (const award of AWARDS) {
    test(`${award.name} → ${award.route} does not 404`, async ({ page }) => {
      const response = await page.goto(award.route, { waitUntil: 'domcontentloaded' });
      await waitForAppReady(page);

      // The original bug returned 404 for awards whose mock path had no real AEM match.
      // Asserting the document status (not console noise) keeps this focused on the
      // path-resolution fix and tolerant of unrelated AEM asset 404s on the page.
      expect(response?.status(), `HTTP status for ${award.route}`).toBeLessThan(400);
      await page.locator('main h1').first().waitFor({ state: 'attached', timeout: 20000 });
    });
  }
});
