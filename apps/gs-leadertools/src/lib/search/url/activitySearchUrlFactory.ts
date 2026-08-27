import { QueryChunks, SearchUrlFactory } from '@/lib/search/url/searchUrl';
import { ActivityQuery } from '@/lib/search/api/activity';

/**
 * ActivitySearchUrlFactory is responsible for creating URLs for activity search queries.
 */
class ActivitySearchUrlFactory extends SearchUrlFactory<ActivityQuery> {
  protected addQueryChunks(query: ActivityQuery, chunks: QueryChunks): void {
    // do nothing
  }
}

/**
 * activitySearchUrlFactory is an instance of ActivitySearchUrlFactory
 */
export const activitySearchUrlFactory = new ActivitySearchUrlFactory();
