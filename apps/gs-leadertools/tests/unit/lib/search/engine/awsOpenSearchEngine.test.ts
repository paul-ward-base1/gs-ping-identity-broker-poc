import { describe, it, expect, vi, beforeEach } from 'vitest';

import { SortOrder, SortType } from '@/lib/search/api/search';

// The OpenSearch client module throws at import time unless AWS env vars are set,
// so it must be mocked. searchMock stands in for client.search and is configured
// per test to return badge/award hits (or throw) based on the queried index.
const { searchMock } = vi.hoisted(() => ({ searchMock: vi.fn() }));

vi.mock('@/lib/search/aws/client', () => ({
  getOpenSearchClient: () => ({ search: searchMock }),
  MAX_SIZE: 10000,
}));

vi.mock('@/lib/filters', () => ({
  getFilterModel: vi.fn().mockResolvedValue({
    badgeFamilies: [],
    programLevels: [],
    themes: [],
  }),
}));

import Engine from '@/lib/search/engine/awsOpenSearchEngine';

// Raw `_source` documents as they are stored in each index. Badges carry a single
// `programLevel` object; awards carry a `programLevels` array.
const badgeDocs = [
  {
    path: '/b/apple',
    name: 'Apple Badge',
    image: '/img/apple.png',
    family: 'Animals',
    programLevel: { name: 'Daisy', order: 1 },
    theme: 'Outdoors',
  },
  { path: '/b/zebra', name: 'Zebra Badge', programLevel: { name: 'Senior', order: 5 } },
];

const awardDocs = [
  {
    path: '/a/mango',
    name: 'Mango Award',
    image: '/img/mango.png',
    family: 'High Award',
    programLevels: [{ name: 'Junior', order: 3 }],
    theme: 'Leadership and Your Future',
  },
  {
    path: '/a/bronze',
    name: 'Bronze Award',
    programLevels: [
      { name: 'Cadette', order: 4 },
      { name: 'Senior', order: 5 },
    ],
  },
];

const osResponse = (sources: object[], total: number) => ({
  body: { hits: { hits: sources.map(_source => ({ _source })), total: { value: total } } },
});

const configureSearch = (opts: {
  badges?: object[];
  badgeTotal?: number;
  awards?: object[];
  awardTotal?: number;
  failAwards?: boolean;
}) => {
  searchMock.mockImplementation(async (req: { index: string }) => {
    if (req.index.startsWith('award')) {
      if (opts.failAwards) throw new Error('award index does not exist');
      return osResponse(opts.awards ?? [], opts.awardTotal ?? opts.awards?.length ?? 0);
    }
    return osResponse(opts.badges ?? [], opts.badgeTotal ?? opts.badges?.length ?? 0);
  });
};

const baseQuery = {
  type: 'badge' as const,
  lang: 'en' as const,
  page: 0,
  limit: 20,
  sort: { type: SortType.TITLE, order: SortOrder.ASCENDING },
};

describe('awsOpenSearchEngine.findBadgesAndAwards', () => {
  beforeEach(() => {
    searchMock.mockReset();
  });

  it('merges badges and awards, tagging awards with type "award"', async () => {
    configureSearch({ badges: badgeDocs, awards: awardDocs });

    const result = await Engine.findBadgesAndAwards(baseQuery);

    expect(result.results).toHaveLength(4);
    const byPath = Object.fromEntries(result.results.map(r => [r.path, r]));
    expect(byPath['/b/apple'].type).toBe('badge');
    expect(byPath['/a/mango']).toMatchObject({
      path: '/a/mango',
      name: 'Mango Award',
      imagePath: '/img/mango.png',
      family: 'High Award',
      programLevels: ['Junior'],
      programLevelOrders: [3],
      theme: 'Leadership and Your Future',
      type: 'award',
    });
  });

  it('reports a combined total from the badge and award totals, not the hit counts', async () => {
    configureSearch({ badges: badgeDocs, badgeTotal: 7, awards: awardDocs, awardTotal: 3 });

    const result = await Engine.findBadgesAndAwards(baseQuery);

    expect(result.total).toBe(10);
  });

  it('sorts the merged set alphabetically across both types for a title sort', async () => {
    configureSearch({ badges: badgeDocs, awards: awardDocs });

    const result = await Engine.findBadgesAndAwards({
      ...baseQuery,
      sort: { type: SortType.TITLE, order: SortOrder.ASCENDING },
    });

    expect(result.results.map(r => r.name)).toEqual(['Apple Badge', 'Bronze Award', 'Mango Award', 'Zebra Badge']);
  });

  it('sorts the merged set by program level across both types', async () => {
    configureSearch({ badges: badgeDocs, awards: awardDocs });

    const result = await Engine.findBadgesAndAwards({
      ...baseQuery,
      sort: { type: SortType.PROGRAM_LEVEL, order: SortOrder.ASCENDING },
    });

    // Effective orders: Apple=1, Mango=3, Bronze=min(4,5)=4, Zebra=5
    expect(result.results.map(r => r.name)).toEqual(['Apple Badge', 'Mango Award', 'Bronze Award', 'Zebra Badge']);
  });

  it('paginates the merged set', async () => {
    configureSearch({ badges: badgeDocs, awards: awardDocs });
    const sort = { type: SortType.TITLE, order: SortOrder.ASCENDING };

    const page0 = await Engine.findBadgesAndAwards({ ...baseQuery, page: 0, limit: 2, sort });
    expect(page0).toMatchObject({ page: 0, limit: 2, hits: 2, total: 4 });
    expect(page0.results.map(r => r.name)).toEqual(['Apple Badge', 'Bronze Award']);

    const page1 = await Engine.findBadgesAndAwards({ ...baseQuery, page: 1, limit: 2, sort });
    expect(page1).toMatchObject({ page: 1, limit: 2, hits: 2, total: 4 });
    expect(page1.results.map(r => r.name)).toEqual(['Mango Award', 'Zebra Badge']);
  });

  it('falls back to badges-only when the award search fails', async () => {
    configureSearch({ badges: badgeDocs, badgeTotal: 2, failAwards: true });

    const result = await Engine.findBadgesAndAwards(baseQuery);

    expect(result.total).toBe(2);
    expect(result.results).toHaveLength(2);
    expect(result.results.every(r => r.type === 'badge')).toBe(true);
  });
});
