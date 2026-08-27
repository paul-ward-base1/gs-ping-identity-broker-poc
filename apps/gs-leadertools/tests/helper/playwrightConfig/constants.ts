import dotenv from 'dotenv';
import { devices, type PlaywrightTestConfig } from "playwright/test";
import type { ProjectName, ViewportName } from './types';

type ViewportConfig = NonNullable<NonNullable<PlaywrightTestConfig['use']>>;

const QA_ENV = process.env.QA_ENV?.toLocaleLowerCase() ?? 'local'; // 'local', 'dev', 'uat', 'prod'

dotenv.config({path: `./tests/.env.${QA_ENV}`})

const BASE_URL: Record<ProjectName, string | undefined> = {
    app: process.env.APP_BASE_URL,
    storybook: process.env.STORYBOOK_BASE_URL,
    api: process.env.API_BASE_URL,
}

const VIEWPORTS: Record<ViewportName, ViewportConfig> = {
  mobile: devices['iPhone 14 Pro'],
  tablet: {
    ...devices['iPad Pro 11'],
    viewport: {
      width: 1024,
      height: 1366,
    },
  },
  desktop: {
    viewport: {
      width: 1440,
      height: 1024,
    },
  },
};

const TEST_DIRS: Record<ProjectName, string> = {
  app: './tests/app',
  storybook: './tests/storybook',
  api: './tests/api',
};

export { QA_ENV, BASE_URL, VIEWPORTS, TEST_DIRS }
