import { test, expect, Page } from '@playwright/test';
import { getFileNameFromUrl } from '../../src/utils/getFileNameFromUrl';

// Slugs to test - adjust if these pages don't have handouts/donors in the AEM dev environment
const BADGE_PATH = '/en/badge/junior/automotive'; // handouts(3), donors(1)
const ACTIVITY_PATH = '/en/activity/badge/m-r/role-play-911'; // handouts(6), donors(1)

async function waitForReady(page: Page) {
  await page.waitForSelector('header', { state: 'visible', timeout: 30000 });
}

async function resetDataLayer(page: Page) {
  await page.evaluate(() => {
    (window as any).dataLayer = [];
  });
}

async function getDataLayerEvents(page: Page): Promise<Record<string, any>[]> {
  return page.evaluate(() => (window as any).dataLayer ?? []);
}

test.describe('Analytics: Handout events (Badge)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BADGE_PATH, { waitUntil: 'domcontentloaded' });
    await waitForReady(page);
    await page.waitForLoadState('networkidle');
  });

  test('handout card click fires cta_click with pdf, file_name, destination_url, link_url', async ({ page }) => {
    const card = page.locator('.gs-outlined-card').first();
    if ((await card.count()) === 0) test.skip(true, 'No handout cards on this page');

    await resetDataLayer(page);
    await card.evaluate((el: HTMLElement) => el.click());

    await expect
      .poll(
        () => getDataLayerEvents(page).then(evts => evts.find(e => e.event === 'cta_click' && e.cta_type === 'pdf')),
        { timeout: 3000 }
      )
      .toBeTruthy();
    const evt = (await getDataLayerEvents(page)).find(e => e.event === 'cta_click' && e.cta_type === 'pdf');
    expect(evt?.destination_url, 'destination_url should be present').toBeTruthy();
    expect(evt?.file_name, 'file_name should be the destination_url basename').toBe(
      getFileNameFromUrl(evt?.destination_url)
    );
    expect(evt?.file_name, 'file_name should include a file extension').toMatch(/\.[a-z0-9]+$/i);
    expect(evt?.link_url, 'link_url should be the page URL').toContain('/en/badge/');
  });

  test('download icon click fires cta_click pdf — without duplicating the card click', async ({ page }) => {
    const card = page.locator('.gs-outlined-card').first();
    if ((await card.count()) === 0) test.skip(true, 'No handout cards on this page');

    const downloadBtn = card.locator('.gs-download-button');
    if ((await downloadBtn.count()) === 0) test.skip(true, 'No download button');

    await resetDataLayer(page);
    await downloadBtn.evaluate((el: HTMLElement) => el.click());

    await expect
      .poll(
        () => getDataLayerEvents(page).then(evts => evts.filter(e => e.event === 'cta_click' && e.cta_type === 'pdf')),
        { timeout: 3000 }
      )
      .toHaveLength(1);
    const pdfEvents = (await getDataLayerEvents(page)).filter(e => e.event === 'cta_click' && e.cta_type === 'pdf');
    expect(pdfEvents[0].file_name, 'file_name should be the destination_url basename').toBe(
      getFileNameFromUrl(pdfEvents[0].destination_url)
    );
    expect(pdfEvents[0].file_name, 'file_name should include a file extension').toMatch(/\.[a-z0-9]+$/i);
  });
});

test.describe('Analytics: Handout events (Activity)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(ACTIVITY_PATH, { waitUntil: 'domcontentloaded' });
    await waitForReady(page);
    await page.waitForLoadState('networkidle');
  });

  test('handout card click fires cta_click pdf on the activity page', async ({ page }) => {
    const card = page.locator('.gs-outlined-card').first();
    if ((await card.count()) === 0) test.skip(true, 'No handout cards on this activity page');

    await resetDataLayer(page);
    await card.evaluate((el: HTMLElement) => el.click());

    await expect
      .poll(
        () => getDataLayerEvents(page).then(evts => evts.find(e => e.event === 'cta_click' && e.cta_type === 'pdf')),
        { timeout: 3000 }
      )
      .toBeTruthy();
    const evt = (await getDataLayerEvents(page)).find(e => e.event === 'cta_click' && e.cta_type === 'pdf');
    expect(evt?.destination_url, 'destination_url should be present').toBeTruthy();
    expect(evt?.file_name, 'file_name should be the destination_url basename').toBe(
      getFileNameFromUrl(evt?.destination_url)
    );
    expect(evt?.file_name, 'file_name should include a file extension').toMatch(/\.[a-z0-9]+$/i);
    expect(evt?.link_url, 'link_url should be the page URL').toContain('/en/activity/');
  });
});

