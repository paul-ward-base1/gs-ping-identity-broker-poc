import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

export function initI18nForStorybook() {
  if (!i18n.isInitialized) {
    i18n.use(initReactI18next).init({
      lng: 'en',
      fallbackLng: 'en',
      debug: false,
      resources: {
        en: {
          translation: {
            global: {
              settings: {
                action: { label: 'Settings', hint: 'Settings' },
              },
              languageSwitch: {
                action: { hint: 'Switch language' },
                modal: { title: 'Change Language', close: 'Close' },
                items: {
                  english: { hint: 'Switch to English', label: 'EN' },
                  spanish: { hint: 'Switch to Spanish', label: 'ES' },
                },
              },
              header: {
                navigation: {
                  items: {
                    home: { title: 'Badges & Activities', url: '/' },
                  },
                },
              },
              footer: {
                copyrightFormat: '© {{year}} Your Company. All rights reserved.',
                text: 'A 501(c)(3) Organization. All Rights Reserved.',
              },
            },
          },
        },
      },
      interpolation: { escapeValue: false },
    });
  }

  return i18n;
}
