import { SearchQuery } from '@/lib/search/api/search';
import { BADGE_QUERY_TYPE, BadgeQuery } from '@/lib/search/api/badge';
import { SearchQueryFactory } from '@/lib/search/query/queryFactory';

/**
 * BadgeQueryFactory is responsible for creating BadgeQuery instances
 */
class BadgeQueryFactory extends SearchQueryFactory<BadgeQuery> {
  createFromPartial(query: Partial<SearchQuery>): BadgeQuery {
    return {
      type: BADGE_QUERY_TYPE,
      ...query,
    } as BadgeQuery;
  }
}

/**
 * badgeQueryFactory is an instance of BadgeQueryFactory
 */
export const badgeQueryFactory = new BadgeQueryFactory();
