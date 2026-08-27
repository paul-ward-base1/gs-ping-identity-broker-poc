import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '@playwright/test';
import { AXE_TAGS } from '../helper/accessibility';
import { gotoComponent } from '../helper/storybook';

const component = 'Footer: Footer Default';

test('should be visible when rendered', async ({ page }) => {
  await gotoComponent(component, page);
  const footer = page.locator('footer');
  await expect(footer).toBeVisible();
});

test('should pass accessibility checks', async ({ page }) => {
  await gotoComponent(component, page);

  const locator = 'footer';
  const footer = page.locator(locator);
  await footer.waitFor({ state: 'visible' });

  const accessibilityScanResults = await new AxeBuilder({ page }).withTags(AXE_TAGS).include(locator).analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});
