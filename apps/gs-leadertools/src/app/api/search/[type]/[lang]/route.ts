import { NextResponse } from 'next/server';
import { notFound } from 'next/navigation';
import { searchParamsInvalid, SearchProps } from '@/lib/search/url/searchUrl';
import { activityQueryFactory } from '@/lib/search/query/activityQueryFactory';
import { badgeQueryFactory } from '@/lib/search/query/badgeQueryFactory';
import { SearchResult, SearchType } from '@/lib/search/api/search';
import { SearchQueryFactory } from '@/lib/search/query/queryFactory';
import { debugLog } from '@/lib/debug';
import { Locale } from '@/lib/locale';
import { loadSearchEngine } from '@/lib/search/engine/searchEngineLoader';
import { SearchRunner, SearchTypeMap } from '@/lib/search/engine/searchEngine';

const searchEngine = await loadSearchEngine.load();

type SearchHandler<K extends SearchType> = {
  queryFactory: SearchQueryFactory<SearchTypeMap[K]['query']>;
  searchRunner: SearchRunner<SearchTypeMap[K]['query'], SearchTypeMap[K]['result']>;
};

type SearchHandlers = { [K in SearchType]: SearchHandler<K> };

const handlers: SearchHandlers = {
  [SearchType.ACTIVITY]: { queryFactory: activityQueryFactory, searchRunner: q => searchEngine.findActivities(q) },
  [SearchType.BADGE]: { queryFactory: badgeQueryFactory, searchRunner: q => searchEngine.findBadgesAndAwards(q) },
};

const extractResultMetadata = (results: SearchResult) => {
  return {
    page: results.page,
    total: results.total,
  };
};

const runSearch = async <K extends SearchType>(
  request: Request,
  type: K,
  lang: Locale
): Promise<SearchTypeMap[K]['result']> => {
  const handler = handlers[type];
  const { searchParams } = new URL(request.url);
  const query = await handler.queryFactory.createFromUrl(lang, searchParams);
  debugLog('Search', `Running query:`, query);
  const results = await handler.searchRunner(query);
  debugLog('Search', `Search result metadata:`, extractResultMetadata(results));

  return results;
};

/**
 * Handles GET requests for search queries.
 *
 * @param request - The incoming request object.
 * @param params - The parameters from the request URL, including type and lang.
 * @return NextResponse - A JSON response containing the search results or a 404 not found response if parameters are invalid.
 */
export const GET = async (request: Request, { params }: SearchProps) => {
  const { type, lang } = await params;

  if (searchParamsInvalid(type, lang)) {
    debugLog('Search', `Invalid search parameters: [type=${type}", lang=${lang}]`);
    return notFound();
  }

  if (!handlers[type]) {
    debugLog('Search', `Unsupported search type [type=${type}"]`);
    return notFound();
  }

  const results = await runSearch(request, type, lang);

  return NextResponse.json(results);
};
