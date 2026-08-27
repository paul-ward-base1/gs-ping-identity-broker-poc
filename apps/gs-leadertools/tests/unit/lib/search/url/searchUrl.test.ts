import { describe, it, expect } from 'vitest';
import { activitySearchUrlFactory } from '@/lib/search/url/activitySearchUrlFactory';
import { badgeSearchUrlFactory } from '@/lib/search/url/badgeSearchUrlFactory';
import { SearchType, SortOrder, SortType } from '@/lib/search/api/search';

const BASE_ACTIVITY_QUERY = {
  type: SearchType.ACTIVITY,
  lang: 'en' as const,
  page: 0,
  limit: 20,
  sort: { type: SortType.TITLE, order: SortOrder.ASCENDING },
};

describe('activitySearchUrlFactory.build', () => {
  it('returns base URL when all params are defaults', () => {
    expect(activitySearchUrlFactory.build(BASE_ACTIVITY_QUERY)).toBe('/api/search/activity/en');
  });

  it('appends search term as q param', () => {
    const query = { ...BASE_ACTIVITY_QUERY, term: 'hiking' };
    expect(activitySearchUrlFactory.build(query)).toContain('q=hiking');
  });

  it('omits q param when term is empty string', () => {
    const query = { ...BASE_ACTIVITY_QUERY, term: '' };
    expect(activitySearchUrlFactory.build(query)).toBe('/api/search/activity/en');
  });

  it('omits q param when term is null', () => {
    const query = { ...BASE_ACTIVITY_QUERY, term: null };
    expect(activitySearchUrlFactory.build(query)).toBe('/api/search/activity/en');
  });

  it('appends program level filter', () => {
    const query = { ...BASE_ACTIVITY_QUERY, filters: { programLevel: ['daisy'] } };
    expect(activitySearchUrlFactory.build(query)).toContain('level=daisy');
  });

  it('appends multiple program level filters as repeated params', () => {
    const query = { ...BASE_ACTIVITY_QUERY, filters: { programLevel: ['daisy', 'brownie'] } };
    const url = activitySearchUrlFactory.build(query);
    expect(url).toContain('level=daisy');
    expect(url).toContain('level=brownie');
  });

  it('appends badge family filter', () => {
    const query = { ...BASE_ACTIVITY_QUERY, filters: { badgeFamily: ['stem'] } };
    expect(activitySearchUrlFactory.build(query)).toContain('family=stem');
  });

  it('appends theme filter', () => {
    const query = { ...BASE_ACTIVITY_QUERY, filters: { theme: ['outdoors'] } };
    expect(activitySearchUrlFactory.build(query)).toContain('theme=outdoors');
  });

  it('appends non-default page number', () => {
    const query = { ...BASE_ACTIVITY_QUERY, page: 2 };
    expect(activitySearchUrlFactory.build(query)).toContain('page=2');
  });

  it('omits page param when page equals default (0)', () => {
    expect(activitySearchUrlFactory.build(BASE_ACTIVITY_QUERY)).not.toContain('page=');
  });

  it('appends non-default limit', () => {
    const query = { ...BASE_ACTIVITY_QUERY, limit: 10 };
    expect(activitySearchUrlFactory.build(query)).toContain('limit=10');
  });

  it('omits limit param when limit equals default (20)', () => {
    expect(activitySearchUrlFactory.build(BASE_ACTIVITY_QUERY)).not.toContain('limit=');
  });

  it('omits sort param when sort is default (title ascending)', () => {
    expect(activitySearchUrlFactory.build(BASE_ACTIVITY_QUERY)).not.toContain('sort=');
  });

  it('appends sort=z-a for title descending', () => {
    const query = { ...BASE_ACTIVITY_QUERY, sort: { type: SortType.TITLE, order: SortOrder.DESCENDING } };
    expect(activitySearchUrlFactory.build(query)).toContain('sort=z-a');
  });

  it('appends sort=level-asc for program level ascending', () => {
    const query = { ...BASE_ACTIVITY_QUERY, sort: { type: SortType.PROGRAM_LEVEL, order: SortOrder.ASCENDING } };
    expect(activitySearchUrlFactory.build(query)).toContain('sort=level-asc');
  });

  it('appends sort=level-desc for program level descending', () => {
    const query = { ...BASE_ACTIVITY_QUERY, sort: { type: SortType.PROGRAM_LEVEL, order: SortOrder.DESCENDING } };
    expect(activitySearchUrlFactory.build(query)).toContain('sort=level-desc');
  });

  it('URL-encodes special characters in term', () => {
    const query = { ...BASE_ACTIVITY_QUERY, term: 'hello world' };
    expect(activitySearchUrlFactory.build(query)).toContain('q=hello%20world');
  });
});

describe('badgeSearchUrlFactory.build', () => {
  const BASE_BADGE_QUERY = {
    type: SearchType.BADGE,
    lang: 'es' as const,
    page: 0,
    limit: 20,
    sort: { type: SortType.TITLE, order: SortOrder.ASCENDING },
  };

  it('returns base URL for badge type with Spanish locale', () => {
    expect(badgeSearchUrlFactory.build(BASE_BADGE_QUERY)).toBe('/api/search/badge/es');
  });

  it('appends search term for badge query', () => {
    const query = { ...BASE_BADGE_QUERY, term: 'science' };
    expect(badgeSearchUrlFactory.build(query)).toContain('q=science');
  });

  it('appends badge family filter for badge query', () => {
    const query = { ...BASE_BADGE_QUERY, filters: { badgeFamily: ['outdoors'] } };
    expect(badgeSearchUrlFactory.build(query)).toContain('family=outdoors');
  });
});
