import { CommonFilters, SortOrder } from '@/lib/search/api/search';
import { oppositeOrderOf, QueryTransformer } from '@/lib/search/aws/query/queryTransformer';
import { AwardQuery } from '@/lib/search/api/award';
import { SearchIndexType } from '@/lib/search/aws/searchIndex';
import { SortSettings, SortSettingsFactory, SortSettingsProvider } from '@/lib/search/aws/query/sortSettingsFactory';
import { FilterModel } from '@/types/filter';
import { OpenSearchFilterClause } from '@/lib/search/aws/query/filterClause';

const programLevelOrderProvider: SortSettingsProvider = (order: SortOrder) => {
  const oppositeOrder = oppositeOrderOf(order);

  return [
    {
      'programLevels.order': {
        order: order,
        nested: {
          path: 'programLevels',
        },
      },
    },
    { _score: { order: oppositeOrder } },
  ] as SortSettings;
};

const QUERY_FIELDS = ['id', 'name', 'description'];

export class AwardQueryTransformer extends QueryTransformer<AwardQuery> {
  constructor() {
    super(SearchIndexType.AWARD, new SortSettingsFactory(programLevelOrderProvider));
  }

  protected getQueryFields(): string[] {
    return QUERY_FIELDS;
  }

  protected transformFilters(filters: CommonFilters, model: FilterModel): OpenSearchFilterClause[] {
    return [
      this.transformFilter('family', filters.badgeFamily, model.badgeFamilies),
      this.transformNestedFilter('programLevels.name', 'programLevels', filters.programLevel, model.programLevels),
      this.transformFilter('theme', filters.theme, model.themes),
    ].filter((p): p is OpenSearchFilterClause => !!p);
  }
}
