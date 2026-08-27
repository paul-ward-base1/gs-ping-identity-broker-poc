import { cache } from 'react';
import { Locale } from './locale';
import { fetchFilters } from '@/apis/filters';
import { Filter, FilterModel, ProgramLevelFilter } from '@/types/filter';

const patterns = {
  badgeFamily: /\/static\/badge-families\/(.+)/i,
  programLevel: /\/static\/program-levels\/[^/]+\/(.+)/i,
  theme: /\/static\/themes\/(.+)/i,
};

const emptyFilterModel = () => {
  return {
    badgeFamilies: [] as Filter[],
    programLevels: [] as ProgramLevelFilter[],
    themes: [] as Filter[],
  } as FilterModel;
};

const addId = (items: Filter[] | undefined, pattern: RegExp) => {
  items?.forEach((item: Filter) => {
    const idMatch = item.path?.match(pattern) ?? [];
    let id = idMatch.length ? idMatch?.[1] : null;
    if (id) {
      item.id = id;
    }
  });
};

const fetchFilterDefinition = async (locale: Locale): Promise<FilterModel> => {
  try {
    let filters = ((await fetchFilters(locale)) as FilterModel) ?? emptyFilterModel();
    addId(filters?.badgeFamilies, patterns.badgeFamily);
    addId(filters?.programLevels, patterns.programLevel);
    addId(filters?.themes, patterns.theme);

    return filters;
  } catch (error) {
    console.error('Error fetching filters:', error, { locale });
  }

  return emptyFilterModel();
};

export const getFilterModel = cache(fetchFilterDefinition);
