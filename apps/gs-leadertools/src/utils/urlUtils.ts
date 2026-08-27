import { Filter } from '@/types/filter';
import { SelectedFilter } from '@/components/LandingPageClient/types';

export const encodeFiltersToUrl = (filters: SelectedFilter[]): string => {
  const params = new URLSearchParams();

  filters.forEach(filter => {
    filter.values.forEach(value => {
      params.append(filter.type, value.id);
    });
  });

  return params.toString();
};

export const decodeFiltersFromUrl = (searchParams: URLSearchParams, allFilters: Filter[]): SelectedFilter[] => {
  const filterMap = new Map<string, Filter[]>();

  for (const [type, value] of searchParams.entries()) {
    const matchedValue = allFilters.find(f => f.id === value);
    if (matchedValue) {
      const existing = filterMap.get(type) || [];
      filterMap.set(type, [...existing, matchedValue]);
    }
  }

  return Array.from(filterMap.entries()).map(([type, values]) => ({
    type,
    values,
  }));
};
