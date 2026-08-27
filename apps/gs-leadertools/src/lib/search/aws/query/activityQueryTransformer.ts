import { CommonFilters, SortOrder } from '@/lib/search/api/search';
import { oppositeOrderOf, QueryTransformer } from '@/lib/search/aws/query/queryTransformer';
import { ActivityQuery } from '@/lib/search/api/activity';
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
          path: 'programLevels'
        }
      }
    },
    { _score: { order: oppositeOrder } },
  ] as SortSettings;
};

const QUERY_FIELDS = [
  'name',
  'description',
  'timeRange',
];

/**
 * ActivityQueryTransformer transforms an ActivityQuery into a format suitable for querying the search index.
 */
export class ActivityQueryTransformer extends QueryTransformer<ActivityQuery> {
  constructor() {
    super(SearchIndexType.ACTIVITY, new SortSettingsFactory(programLevelOrderProvider));
  }

  protected getQueryFields(): string[] {
    return QUERY_FIELDS;
  }

  protected transformFilters(filters: CommonFilters, model: FilterModel): OpenSearchFilterClause[] {
    return [
      this.transformFilter('badgeFamilies', filters.badgeFamily, model.badgeFamilies),
      this.transformNestedFilter(
        'programLevels.name', 'programLevels', filters.programLevel, model.programLevels),
      this.transformFilter('themes', filters.theme, model.themes),
    ].filter((p): p is OpenSearchFilterClause => !!p);
  }

}
