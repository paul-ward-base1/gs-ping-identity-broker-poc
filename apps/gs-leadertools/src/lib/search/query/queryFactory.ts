import { Locale } from '@/lib/locale';
import { CommonFilters, SearchFilter, SearchQuery, SortOrder, SortType } from '@/lib/search/api/search';
import { getFilterModel } from '@/lib/filters';
import { Filter, FilterModel } from '@/types/filter';
import { debugLog } from '@/lib/debug';
import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
  DEFAULT_SORT_VALUE,
  ParameterName,
  SortTypeValue,
} from '@/lib/search/url/constants';

type CommonFilterKey = keyof CommonFilters;

interface FilterMapper {
  parameterName: ParameterName;
  filterKey: CommonFilterKey;
  getAllowedEntities: (model: FilterModel) => Filter[];
}

export const FILTER_MAPPING: FilterMapper[] = [
  {
    parameterName: ParameterName.PROGRAM_LEVEL_FILTER,
    filterKey: 'programLevel',
    getAllowedEntities: (model: FilterModel) => model.programLevels ?? [],
  },
  {
    parameterName: ParameterName.THEME_FILTER,
    filterKey: 'theme',
    getAllowedEntities: (model: FilterModel) => model.themes ?? [],
  },
  {
    parameterName: ParameterName.BADGE_FAMILY_FILTER,
    filterKey: 'badgeFamily',
    getAllowedEntities: (model: FilterModel) => model.badgeFamilies ?? [],
  },
] as const;

const SORT_MAPPING: Record<SortTypeValue, { type: SortType; order: SortOrder }> = {
  [SortTypeValue.TITLE_ASCENDING]: { type: SortType.TITLE, order: SortOrder.ASCENDING },
  [SortTypeValue.TITLE_DESCENDING]: { type: SortType.TITLE, order: SortOrder.DESCENDING },
  [SortTypeValue.PROGRAM_LEVEL_ASCENDING]: { type: SortType.PROGRAM_LEVEL, order: SortOrder.ASCENDING },
  [SortTypeValue.PROGRAM_LEVEL_DESCENDING]: { type: SortType.PROGRAM_LEVEL, order: SortOrder.DESCENDING },
} as const;

/**
 * Abstract class for creating search queries.
 */
export abstract class SearchQueryFactory<T extends SearchQuery> {
  /**
   * Creates an empty search query.
   *
   * @param lang - The locale for the search query.
   */
  async createEmpty(lang: Locale): Promise<T> {
    return this.createFromUrl(lang, new URLSearchParams());
  }

  /**
   * Creates a search query from the provided URL parameters.
   *
   * @param lang - The locale for the search query.
   * @param params - The URL search parameters containing the query details.
   */
  async createFromUrl(lang: Locale, params: URLSearchParams): Promise<T> {
    const page = parseInt(this.readParam(params, ParameterName.PAGE) ?? '');
    const rawSortKey = this.readParam(params, ParameterName.SORT) ?? '';
    const query: Partial<SearchQuery> = {
      lang: lang,
      term: this.readParam(params, ParameterName.TERM),
      filters: await this.createFilters(lang, params),
      page: !Number.isNaN(page) && page >= 0 ? page : DEFAULT_PAGE,
      limit: DEFAULT_LIMIT,
      sort: SORT_MAPPING[rawSortKey as SortTypeValue] ?? SORT_MAPPING[DEFAULT_SORT_VALUE],
    };

    return this.createFromPartial(query, params);
  }

  /**
   * Creates a search query from a partial query object and URL parameters.
   *
   * @param query - A partial search query object containing the search parameters.
   * @param params - The URL search parameters containing additional query details.
   * @return A search query object of type T.
   * @protected
   */
  protected abstract createFromPartial(query: Partial<SearchQuery>, params: URLSearchParams): T;

  private readParam(params: URLSearchParams, key: string): string | null {
    const value = params.get(key);
    return value ?? null;
  }

  private async createFilters(locale: Locale, params: URLSearchParams): Promise<{ [key: string]: SearchFilter }> {
    const filterModel = await getFilterModel(locale);

    // Move to concrete class when filters become type-specific
    return FILTER_MAPPING.map(mapping => this.asSearchFilterEntry(params, filterModel, mapping)).reduce(
      (accumulator, entry) => ({ ...accumulator, ...entry }),
      {}
    );
  }

  private asSearchFilterEntry(
    params: URLSearchParams,
    filterModel: FilterModel,
    mapping: FilterMapper
  ): { [key: string]: SearchFilter } {
    const values = params.getAll(mapping.parameterName);

    const allowedValues = mapping
      .getAllowedEntities(filterModel)
      .map(entry => entry.id)
      .filter(id => !!id);

    const filteredValues = values
      .filter(p => allowedValues.includes(p))
      .sort((a, b) => allowedValues.indexOf(a) - allowedValues.indexOf(b));

    debugLog('SearchQueryFactory', `Adding filter for ${mapping.filterKey} with values:`, filteredValues);

    return { [mapping.filterKey]: filteredValues };
  }
}
