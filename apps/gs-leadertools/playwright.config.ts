import { defineConfig } from '@playwright/test';
import { makeProjects, makeWebServers } from './tests/helper/playwrightConfig'

export default defineConfig({
  timeout: 30000,
  use: {
    headless: true,
    trace: 'on',
  },
  webServer: makeWebServers(),
  projects: makeProjects(),
});
