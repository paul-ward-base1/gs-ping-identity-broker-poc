export const API_URL_BASE = '/api/search';

/**
 * ParameterName is an enum that defines the names of the query parameters used in search URLs.
 */
export enum ParameterName {
  BADGE_FAMILY_FILTER = 'family',
  PROGRAM_LEVEL_FILTER = 'level',
  THEME_FILTER = 'theme',
  LIMIT = 'limit',
  PAGE = 'page',
  SORT = 'sort',
  TERM = 'q'
}

/**
 * SortType is an enum that defines the types of sorting available for search results.
 */
// TODO add dictionary entries for these values
export enum SortTypeValue {
  TITLE_ASCENDING = 'a-z',
  TITLE_DESCENDING = 'z-a',
  PROGRAM_LEVEL_ASCENDING = 'level-asc',
  PROGRAM_LEVEL_DESCENDING = 'level-desc'
}

/**
 * API_URL_BASE is the base URL for the search API.
 */
export const DEFAULT_LIMIT = 20;

/**
 * DEFAULT_PAGE is the default page number for paginated search results.
 */
export const DEFAULT_PAGE = 0;

/**
 * DEFAULT_SORT_VALUE is the default sorting value used when no specific sort is provided.
 */
export const DEFAULT_SORT_VALUE = SortTypeValue.TITLE_ASCENDING;

