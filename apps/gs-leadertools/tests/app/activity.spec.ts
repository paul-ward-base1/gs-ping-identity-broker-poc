import { test, expect } from '@playwright/test';
import { LandingPage } from './pages/LandingPage';

test.describe('Activity pagination scroll', () => {
  let lp: LandingPage;

  test.beforeEach(async ({ page }) => {
    lp = new LandingPage(page);
    await lp.goto();
    await lp.waitForReady();
    await lp.waitForCardsLoaded();
  });

  test('Next and Previous scroll filters into view on Activities tab', async () => {
    await lp.switchToActivities();

    // Next
    await lp.clickNext();
    await lp.waitForScrollToFilters();

    const boxAfterNext = await lp.getFiltersWrapperBox();
    expect(boxAfterNext).not.toBeNull();
    if (!boxAfterNext) return;
    expect(boxAfterNext.y).toBeGreaterThanOrEqual(0);
    expect(boxAfterNext.y).toBeLessThan(200);

    await lp.waitForCardsLoaded();

    // Previous
    await lp.clickPrev();
    await lp.waitForScrollToFilters();
    await lp.waitForCardsLoaded();

    const boxAfterPrev = await lp.getFiltersWrapperBox();
    expect(boxAfterPrev).not.toBeNull();
    if (!boxAfterPrev) return;
    expect(boxAfterPrev.y).toBeGreaterThanOrEqual(0);
    expect(boxAfterPrev.y).toBeLessThan(200);
  });
});
