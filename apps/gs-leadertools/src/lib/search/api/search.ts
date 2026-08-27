import { Locale } from '@/lib/locale';

/**
 * SearchType enum defines the types of searches available in the application.
 */
export enum SearchType {
  ACTIVITY = 'activity',
  BADGE = 'badge',
}

/**
 * SortOrder enum defines the order in which search results can be sorted.
 */
export enum SortOrder {
  ASCENDING = 'asc',
  DESCENDING = 'desc',
}

/**
 * SortType enum defines the criteria by which search results can be sorted.
 * It includes options for sorting by title and program level.
 */
export enum SortType {
  TITLE = 'title',
  PROGRAM_LEVEL = 'program-level',
}

/**
 * SearchFilter type represents an array of strings used for filtering search results.
 */
export type SearchFilter = string[];

/**
 * CommonFilters interface defines the common filters that can be applied to search queries.
 */
export interface CommonFilters {
  /**
   * badgeFamily filter allows filtering by Badge Families.
   */
  badgeFamily?: SearchFilter;

  /**
   * programLevel filter allows filtering by Program Levels.
   */
  programLevel?: SearchFilter;

  /**
   * theme filter allows filtering by Themes.
   */
  theme?: SearchFilter;
}

/**
 * SearchQuery interface defines the structure of a search query.
 */
export interface SearchQuery {
  /**
   * type specifies the type of search being performed, such as 'activity' or 'badge'.
   */
  type: Readonly<string>;

  /**
   * lang specifies the language in which the search is conducted.
   */
  lang: Readonly<Locale>;

  /**
   * term is an optional search term that can be used to filter results.
   */
  term?: string | null;

  /**
   * page specifies the page number for paginated results.
   */
  page: number;

  /**
   * limit specifies the maximum number of results to return per page.
   */
  limit: number;

  /**
   * filters allow for additional filtering of search results based on common filters.
   */
  filters?: CommonFilters;

  /**
   * sort defines the sorting criteria for the search results, including type and order.
   */
  sort: {
    /**
     * type specifies the field by which to sort the results, such as 'title' or 'program-level'.
     */
    type: SortType;

    /**
     * order specifies the order of sorting, either ascending or descending.
     */
    order: SortOrder;
  };
}

/**
 * SearchResult interface defines the structure of a search result.
 */
export interface SearchResult<T = unknown> {
  /**
   * results is an array of search results.
   */
  results: T[];

  /**
   * total is the total number of results available for the search query.
   */
  total: number;

  /**
   * hits is the total number of hits found for the search query.
   */
  hits: number;

  /**
   * page is the current page number of the search results.
   */
  page: number;

  /**
   * limit is the maximum number of results per page.
   */
  limit: number;

  /**
   * total number of pages available for the search results.
   */
  totalPages?: number;
}
