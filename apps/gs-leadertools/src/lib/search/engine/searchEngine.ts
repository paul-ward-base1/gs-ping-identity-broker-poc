import { ActivityQuery, ActivitySearchResult } from '@/lib/search/api/activity';
import { BadgeQuery, BadgeSearchResult } from '@/lib/search/api/badge';
import { SearchQuery, SearchResult, SearchType } from '@/lib/search/api/search';

/**
 * SearchRunner is a function type that takes a search query and returns a promise of search results.
 *
 * @param T - The type of the search query.
 * @param S - The type of the search result.
 * @param query - The search query to run.
 * @return A promise that resolves to the search result.
 */
export type SearchRunner<T extends SearchQuery, S extends SearchResult> = (query: T) => Promise<S>;

/**
 * SearchTypeMap binds each SearchType to its concrete query and result shapes.
 * It is the single source of truth used by the API route, query factories, and engine implementations
 * to keep activity- and badge-specific types narrowed at compile time.
 *
 * Note: AWARD is intentionally absent — awards are merged into badge results via
 * findBadgesAndAwards and share the BadgeQuery / BadgeSearchResult types.
 */
export type SearchTypeMap = {
  [SearchType.ACTIVITY]: { query: ActivityQuery; result: ActivitySearchResult };
  [SearchType.BADGE]: { query: BadgeQuery; result: BadgeSearchResult };
};

/**
 * SearchEngine is an interface that defines methods for searching activities and badges.
 */
export interface SearchEngine {
  /**
   * findActivities is a method that takes an ActivityQuery and returns a promise of ActivitySearchResult.
   */
  findActivities: SearchRunner<ActivityQuery, ActivitySearchResult>;

  /**
   * findBadges is a method that takes a BadgeQuery and returns a promise of BadgeSearchResult.
   */
  findBadges: SearchRunner<BadgeQuery, BadgeSearchResult>;

  /**
   * findBadgesAndAwards fetches badges and awards together, merges them, and returns
   * a unified BadgeSearchResult with correct combined total and pagination.
   */
  findBadgesAndAwards: SearchRunner<BadgeQuery, BadgeSearchResult>;
}
