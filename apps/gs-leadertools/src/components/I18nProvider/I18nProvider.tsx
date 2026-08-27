'use client';

import { I18nextProvider } from 'react-i18next';
import { ReactNode, useMemo } from 'react';
import { createClientI18nSync } from '@/lib/i18n-client';
import { MixedDictionary } from '@/lib/dictionaries';

export const I18nProvider = ({
  locale,
  resources,
  children,
}: {
  locale: string;
  resources: MixedDictionary;
  children: ReactNode;
}) => {
  const i18nInstance = useMemo(() => createClientI18nSync(locale, resources), [locale, resources]);

  return <I18nextProvider i18n={i18nInstance}>{children}</I18nextProvider>;
};
