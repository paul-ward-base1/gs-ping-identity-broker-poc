import { Locale, locales } from '@/lib/locale';
import { SearchFilter, SearchQuery, SearchType, SortOrder, SortType } from '@/lib/search/api/search';
import {
  API_URL_BASE,
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
  DEFAULT_SORT_VALUE,
  ParameterName,
  SortTypeValue,
} from '@/lib/search/url/constants';


/**
 * SearchProps defines the parameters for the search request.
 */
export type SearchProps = {
  params: Promise<{ type: SearchType, lang: Locale }>;
};

/**
 * searchParamsInvalid checks if the provided search type and language are valid.
 *
 * @param type - The type of search being performed (e.g., activity, badge).
 * @param lang - The language in which the search is conducted.
 */
export const searchParamsInvalid = (type: SearchType, lang: Locale): boolean => {
  return !Object.values(SearchType).includes(type) || !(locales.includes(lang));
};

const SORT_MAPPING = {
  [SortType.TITLE]: {
    [SortOrder.ASCENDING]: SortTypeValue.TITLE_ASCENDING,
    [SortOrder.DESCENDING]: SortTypeValue.TITLE_DESCENDING,
  },
  [SortType.PROGRAM_LEVEL]: {
    [SortOrder.ASCENDING]: SortTypeValue.PROGRAM_LEVEL_ASCENDING,
    [SortOrder.DESCENDING]: SortTypeValue.PROGRAM_LEVEL_DESCENDING,
  },
} as const;

/**
 * QueryChunks is an array of key-value pairs representing query parameters.
 */
export type QueryChunks = { key: string; value: string }[];

/**
 * SearchUrlFactory is an abstract class that provides a method to build search URLs based on a given search query.
 */
export abstract class SearchUrlFactory<T extends SearchQuery> {

  /**
   * Builds a search URL based on the provided search query.
   *
   * @param query - The search query containing parameters such as type, language, term, filters, pagination, and sorting.
   */
  build(query: T): string {
    const base = `${API_URL_BASE}/${query.type}/${query.lang}`;

    const chunks: QueryChunks = [];
    this.addTerm(query?.term, chunks);
    this.addFilter(query?.filters?.programLevel, ParameterName.PROGRAM_LEVEL_FILTER, chunks);
    this.addFilter(query?.filters?.badgeFamily, ParameterName.BADGE_FAMILY_FILTER, chunks);
    this.addFilter(query?.filters?.theme, ParameterName.THEME_FILTER, chunks);
    this.addQueryChunks(query, chunks);
    this.addPaginationParameters(query, chunks);
    if (query.sort) {
      this.addSortParameter(query.sort, chunks);
    }

    const queryString = chunks
      .map((chunk) => `${chunk.key}=${encodeURIComponent(chunk.value)}`)
      .reduce((accumulator, current) => accumulator.length
        ? `${accumulator}&${current}`
        : `${accumulator}${current}`, '');

    return queryString.length ? `${base}?${queryString}` : base;
  }

  /**
   * Adds query-specific chunks to the query parameters.
   *
   * @param query - The search query to which the chunks will be added.
   * @param chunks - The array of query chunks to which the new chunks will be added.
   * @protected
   */
  protected abstract addQueryChunks(query: T, chunks: QueryChunks): void;

  /**
   * Adds a filter to the query chunks.
   *
   * @param filters - The filters to be added, which can be undefined.
   * @param name - The name of the parameter to which the filter will be added.
   * @param chunks - The array of query chunks to which the filter will be added.
   * @protected
   */
  protected addFilter(filters: SearchFilter | undefined, name: ParameterName, chunks: QueryChunks) {
    const filtersOrDefault = filters ?? [] as SearchFilter;
    filtersOrDefault.forEach((value) => {
      chunks.push({
        key: name,
        value,
      });
    });
  }

  private addTerm(term: string | null | undefined, chunks: QueryChunks) {
    if (term && term.length > 0) {
      chunks.push({ key: ParameterName.TERM, value: term });
    }
  }

  private addPaginationParameters(query: T, chunks: QueryChunks) {
    this.addNumberParameter({
      candidate: query.page,
      defaultValue: DEFAULT_PAGE,
    }, ParameterName.PAGE, chunks);
    this.addNumberParameter({
      candidate: query.limit,
      defaultValue: DEFAULT_LIMIT,
    }, ParameterName.LIMIT, chunks);
  }

  private addNumberParameter(value: {
    candidate: number,
    defaultValue: number
  }, name: string, chunks: QueryChunks) {
    if (this.isPositiveInteger(value.candidate) && value.candidate != value.defaultValue) {
      chunks.push({
        key: name,
        value: value.candidate.toString(),
      });
    }
  }

  private isPositiveInteger(value: number): boolean {
    return Number.isInteger(value) && value >= 0;
  }

  private addSortParameter(sort: {
    type: SortType;
    order: SortOrder
  }, chunks: QueryChunks) {
    const value = SORT_MAPPING[sort.type]?.[sort.order];
    if (!value || value !== DEFAULT_SORT_VALUE) {
      chunks.push({
        key: ParameterName.SORT,
        value,
      });
    }
  };
}
