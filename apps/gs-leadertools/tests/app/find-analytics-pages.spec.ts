/**
 * Discovery script — finds pages with handout cards and donor sections.
 *
 * Run manually: QA_ENV=local npx playwright test tests/app/find-analytics-pages.spec.ts --reporter=line
 * Requires: ENV=dev yarn dev running in another terminal
 *
 * Navigates the landing page, collects badge and activity links,
 * visits each and checks for .gs-outlined-card and .gs-donor-recognition.
 * Results are printed to the console at the end.
 */

import { test } from '@playwright/test';

const MAX_PER_TYPE = 50;

test.skip('find-analytics: discover pages with handouts and donors', async ({ page }) => {
  await page.goto('/en', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.gs-card', { state: 'visible', timeout: 20000 });
  await page.waitForLoadState('networkidle').catch(() => {});

  const resolveHref = (href: string) => (href.startsWith('/') ? href : `/en/${href}`);

  const getCardLinks = async (keyword: string) => {
    const hrefs = await page
      .locator(`.gs-card[href*="${keyword}"]`)
      .evaluateAll(els => els.map(el => el.getAttribute('href')));
    return hrefs
      .filter((h): h is string => !!h)
      .map(resolveHref)
      .slice(0, MAX_PER_TYPE);
  };

  const badgeLinks = await getCardLinks('badge/');

  const activitiesTab = page.locator('.gs-tabs__tab').nth(1);
  if ((await activitiesTab.count()) > 0) {
    await activitiesTab.click();
    await page.waitForSelector('.gs-card', { state: 'visible', timeout: 10000 });
    await page.waitForLoadState('networkidle').catch(() => {});
  }

  const activityLinks = await getCardLinks('activity/');

  console.log(`\nFound: ${badgeLinks.length} badges, ${activityLinks.length} activities\n`);

  type PageResult = {
    path: string;
    type: 'badge' | 'activity';
    handouts: number;
    donors: number;
  };

  const results: PageResult[] = [];

  const allLinks: Array<{ path: string; type: 'badge' | 'activity' }> = [
    ...badgeLinks.map(p => ({ path: p, type: 'badge' as const })),
    ...activityLinks.map(p => ({ path: p, type: 'activity' as const })),
  ];

  test.setTimeout(allLinks.length * 25_000 + 30_000);

  for (const { path, type } of allLinks) {
    try {
      await page.goto(path, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForSelector('header', { state: 'visible', timeout: 10000 });
      await page.waitForLoadState('networkidle').catch(() => {});
    } catch {
      console.log(`[${type}] ${path} → timeout, skipping`);
      continue;
    }

    const handouts = await page.locator('.gs-outlined-card').count();
    const donors = await page.locator('.gs-donor-recognition').count();

    results.push({ path, type, handouts, donors });

    const tags =
      [handouts > 0 && `handouts(${handouts})`, donors > 0 && `donors(${donors})`].filter(Boolean).join(', ') || 'none';

    console.log(`[${type}] ${path} → ${tags}`);
  }

  const withBoth = results.filter(r => r.handouts > 0 && r.donors > 0);
  const withHandouts = results.filter(r => r.handouts > 0 && r.donors === 0);
  const withDonors = results.filter(r => r.donors > 0 && r.handouts === 0);
  const withNeither = results.filter(r => r.handouts === 0 && r.donors === 0);

  console.log('\n════════════════════════════════════════');
  console.log('  RESULTS — pages for analytics.spec.ts');
  console.log('════════════════════════════════════════');

  if (withBoth.length > 0) {
    console.log('\n✅ WITH HANDOUTS + DONORS (ideal for BADGE_PATH / ACTIVITY_PATH):');
    withBoth.forEach(r => console.log(`   ${r.type}: '${r.path}'`));
  } else {
    console.log('\n⚠️  No page found with both handouts and donors.');
  }

  if (withHandouts.length > 0) {
    console.log('\n📄 HANDOUTS ONLY:');
    withHandouts.forEach(r => console.log(`   ${r.type}: '${r.path}'`));
  }

  if (withDonors.length > 0) {
    console.log('\n💰 DONORS ONLY:');
    withDonors.forEach(r => console.log(`   ${r.type}: '${r.path}'`));
  }

  console.log(`\n⬜ No relevant elements: ${withNeither.length} pages`);
  console.log('════════════════════════════════════════\n');

  const badgeSuggestion = withBoth.find(r => r.type === 'badge') ?? withHandouts.find(r => r.type === 'badge');
  const activitySuggestion = withBoth.find(r => r.type === 'activity') ?? withHandouts.find(r => r.type === 'activity');

  if (badgeSuggestion || activitySuggestion) {
    console.log('💡 Update in tests/app/analytics.spec.ts:');
    if (badgeSuggestion) console.log(`   const BADGE_PATH    = '${badgeSuggestion.path}';`);
    if (activitySuggestion) console.log(`   const ACTIVITY_PATH = '${activitySuggestion.path}';`);
    console.log('');
  }
});
