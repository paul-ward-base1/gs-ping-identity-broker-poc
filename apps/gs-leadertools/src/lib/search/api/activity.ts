import { SearchQuery, SearchResult } from '@/lib/search/api/search';
import { ActivityModel } from '@/types/activity';

/**
 * Activity query type.
 */
export const ACTIVITY_QUERY_TYPE = 'activity';

/**
 * ActivityQuery is used to search for activities.
 */
export interface ActivityQuery extends SearchQuery {
  // empty for now
}

/**
 * ActivityHit represents a single activity in the search results.
 */
export type ActivityHit = Pick<ActivityModel, 'path' | 'name' | 'timeRange'> & {
  imagePath?: string,
  badgeFamilies?: string[];
  programLevels?: string[];
  themes?: string[];
}

/**
 * ActivitySearchResult is the result of an activity search query.
 */
export interface ActivitySearchResult extends SearchResult<ActivityHit> {
  /**
   * results is an array of activity hits that match the search query.
   */
  results: ActivityHit[];
}
