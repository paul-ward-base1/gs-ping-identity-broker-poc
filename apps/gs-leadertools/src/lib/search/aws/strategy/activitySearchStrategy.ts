import { ActivityHit, ActivityQuery } from '@/lib/search/api/activity';
import { ActivityQueryTransformer } from '@/lib/search/aws/query/activityQueryTransformer';
import { SearchStrategy } from '@/lib/search/aws/strategy/searchStrategy';
import { ActivityDocument } from '@/lib/search/aws/indexer/source/activity/activityDocument';
import { ProgramLevel } from '@/lib/search/aws/indexer/source/programLevel';

/**
 * ActivitySearchStrategy is responsible for transforming an ActivityQuery into a format suitable for querying the search index
 *
 * It also transforms the search hits into ActivityHit objects.
 * This strategy is used by the AWS OpenSearch engine to perform searches related to activities.
 * @extends SearchStrategy<ActivityQuery, ActivityDocument, ActivityHit>
 */
export const activitySearchStrategy = new class extends SearchStrategy<ActivityQuery, ActivityDocument, ActivityHit> {

  /**
   * Constructor for ActivitySearchStrategy.
   */
  constructor() {
    super(new ActivityQueryTransformer());
  }

  /**
   * Transforms a search hit from the OpenSearch index into an ActivityHit object.
   *
   * This method extracts relevant fields from the source object and returns an ActivityHit.
   * @param source - The raw search hit from the OpenSearch index.
   */
  public transformHit(source: Partial<ActivityDocument>): ActivityHit {
    return {
      path: source.path ?? '',
      name: source.name ?? '',
      imagePath: source.image ?? undefined,
      timeRange: source.timeRange,
      badgeFamilies: source.badgeFamilies ?? undefined,
      programLevels: this.transformProgramLevels(source.programLevels),
      themes: source.themes ?? undefined,
    };
  }

  private transformProgramLevels(programLevels: ProgramLevel[] | undefined): string[] | undefined {
    const names = programLevels?.map(p => p.name);

    return names?.length ? names : undefined;
  }

};
