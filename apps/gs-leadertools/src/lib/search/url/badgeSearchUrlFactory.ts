import { QueryChunks, SearchUrlFactory } from '@/lib/search/url/searchUrl';
import { BadgeQuery } from '@/lib/search/api/badge';

/**
 * BadgeSearchUrlFactory is responsible for creating URLs for badge search queries.
 */
class BadgeSearchUrlFactory extends SearchUrlFactory<BadgeQuery> {
  protected addQueryChunks(query: BadgeQuery, chunks: QueryChunks): void {
    // do nothing
  }
}

/**
 * badgeSearchUrlFactory is an instance of BadgeSearchUrlFactory
 */
export const badgeSearchUrlFactory = new BadgeSearchUrlFactory();
