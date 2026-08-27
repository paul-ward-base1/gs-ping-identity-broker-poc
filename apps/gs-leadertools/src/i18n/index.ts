import i18next, { InitOptions } from 'i18next';
import { MixedDictionary } from '@/lib/dictionaries';

export async function createI18nInstance(locale: string, resources: MixedDictionary) {
  const instance = i18next.createInstance();

  await instance.init({
    lng: locale,
    fallbackLng: 'en',
    resources: {
      [locale]: {
        translation: resources,
      },
    },
    interpolation: {
      escapeValue: false,
    },
  } as InitOptions);

  return instance;
}
