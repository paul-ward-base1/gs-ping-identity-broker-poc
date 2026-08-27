import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/filters', () => ({
  getFilterModel: vi.fn().mockResolvedValue({
    badgeFamilies: [{ id: 'stem', name: 'STEM' }],
    programLevels: [{ id: 'daisy', name: 'Daisy', order: 1 }],
    themes: [{ id: 'outdoors', name: 'Outdoors' }],
  }),
}));

import { oppositeOrderOf } from '@/lib/search/aws/query/queryTransformer';
import { ActivityQueryTransformer } from '@/lib/search/aws/query/activityQueryTransformer';
import { BadgeQueryTransformer } from '@/lib/search/aws/query/badgeQueryTransformer';
import { AwardQueryTransformer } from '@/lib/search/aws/query/awardQueryTransformer';
import { SortOrder, SortType } from '@/lib/search/api/search';

// ── oppositeOrderOf ──────────────────────────────────────────────────────────

describe('oppositeOrderOf', () => {
  it('returns DESCENDING for ASCENDING', () => {
    expect(oppositeOrderOf(SortOrder.ASCENDING)).toBe(SortOrder.DESCENDING);
  });

  it('returns ASCENDING for DESCENDING', () => {
    expect(oppositeOrderOf(SortOrder.DESCENDING)).toBe(SortOrder.ASCENDING);
  });
});

// ── ActivityQueryTransformer ─────────────────────────────────────────────────

describe('ActivityQueryTransformer.transform', () => {
  const transformer = new ActivityQueryTransformer();

  const baseQuery = {
    type: 'activity' as const,
    lang: 'en' as const,
    page: 0,
    limit: 20,
    sort: { type: SortType.TITLE, order: SortOrder.ASCENDING },
  };

  it('returns match_all when there is no term and no filters', async () => {
    const result = await transformer.transform(baseQuery);
    expect(result.body.query).toEqual({ match_all: {} });
  });

  it('uses the activity index name for the given locale', async () => {
    const result = await transformer.transform(baseQuery);
    expect(result.index).toBe('activity-en');
  });

  it('sets size and from from limit and page', async () => {
    const result = await transformer.transform({ ...baseQuery, page: 2, limit: 10 });
    expect(result.body.size).toBe(10);
    expect(result.body.from).toBe(20);
  });

  it('adds a multi_match bool_prefix clause when a search term is provided', async () => {
    const result = await transformer.transform({ ...baseQuery, term: 'hiking' });
    expect(result.body.query).toMatchObject({
      bool: {
        must: [
          {
            multi_match: {
              query: 'hiking',
              type: 'bool_prefix',
              fields: expect.arrayContaining(['name', 'description', 'timeRange']),
            },
          },
        ],
      },
    });
  });

  it('maps badgeFamily filter ID to name and builds a terms clause', async () => {
    const result = await transformer.transform({ ...baseQuery, filters: { badgeFamily: ['stem'] } });
    expect(result.body.query).toMatchObject({
      bool: { must: [{ terms: { badgeFamilies: ['STEM'] } }] },
    });
  });

  it('maps programLevel filter ID to name and builds a nested clause', async () => {
    const result = await transformer.transform({ ...baseQuery, filters: { programLevel: ['daisy'] } });
    expect(result.body.query).toMatchObject({
      bool: { must: [{ nested: { path: 'programLevels', query: { terms: { 'programLevels.name': ['Daisy'] } } } }] },
    });
  });

  it('maps theme filter ID to name and builds a terms clause', async () => {
    const result = await transformer.transform({ ...baseQuery, filters: { theme: ['outdoors'] } });
    expect(result.body.query).toMatchObject({
      bool: { must: [{ terms: { themes: ['Outdoors'] } }] },
    });
  });

  it('excludes a filter whose ID is not in the filter model', async () => {
    const result = await transformer.transform({ ...baseQuery, filters: { badgeFamily: ['unknown-id'] } });
    expect(result.body.query).toEqual({ match_all: {} });
  });

  it('sorts by name.keyword for title sort', async () => {
    const result = await transformer.transform(baseQuery);
    expect(result.body.sort).toEqual([{ 'name.keyword': { order: SortOrder.ASCENDING } }]);
  });
});

// ── BadgeQueryTransformer ────────────────────────────────────────────────────

