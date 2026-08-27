import { ACTIVITY_QUERY_TYPE, ActivityQuery } from '@/lib/search/api/activity';
import { SearchQuery } from '@/lib/search/api/search';
import { SearchQueryFactory } from '@/lib/search/query/queryFactory';

/**
 * ActivityQueryFactory is responsible for creating ActivityQuery instances
 */
class ActivityQueryFactory extends SearchQueryFactory<ActivityQuery> {
  createFromPartial(query: Partial<SearchQuery>): ActivityQuery {
    return {
      type: ACTIVITY_QUERY_TYPE,
      ...query,
    } as ActivityQuery;
  }
}

/**
 * activityQueryFactory is an instance of ActivityQueryFactory
 */
export const activityQueryFactory = new ActivityQueryFactory();
