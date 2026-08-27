import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '@playwright/test';
import { AXE_TAGS } from '../helper/accessibility';
import { gotoComponent } from '../helper/storybook';

const component = 'Accordion: Accordion Default Open';

const TAGS = ['Daisy', 'Brownie', 'Junior', 'Cadette', 'Senior', 'Ambassador', 'All'];

test('should pass accessibility checks', async ({ page }, testInfo) => {
  await gotoComponent(component, page);

  const locator = '.gs-accordion.gs-accordion--open';
  const footer = page.locator(locator);
  await footer.waitFor({ state: 'visible' });

  const accessibilityScanResults = await new AxeBuilder({ page }).withTags(AXE_TAGS).include(locator).analyze();

  expect(accessibilityScanResults.violations.map(({ description }) => description)).toBe([]);
});