test.describe('Analytics: Donor events', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BADGE_PATH, { waitUntil: 'domcontentloaded' });
    await waitForReady(page);
    await page.waitForLoadState('networkidle');
  });

  test('donor image link fires cta_click sponsor_link with destination_url', async ({ page }) => {
    const donorLink = page.locator('.gs-donor-recognition__logo-link').first();
    if ((await donorLink.count()) === 0) test.skip(true, 'No donor image links on this page');

    await resetDataLayer(page);
    await donorLink.evaluate((el: HTMLElement) => el.click());

    await expect
      .poll(
        () =>
          getDataLayerEvents(page).then(evts =>
            evts.find(e => e.event === 'cta_click' && e.cta_type === 'sponsor_link')
          ),
        { timeout: 3000 }
      )
      .toBeTruthy();
    const evt = (await getDataLayerEvents(page)).find(e => e.event === 'cta_click' && e.cta_type === 'sponsor_link');
    expect(evt?.destination_url, 'destination_url should be present').toBeTruthy();
    expect(evt?.link_url).toBeTruthy();
  });

  test('donor rich text hyperlink fires cta_click sponsor_link', async ({ page }) => {
    const bodyLink = page.locator('.gs-donor-recognition__body a').first();
    if ((await bodyLink.count()) === 0) test.skip(true, 'No donor body links on this page');

    await resetDataLayer(page);
    await bodyLink.evaluate((el: HTMLElement) => el.click());

    await expect
      .poll(
        () =>
          getDataLayerEvents(page).then(evts =>
            evts.find(e => e.event === 'cta_click' && e.cta_type === 'sponsor_link')
          ),
        { timeout: 3000 }
      )
      .toBeTruthy();
    const evt = (await getDataLayerEvents(page)).find(e => e.event === 'cta_click' && e.cta_type === 'sponsor_link');
    expect(evt?.destination_url).toBeTruthy();
  });
});

test.describe('Analytics: Cross-domain link events', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BADGE_PATH, { waitUntil: 'domcontentloaded' });
    await waitForReady(page);
    await page.waitForLoadState('networkidle');
  });

  test('external RTE link fires cta_click cross_domain', async ({ page }) => {
    const link = await page.evaluateHandle(() => {
      const anchors = Array.from(document.querySelectorAll('a[href^="http"], a[href^="https"]'));
      return (anchors.find(a => !a.closest('.gs-donor-recognition') && !a.closest('.gs-button')) ??
        null) as HTMLElement | null;
    });
    const el = link.asElement();
    if (!el) return test.skip(true, 'No external RTE links on this page');

    await resetDataLayer(page);
    await el.evaluate((node: HTMLElement) => {
      node.setAttribute('target', '_blank');
      node.click();
    });

    await expect
      .poll(
        () =>
          getDataLayerEvents(page).then(evts =>
            evts.find(e => e.event === 'cta_click' && e.cta_type === 'cross_domain')
          ),
        { timeout: 3000 }
      )
      .toBeTruthy();

    const evt = (await getDataLayerEvents(page)).find(e => e.event === 'cta_click' && e.cta_type === 'cross_domain');
    expect(evt?.destination_url, 'destination_url should be present').toBeTruthy();
    expect(evt?.link_url, 'link_url should be the page URL').toContain('/en/badge/');
  });

  test('donor link does NOT fire cross_domain (fires sponsor_link only)', async ({ page }) => {
    const donorLink = page.locator('.gs-donor-recognition__logo-link').first();
    if ((await donorLink.count()) === 0) return test.skip(true, 'No donor links on this page');

    await resetDataLayer(page);
    await donorLink.evaluate((el: HTMLElement) => el.click());
    await page.waitForTimeout(400);

    const events = await getDataLayerEvents(page);
    const crossDomain = events.filter(e => e.event === 'cta_click' && e.cta_type === 'cross_domain');
    expect(crossDomain, 'donor link must not fire cross_domain').toHaveLength(0);
  });
});

test.describe('Analytics: no console errors', () => {
  const KNOWN_ERRORS = ['403', '500', 'AxiosError', 'performing search', 'favicon'];
  const isKnown = (msg: string) => KNOWN_ERRORS.some(p => msg.includes(p));

  for (const path of [BADGE_PATH, ACTIVITY_PATH]) {
    test(`${path} — no console errors related to tracking`, async ({ page }) => {
      const errors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error' && !isKnown(msg.text())) {
          errors.push(msg.text());
        }
      });

      await page.goto(path, { waitUntil: 'domcontentloaded' });
      await waitForReady(page);

      const card = page.locator('.gs-outlined-card').first();
      if ((await card.count()) > 0) {
        await card.evaluate((el: HTMLElement) => el.click());
        await page.waitForLoadState('networkidle').catch(() => {});
      }

      const trackingErrors = errors.filter(
        e => e.includes('dataLayer') || e.includes('gtm') || e.includes('clickTracker')
      );
      expect(trackingErrors).toHaveLength(0);
    });
  }
});
