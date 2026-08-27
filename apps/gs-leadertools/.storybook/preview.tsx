import type { Preview } from '@storybook/react';
import { I18nextProvider } from 'react-i18next';
import React from 'react';
import { initI18nForStorybook } from './storybook-i18n';
import { LocaleProvider } from '../src/components/contexts/locale-context';

const i18n = initI18nForStorybook();

const preview: Preview = {
  decorators: [
    Story => (
      <LocaleProvider locale="en" filters={{}} isAuthorMode={false}>
        <I18nextProvider i18n={i18n}>
          <Story />
        </I18nextProvider>
      </LocaleProvider>
    ),
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    nextjs: {
      appDirectory: true,
    },
  },
};

export default preview;
