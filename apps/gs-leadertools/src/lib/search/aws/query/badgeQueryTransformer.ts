import { CommonFilters, SortOrder } from '@/lib/search/api/search';
import { oppositeOrderOf, QueryTransformer } from '@/lib/search/aws/query/queryTransformer';
import { BadgeQuery } from '@/lib/search/api/badge';
import { SearchIndexType } from '@/lib/search/aws/searchIndex';
import { SortSettings, SortSettingsFactory, SortSettingsProvider } from '@/lib/search/aws/query/sortSettingsFactory';
import { FilterModel } from '@/types/filter';
import { OpenSearchFilterClause } from '@/lib/search/aws/query/filterClause';

const programLevelOrderProvider: SortSettingsProvider = (order: SortOrder) => {
  const oppositeOrder = oppositeOrderOf(order);

  return [
    {
      'programLevel.order': {
        order: order,
        nested: {
          path: 'programLevel'
        }
      },
    },
    { _score: { order: oppositeOrder } },
  ] as SortSettings;
};

const QUERY_FIELDS = [
  'id',
  'name',
  'description',
  'steps.*'
];
/**
 * BadgeQueryTransformer transforms a BadgeQuery into a format suitable for querying the search index.
 */
export class BadgeQueryTransformer extends QueryTransformer<BadgeQuery> {
  constructor() {
    super(SearchIndexType.BADGE, new SortSettingsFactory(programLevelOrderProvider));
  }

  protected getQueryFields(): string[] {
    return QUERY_FIELDS;
  }

  protected transformFilters(filters: CommonFilters, model: FilterModel): OpenSearchFilterClause[] {
    return [
      this.transformFilter('family', filters.badgeFamily, model.badgeFamilies),
      this.transformNestedFilter(
        'programLevel.name', 'programLevel', filters.programLevel, model.programLevels),
      this.transformFilter('theme', filters.theme, model.themes),
    ].filter((p): p is OpenSearchFilterClause => !!p);
  }

}
