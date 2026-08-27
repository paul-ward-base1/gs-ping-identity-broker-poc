import type { Page } from 'playwright/test';

async function gotoComponent(componentName: string, page: Page) {
  const componentId = componentName?.toLowerCase()?.replaceAll(/[^a-z0-9]/g, '-');
  const url = `./iframe.html?id=components-${componentId}`;
  await page.goto(url);
  await page.waitForLoadState('load');
  await page.waitForLoadState('domcontentloaded');
  return page;
}

async function clickAll(locator: string, page: Page) {
  const components = await page.$$(locator);
  for (const component of components) {
    await component.click();
  }
  return page;
}

async function countChecked(locator: string, page: Page) {
  let total = 0;
  const components = await page.$$(locator);
  for (const component of components) {
    if (await component.isChecked()) {
      total++;
    }
  }
  return total;
}

export { gotoComponent, clickAll, countChecked };
