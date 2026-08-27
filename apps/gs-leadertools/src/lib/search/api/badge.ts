import { SearchQuery, SearchResult } from '@/lib/search/api/search';
import { BadgeModel } from '@/types/badge';

/**
 * Badge query type.
 */
export const BADGE_QUERY_TYPE = 'badge';

/**
 * BadgeQuery is used to search for badges.
 */
export interface BadgeQuery extends SearchQuery {
  // empty for now
}

/**
 * BadgeHit represents a single badge or award in the search results.
 * Awards appear in the Badges tab and are merged into this result type.
 */
export type BadgeHit = Pick<BadgeModel, 'path'> & {
  name: string;
  imagePath?: string;
  family?: string;
  programLevel?: string;
  programLevels?: string[];
  programLevelOrders?: number[];
  theme?: string;
  type?: 'badge' | 'award';
};

/**
 * BadgeSearchResult is the result of a badge search query.
 */
export interface BadgeSearchResult extends SearchResult<BadgeHit> {
  results: BadgeHit[];
}
