import { test, expect, Page } from '@playwright/test';
import { gotoComponent, clickAll, countChecked } from 'tests/helper/storybook';

const componentName = 'ChoiceGroup: Radio Group';
const componentLocator = '.gs-choice-group.gs-choice-group--type-radio';

test('should be visible when rendered', async ({ page }) => {
  await gotoComponent(componentName, page);
  const component = page.locator(componentLocator);
  await expect(component).toBeVisible();
});

test.skip('should allow only 1 selection in group', async ({ page }) => {
  await gotoComponent(componentName, page);
  await page.locator(componentLocator).waitFor({ state: 'visible' });
  await clickAll(`${componentLocator} input[type=radio]`, page);
  const total = await countChecked(`${componentLocator} input[type=radio]`, page);
  expect(total).toEqual(1);
});
