import { Page, Locator } from '@playwright/test';

export class LandingPage {
  readonly page: Page;

  readonly filtersWrapper: Locator;
  readonly pagination: Locator;
  readonly nextButton: Locator;
  readonly prevButton: Locator;
  readonly cards: Locator;
  readonly skeletons: Locator;
  readonly header: Locator;
  readonly badgesTab: Locator;
  readonly activitiesTab: Locator;

  constructor(page: Page) {
    this.page = page;
    this.filtersWrapper = page.locator('.gs-landing__filters-wrapper');
    this.pagination    = page.locator('.gs-landing__pagination');
    this.nextButton    = page.locator('.gs-landing__pagination').getByRole('button', { name: /next/i });
    this.prevButton    = page.locator('.gs-landing__pagination').getByRole('button', { name: /previous/i });
    this.cards         = page.locator('.gs-card-list .gs-card');
    this.skeletons     = page.locator('.gs-card-placeholder');
    this.header        = page.locator('header').first();
    this.badgesTab     = page.locator('.gs-tabs__tab').first();
    this.activitiesTab = page.locator('.gs-tabs__tab').nth(1);
  }

  async goto(path = '/en') {
    await this.page.goto(path, { waitUntil: 'domcontentloaded' });
  }

  async waitForReady() {
    await this.page.waitForSelector('header', { state: 'visible', timeout: 30000 });
  }

  async waitForCardsLoaded() {
    await this.page.waitForSelector('.gs-card', { state: 'visible', timeout: 15000 });
  }

  async waitForScrollToFilters() {
    await this.page.waitForFunction(
      () => {
        const el = document.querySelector('.gs-landing__filters-wrapper');
        if (!el) return false;
        const { top } = el.getBoundingClientRect();
        return top >= 0 && top < 200;
      },
      { timeout: 5000 }
    );
  }

  async clickNext() {
    await this.pagination.scrollIntoViewIfNeeded();
    await this.nextButton.waitFor({ state: 'visible' });
    await this.nextButton.click();
  }

  async clickPrev() {
    await this.pagination.scrollIntoViewIfNeeded();
    await this.prevButton.waitFor({ state: 'visible' });
    await this.prevButton.click();
  }

  async switchToActivities() {
    await this.activitiesTab.click();
    await this.activitiesTab.and(this.page.locator('.gs-tabs__tab--active')).waitFor({ state: 'visible' });
    await this.waitForCardsLoaded();
  }

  async getFiltersWrapperBox() {
    return this.filtersWrapper.boundingBox();
  }

  async getHeaderComputedPosition() {
    return this.header.evaluate(el => getComputedStyle(el).position);
  }

  async resetDataLayer() {
    await this.page.evaluate(() => { window.dataLayer = []; });
  }

  async getDataLayerEvents(): Promise<Record<string, unknown>[]> {
    return this.page.evaluate(() => window.dataLayer ?? []);
  }

  /** Intercepts /api/search/** and adds a fixed delay before forwarding. */
  async delaySearchApi(ms = 600) {
    await this.page.route('**/api/search/**', async route => {
      await new Promise(resolve => setTimeout(resolve, ms));
      await route.continue();
    });
  }
}
