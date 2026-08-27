import { SearchStrategy } from '@/lib/search/aws/strategy/searchStrategy';
import { BadgeHit, BadgeQuery } from '@/lib/search/api/badge';
import { BadgeQueryTransformer } from '@/lib/search/aws/query/badgeQueryTransformer';
import { BadgeDocument } from '@/lib/search/aws/indexer/source/badge/badgeDocument';

/**
 * BadgeSearchStrategy is responsible for transforming a BadgeQuery into a format suitable for querying the search index
 */
export const badgeSearchStrategy = new (class extends SearchStrategy<BadgeQuery, BadgeDocument, BadgeHit> {
  /**
   * Constructor for BadgeSearchStrategy.
   */
  constructor() {
    super(new BadgeQueryTransformer());
  }

  /**
   * Transforms a search hit from the OpenSearch index into a BadgeHit object.
   *
   * This method extracts relevant fields from the source object and returns a BadgeHit.
   * @param source
   */
  public transformHit(source: Partial<BadgeDocument>): BadgeHit {
    return {
      path: source.path ?? '',
      name: source.name ?? '',
      imagePath: source.image ?? undefined,
      family: source.family ?? undefined,
      programLevel: source.programLevel?.name ?? undefined,
      programLevelOrders: source.programLevel?.order !== undefined ? [source.programLevel.order] : undefined,
      theme: source.theme ?? undefined,
      type: 'badge',
    };
  }
})();
