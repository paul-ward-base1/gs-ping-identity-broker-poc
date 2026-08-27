'use client';

import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import { MixedDictionary } from './dictionaries';

export function createClientI18nSync(locale: string, resources: MixedDictionary) {
  const instance = i18next.createInstance();
  instance.use(initReactI18next).init({
    lng: locale,
    fallbackLng: 'en',
    resources: {
      [locale]: { translation: resources },
    },
    interpolation: { escapeValue: false },
    // Synchronous init: resources are pre-loaded so no async work is needed.
    // Without this flag i18next defers its callback to the next tick, meaning
    // the instance may not be ready when useMemo returns it during SSR/hydration.
    initImmediate: false,
  });
  return instance;
}
