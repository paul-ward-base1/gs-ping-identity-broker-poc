import { ActivityQuery, ActivitySearchResult } from '@/lib/search/api/activity';
import { SearchEngine } from './searchEngine';
import { BadgeHit, BadgeQuery, BadgeSearchResult } from '@/lib/search/api/badge';
import { AwardHit, AwardQuery, AwardSearchResult } from '@/lib/search/api/award';
import { debugLog } from '@/lib/debug';
import { getOpenSearchClient, MAX_SIZE } from '@/lib/search/aws/client';
import { SearchQuery, SearchResult, SortOrder, SortType } from '@/lib/search/api/search';
import { SearchStrategy } from '@/lib/search/aws/strategy/searchStrategy';
import { activitySearchStrategy } from '@/lib/search/aws/strategy/activitySearchStrategy';
import { API } from '@opensearch-project/opensearch';
import { badgeSearchStrategy } from '@/lib/search/aws/strategy/badgeSearchStrategy';
import { awardSearchStrategy } from '@/lib/search/aws/strategy/awardSearchStrategy';

const getEffectiveProgramLevelOrder = (hit: BadgeHit, order: SortOrder): number => {
  const orders = hit.programLevelOrders;
  if (!orders?.length) return order === SortOrder.ASCENDING ? Infinity : -Infinity;
  return order === SortOrder.ASCENDING ? Math.min(...orders) : Math.max(...orders);
};

const sortMergedHits = (hits: BadgeHit[], sort: BadgeQuery['sort']): BadgeHit[] => {
  if (!sort) return [...hits];
  return [...hits].sort((a, b) => {
    if (sort.type === SortType.TITLE) {
      const cmp = a.name.localeCompare(b.name);
      return sort.order === SortOrder.ASCENDING ? cmp : -cmp;
    }
    if (sort.type === SortType.PROGRAM_LEVEL) {
      const aOrder = getEffectiveProgramLevelOrder(a, sort.order);
      const bOrder = getEffectiveProgramLevelOrder(b, sort.order);
      if (aOrder !== bOrder) return sort.order === SortOrder.ASCENDING ? aOrder - bOrder : bOrder - aOrder;
      return sort.order === SortOrder.ASCENDING ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
    }
    return 0;
  });
};

const awardHitToBadgeHit = (award: AwardHit): BadgeHit => ({
  path: award.path ?? '',
  name: award.name ?? '',
  imagePath: award.imagePath,
  family: award.family,
  programLevels: award.programLevels,
  programLevelOrders: award.programLevelOrders,
  theme: award.theme,
  type: 'award',
});

/**
 * AWS OpenSearch Engine implementation of SearchEngine.
 */
const Engine = new (class implements SearchEngine {
  findActivities: (query: ActivityQuery) => Promise<ActivitySearchResult> = async (query: ActivityQuery) => {
    return this.search(query, activitySearchStrategy);
  };

  findBadges: (query: BadgeQuery) => Promise<BadgeSearchResult> = async (query: BadgeQuery) => {
    return this.search(query, badgeSearchStrategy);
  };

  findBadgesAndAwards: (query: BadgeQuery) => Promise<BadgeSearchResult> = async (query: BadgeQuery) => {
    const fullQuery = { ...query, page: 0, limit: MAX_SIZE };

    const [badgeResult, awardResult] = await Promise.all([
      this.search(fullQuery, badgeSearchStrategy) as Promise<BadgeSearchResult>,
      (this.search(fullQuery as AwardQuery, awardSearchStrategy) as Promise<AwardSearchResult>).catch(err => {
        console.warn('awsOpenSearchEngine: Award search failed — awards will be absent from results:', err?.message);
        debugLog('awsOpenSearchEngine', 'Award search failed (index may not exist yet):', err?.message);
        return { total: 0, hits: 0, page: fullQuery.page, limit: fullQuery.limit, results: [] } as AwardSearchResult;
      }),
    ]);

    const allHits: BadgeHit[] = [...badgeResult.results, ...awardResult.results.map(awardHitToBadgeHit)];
    const sorted = sortMergedHits(allHits, query.sort);
    const start = query.page * query.limit;
    const paginatedResults = sorted.slice(start, start + query.limit);
    const combinedTotal = badgeResult.total + awardResult.total;

    debugLog(
      'awsOpenSearchEngine',
      `findBadgesAndAwards: badges=${badgeResult.total}, awards=${awardResult.total}, combined=${combinedTotal}`
    );

    return {
      total: combinedTotal,
      hits: paginatedResults.length,
      page: query.page,
      limit: query.limit,
      results: paginatedResults,
    };
  };

  private async search<Q extends SearchQuery, D, R, U extends SearchResult<R>>(
    query: Q,
    strategy: SearchStrategy<Q, D, R>
  ): Promise<U> {
    debugLog('awsOpenSearchEngine', 'Incoming query', query);
    const transformedQuery = await strategy.transformQuery(query);
    debugLog('awsOpenSearchEngine', 'Transformed query', JSON.stringify(transformedQuery));
    const { hits, total } = await this.executeSearch(transformedQuery);
    debugLog('awsOpenSearchEngine', 'Response total', total);

    const processedHits = hits
      .map(hit => hit._source as Partial<D> | undefined)
      .filter((source): source is Partial<D> => !!source)
      .map(source => strategy.transformHit(source));

    return {
      total: typeof total === 'number' ? total : total?.value,
      hits: processedHits.length,
      page: query.page,
      limit: query.limit,
      results: processedHits,
    } as U;
  }

  private async executeSearch(transformedQuery: API.Search_Request) {
    const client = getOpenSearchClient();
    const {
      body: {
        hits: { hits, total },
      },
    } = await client.search(transformedQuery);
    return { hits, total };
  }
})();

/**
 * AWS Open Search implementation of SearchEngine.
 */
export default Engine as SearchEngine;
