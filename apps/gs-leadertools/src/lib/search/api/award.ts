import { SearchQuery, SearchResult } from '@/lib/search/api/search';
import { AwardModel } from '@/types/award';

export const AWARD_QUERY_TYPE = 'award';

export interface AwardQuery extends SearchQuery {
  // empty for now
}

export type AwardHit = Pick<AwardModel, 'path'> & {
  name: string;
  imagePath?: string;
  family?: string;
  programLevels?: string[];
  programLevelOrders?: number[];
  theme?: string;
};

export interface AwardSearchResult extends SearchResult<AwardHit> {
  results: AwardHit[];
}
