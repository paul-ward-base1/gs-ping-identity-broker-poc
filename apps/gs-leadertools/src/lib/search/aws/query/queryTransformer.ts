import { CommonFilters, SearchFilter, SearchQuery, SortOrder } from '@/lib/search/api/search';
import { API } from '@opensearch-project/opensearch';
import { indexNameFor, SearchIndexType } from '@/lib/search/aws/searchIndex';
import { SortSettingsFactory } from '@/lib/search/aws/query/sortSettingsFactory';
import { getFilterModel } from '@/lib/filters';
import { Filter, FilterModel } from '@/types/filter';
import {
  OpenSearchFilterClause,
  OpenSearchNestedTermsClause,
  OpenSearchTermsClause,
} from '@/lib/search/aws/query/filterClause';

/**
 * Returns the opposite sort order of the given order.
 *
 * @param order - The current sort order.
 * @return The opposite sort order.
 */
export const oppositeOrderOf = (order: SortOrder): SortOrder => {
  return order === SortOrder.ASCENDING ? SortOrder.DESCENDING : SortOrder.ASCENDING;
};

/**
 * QueryTransformer is an abstract class that transforms a SearchQuery into an OpenSearch request format.
 *
 * @template T - The type of SearchQuery to be transformed.
 */
export abstract class QueryTransformer<T extends SearchQuery> {
  /**
   * Constructor for QueryTransformer.
   *
   * @param indexType - The type of search index to be used.
   * @param sortSettingsFactory - Factory to create sort settings based on the query.
   * @protected
   */
  protected constructor(
    private readonly indexType: SearchIndexType,
    private readonly sortSettingsFactory: SortSettingsFactory
  ) {}

  /**
   * Transforms the given SearchQuery into an OpenSearch request format.
   *
   * The OpenSearch client types `body` as optional, but this method always
   * populates it — so the return type tightens that field to `NonNullable`
   * to spare callers from defensive checks.
   *
   * @param query - The SearchQuery to be transformed.
   * @return An OpenSearch request object with a guaranteed `body`.
   */
  public async transform(query: T): Promise<API.Search_Request & { body: NonNullable<API.Search_Request['body']> }> {
    const fullTextQuery = this.transformTerm(query.term);
    const filterModel = await getFilterModel(query.lang);
    const filters = query?.filters ? this.transformFilters(query.filters, filterModel) : [];
    const combinedFilters = [fullTextQuery, ...filters].filter((p): p is NonNullable<typeof p> => !!p);

    return {
      index: indexNameFor(this.indexType, query.lang),
      body: {
        query: combinedFilters.length
          ? {
              bool: {
                must: combinedFilters,
              },
            }
          : {
              match_all: {},
            },
        size: query.limit,
        from: query.page * query.limit,
        sort: this.sortSettingsFactory.fromQuery(query),
      },
    };
  }

  protected abstract getQueryFields(): string[];

  protected abstract transformFilters(filters: CommonFilters, model: FilterModel): OpenSearchFilterClause[];

  protected transformFilter(
    fieldName: string,
    filter?: SearchFilter,
    model?: Filter[] | undefined
  ): OpenSearchTermsClause | null {
    const mappedFilter = this.mapFilter(filter, model);

    return mappedFilter?.length
      ? {
          terms: {
            [fieldName]: mappedFilter,
          },
        }
      : null;
  }

  protected transformNestedFilter(
    fieldName: string,
    fieldPath: string,
    filter?: SearchFilter,
    model?: Filter[] | undefined
  ): OpenSearchNestedTermsClause | null {
    const mappedFilter = this.mapFilter(filter, model);

    return mappedFilter?.length
      ? {
          nested: {
            path: fieldPath,
            query: {
              terms: {
                [fieldName]: mappedFilter,
              },
            },
          },
        }
      : null;
  }

  private transformTerm(term?: string | null) {
    return term
      ? {
          multi_match: {
            query: term,
            type: 'bool_prefix' as const,
            fields: this.getQueryFields(),
          },
        }
      : null;
  }

  private mapFilter(filter?: SearchFilter, model?: Filter[] | undefined): string[] | null {
    return filter?.length && model
      ? filter.map(value => model.find(q => q.id === value)?.name ?? null).filter((p): p is string => !!p)
      : null;
  }
}
