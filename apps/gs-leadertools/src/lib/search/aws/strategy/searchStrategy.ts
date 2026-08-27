import { SearchQuery } from '@/lib/search/api/search';
import { QueryTransformer } from '@/lib/search/aws/query/queryTransformer';
import { API } from '@opensearch-project/opensearch';

/**
 * SearchStrategy is an abstract class that defines the structure for transforming search queries and hits.
 *
 * @template T - The type of SearchQuery to be transformed.
 * @template D - The shape of the document stored in the OpenSearch index (i.e. the `_source` of a hit).
 *               OpenSearch never guarantees every field is returned, so concrete strategies receive a
 *               `Partial<D>` and decide how to map missing fields.
 * @template R - The shape of the public hit returned to the API consumer.
 */
export abstract class SearchStrategy<T extends SearchQuery, D, R> {

  /**
   * Constructor for SearchStrategy.
   *
   * @param queryTransformer - The QueryTransformer instance used to transform the search query.
   * @protected
   */
  protected constructor(private readonly queryTransformer: QueryTransformer<T>) {
  }

  /**
   * Transforms a SearchQuery into an OpenSearch request format.
   *
   * @param query - The SearchQuery to be transformed.
   */
  public async transformQuery(query: T): Promise<API.Search_Request> {
    return await this.queryTransformer.transform(query);
  }

  /**
   * Transforms a search hit from the OpenSearch index into a specific type.
   *
   * @param hit - The raw search hit `_source` from the OpenSearch index. Treated as `Partial<D>`
   *              because OpenSearch may omit fields based on `_source` filtering or schema drift.
   */
  public abstract transformHit(hit: Partial<D>): R;

}
