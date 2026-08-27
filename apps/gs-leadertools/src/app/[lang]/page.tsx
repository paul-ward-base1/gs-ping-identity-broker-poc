import React from 'react';
import { createI18nInstance } from '@/i18n';
import { getDictionary, LangProps } from '@/lib/dictionaries';
import { LandingPageClient } from '@/components/LandingPageClient';
import { getFilterModel } from '@/lib/filters';
import { FILTER_MAPPING } from '@/lib/search/query/queryFactory';
import { ChoiceProps } from '@/components/Choice/types';
import { FilterModel } from '@/types/filter';
import { FilterObject } from '@/components/LandingPageClient/types';
import { TranslateFn } from '@/types/i18n';

const formatFilters = (translate: TranslateFn, aemFilters: FilterModel): FilterObject[] => {
  return FILTER_MAPPING.map(mapping => {
    const allowedValues = mapping.getAllowedEntities(aemFilters).map(entry => ({
      id: entry.id,
      label: entry.name,
      value: entry.name,
    })) as ChoiceProps[];

    return {
      type: mapping.filterKey,
      options: allowedValues,
      label: translate(`search.filter.${mapping.filterKey}.label`),
    };
  });
};

export default async function Page({ params }: Readonly<LangProps>) {
  const { lang } = await params;

  let dict = {};
  let filters: FilterObject[] = [];
  try {
    dict = await getDictionary(lang);
  } catch (error) {
    throw new Error(`Failed to fetch badges or dictionary ${lang} ${error}`);
  }
  const i18n = await createI18nInstance(lang, dict);

  const t = i18n.t;

  try {
    const aemFilters = await getFilterModel(lang);
    filters = formatFilters(t, aemFilters);
  } catch (e) {
    console.error(`Failed to fetch filters ${lang}`, e);
  }

  const pageTitle = `${t('landingPage.banner.title')} \n ${t('landingPage.banner.subtitle')}`;

  return <LandingPageClient filters={filters} lang={lang} pageTitle={pageTitle} />;
}
