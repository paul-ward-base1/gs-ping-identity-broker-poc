import { AwardHit, AwardQuery } from '@/lib/search/api/award';
import { AwardQueryTransformer } from '@/lib/search/aws/query/awardQueryTransformer';
import { SearchStrategy } from '@/lib/search/aws/strategy/searchStrategy';
import { AwardDocument } from '@/lib/search/aws/indexer/source/award/awardDocument';
import { ProgramLevel } from '@/lib/search/aws/indexer/source/programLevel';

export const awardSearchStrategy = new (class extends SearchStrategy<AwardQuery, AwardDocument, AwardHit> {
  constructor() {
    super(new AwardQueryTransformer());
  }

  public transformHit(source: Partial<AwardDocument>): AwardHit {
    const programLevels = source.programLevels;
    return {
      path: source.path ?? '',
      name: source.name ?? '',
      imagePath: source.image ?? undefined,
      family: source.family ?? undefined,
      programLevels: programLevels?.map((p: ProgramLevel) => p.name),
      programLevelOrders: programLevels?.map((p: ProgramLevel) => p.order),
      theme: source.theme ?? undefined,
    };
  }
})();