describe('BadgeQueryTransformer.transform', () => {
  const transformer = new BadgeQueryTransformer();

  const baseQuery = {
    type: 'badge' as const,
    lang: 'es' as const,
    page: 0,
    limit: 20,
    sort: { type: SortType.TITLE, order: SortOrder.ASCENDING },
  };

  it('uses the badge index name for the given locale', async () => {
    const result = await transformer.transform(baseQuery);
    expect(result.index).toBe('badge-es');
  });

  it('returns match_all when there is no term and no filters', async () => {
    const result = await transformer.transform(baseQuery);
    expect(result.body.query).toEqual({ match_all: {} });
  });

  it('maps badgeFamily filter to the "family" field (not "badgeFamilies")', async () => {
    const result = await transformer.transform({ ...baseQuery, filters: { badgeFamily: ['stem'] } });
    expect(result.body.query).toMatchObject({
      bool: { must: [{ terms: { family: ['STEM'] } }] },
    });
  });

  it('maps programLevel filter to the "programLevel" nested path (not "programLevels")', async () => {
    const result = await transformer.transform({ ...baseQuery, filters: { programLevel: ['daisy'] } });
    expect(result.body.query).toMatchObject({
      bool: { must: [{ nested: { path: 'programLevel', query: { terms: { 'programLevel.name': ['Daisy'] } } } }] },
    });
  });
});

// ── AwardQueryTransformer ────────────────────────────────────────────────────

describe('AwardQueryTransformer.transform', () => {
  const transformer = new AwardQueryTransformer();

  const baseQuery = {
    type: 'award' as const,
    lang: 'en' as const,
    page: 0,
    limit: 20,
    sort: { type: SortType.TITLE, order: SortOrder.ASCENDING },
  };

  it('uses the award index name for the given locale', async () => {
    const result = await transformer.transform(baseQuery);
    expect(result.index).toBe('award-en');
  });

  it('returns match_all when there is no term and no filters', async () => {
    const result = await transformer.transform(baseQuery);
    expect(result.body.query).toEqual({ match_all: {} });
  });

  it('searches awards by keyword over id, name and description', async () => {
    const result = await transformer.transform({ ...baseQuery, term: 'bronze' });
    expect(result.body.query).toMatchObject({
      bool: {
        must: [
          {
            multi_match: {
              query: 'bronze',
              type: 'bool_prefix',
              fields: ['id', 'name', 'description'],
            },
          },
        ],
      },
    });
  });

  it('maps badgeFamily filter to the "family" field', async () => {
    const result = await transformer.transform({ ...baseQuery, filters: { badgeFamily: ['stem'] } });
    expect(result.body.query).toMatchObject({
      bool: { must: [{ terms: { family: ['STEM'] } }] },
    });
  });

  it('maps programLevel filter to the "programLevels" nested path', async () => {
    const result = await transformer.transform({ ...baseQuery, filters: { programLevel: ['daisy'] } });
    expect(result.body.query).toMatchObject({
      bool: { must: [{ nested: { path: 'programLevels', query: { terms: { 'programLevels.name': ['Daisy'] } } } }] },
    });
  });

  it('maps theme filter ID to name and builds a terms clause', async () => {
    const result = await transformer.transform({ ...baseQuery, filters: { theme: ['outdoors'] } });
    expect(result.body.query).toMatchObject({
      bool: { must: [{ terms: { theme: ['Outdoors'] } }] },
    });
  });

  it('combines the keyword term and all three filters into a single bool query', async () => {
    const result = await transformer.transform({
      ...baseQuery,
      term: 'leadership',
      filters: { badgeFamily: ['stem'], programLevel: ['daisy'], theme: ['outdoors'] },
    });
    expect(result.body.query).toMatchObject({
      bool: {
        must: expect.arrayContaining([
          { multi_match: { query: 'leadership', type: 'bool_prefix', fields: ['id', 'name', 'description'] } },
          { terms: { family: ['STEM'] } },
          { nested: { path: 'programLevels', query: { terms: { 'programLevels.name': ['Daisy'] } } } },
          { terms: { theme: ['Outdoors'] } },
        ]),
      },
    });
  });

  it('excludes a filter whose ID is not in the filter model', async () => {
    const result = await transformer.transform({ ...baseQuery, filters: { theme: ['unknown-id'] } });
    expect(result.body.query).toEqual({ match_all: {} });
  });

  it('sorts by the nested programLevels.order for program-level sort', async () => {
    const result = await transformer.transform({
      ...baseQuery,
      sort: { type: SortType.PROGRAM_LEVEL, order: SortOrder.ASCENDING },
    });
    expect(result.body.sort).toEqual([
      { 'programLevels.order': { order: SortOrder.ASCENDING, nested: { path: 'programLevels' } } },
      { _score: { order: SortOrder.DESCENDING } },
    ]);
  });
});
