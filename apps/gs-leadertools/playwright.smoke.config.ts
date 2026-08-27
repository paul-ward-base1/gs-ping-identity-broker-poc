import { defineConfig, devices } from '@playwright/test';

/**
 * Minimal Playwright config for smoke tests only.
 * Expects the dev server to already be running on localhost:3000.
 * Usage: ENV=dev yarn dev   (in a separate terminal)
 *        npx playwright test --config=playwright.smoke.config.ts
 */
export default defineConfig({
  timeout: 45000,
  use: {
    headless: true,
    baseURL: 'http://localhost:3000',
    ignoreHTTPSErrors: true,
    trace: 'on-first-retry',
  },
  testDir: './tests/app',
  projects: [
    {
      name: 'desktop',
      use: { viewport: { width: 1440, height: 1024 } },
    },
    {
      name: 'mobile',
      use: { ...devices['iPhone 14 Pro'] },
    },
    {
      name: 'tablet',
      use: { viewport: { width: 1024, height: 1366 } },
    },
  ],
  // No webServer block — dev server must already be running
});
