import { test, expect } from '@playwright/test';
import { LandingPage } from './pages/LandingPage';

test.describe('Badge pagination scroll', () => {
  let lp: LandingPage;

  test.beforeEach(async ({ page }) => {
    lp = new LandingPage(page);
    await lp.goto();
    await lp.waitForReady();
    await lp.waitForCardsLoaded();
  });

  test('Next scrolls filters wrapper into view', async () => {
    await lp.clickNext();
    await lp.waitForScrollToFilters();

    const box = await lp.getFiltersWrapperBox();
    expect(box).not.toBeNull();
    if (!box) return;
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.y).toBeLessThan(200);
  });

  test('Previous scrolls filters wrapper into view', async () => {
    // Advance to page 2 so Previous is enabled
    await lp.clickNext();
    await lp.waitForCardsLoaded();

    await lp.clickPrev();
    await lp.waitForScrollToFilters();

    const box = await lp.getFiltersWrapperBox();
    expect(box).not.toBeNull();
    if (!box) return;
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.y).toBeLessThan(200);
  });

  // 34 combined results (28 badges + 6 awards) → page 0 = 20 cards, page 1 = 14 cards (last page)
  test('smooth scroll reaches filters on last page with fewer than 20 results', async () => {
    // Confirm last page has fewer than 20 cards
    await lp.goto('/en?page=1');
    await lp.waitForReady();
    await lp.waitForCardsLoaded();
    const lastPageCount = await lp.cards.count();
    expect(lastPageCount).toBeGreaterThan(0);
    expect(lastPageCount).toBeLessThan(20);

    // Navigate from page 0 → last page via Next
    await lp.goto();
    await lp.waitForReady();
    await lp.waitForCardsLoaded();

    await lp.clickNext();
    await lp.waitForScrollToFilters();

    const box = await lp.getFiltersWrapperBox();
    expect(box).not.toBeNull();
    if (!box) return;
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.y).toBeLessThan(200);
  });

  test('skeleton count matches card count on last page', async ({ page }) => {
    // Register delay AFTER beforeEach already loaded the initial page,
    // so only the next-page request is slowed (not the initial badges load)
    await lp.delaySearchApi(1000);

    // Navigate to last page
    await lp.clickNext();

    // Count skeletons during the delay window
    await page.waitForSelector('.gs-card-placeholder', { state: 'visible', timeout: 5000 });
    const skeletonCount = await lp.skeletons.count();

    // Wait for real cards to replace skeletons
    await page.waitForSelector('.gs-card', { state: 'visible', timeout: 20000 });
    await page.waitForSelector('.gs-card-placeholder', { state: 'detached', timeout: 5000 });
    const cardCount = await lp.cards.count();

    expect(skeletonCount).toBe(cardCount);
    expect(cardCount).toBeLessThan(20);
  });
});

test.describe('Badge pagination regression', () => {
  let lp: LandingPage;

  test.beforeEach(async ({ page }) => {
    lp = new LandingPage(page);
    await lp.goto();
    await lp.waitForReady();
    await lp.waitForCardsLoaded();
  });

  test('header does not switch to position:fixed when scrolling past PageBanner', async ({ page }) => {
    await page.evaluate(() => window.scrollBy(0, 400));
    await page.waitForTimeout(300);

    const position = await lp.getHeaderComputedPosition();
    expect(position).toBe('sticky');

    const stickyModifierCount = await page.locator('.gs-header--sticky').count();
    expect(stickyModifierCount).toBe(0);
  });

  test('Previous button fires pagination_click with direction:previous', async ({ page }) => {
    // Advance to page 2 so Previous is enabled
    await lp.clickNext();
    await lp.waitForCardsLoaded();

    await lp.resetDataLayer();

    await lp.clickPrev();
    await page.waitForTimeout(300);

    const events = await lp.getDataLayerEvents();
    const paginationEvent = events.find(e => e.event === 'pagination_click');

    expect(paginationEvent).toBeDefined();
    expect(paginationEvent?.direction).toBe('previous');
  });
});
