import { describe, it, expect, vi } from 'vitest';
import { SortSettingsFactory } from '@/lib/search/aws/query/sortSettingsFactory';
import { SearchQuery, SortOrder, SortType } from '@/lib/search/api/search';

const mockProgramLevelProvider = vi.fn((order: SortOrder) => [
  { 'programLevels.order': { order, nested: { path: 'programLevels' } } },
]);

const buildQuery = (type: SortType, order: SortOrder): SearchQuery => ({
  type: 'activity',
  lang: 'en',
  page: 0,
  limit: 20,
  sort: { type, order },
});

describe('SortSettingsFactory.fromQuery', () => {
  const factory = new SortSettingsFactory(mockProgramLevelProvider);

  it('sorts by name.keyword ascending for title ascending sort', () => {
    const result = factory.fromQuery(buildQuery(SortType.TITLE, SortOrder.ASCENDING));
    expect(result).toEqual([{ 'name.keyword': { order: SortOrder.ASCENDING } }]);
  });

  it('sorts by name.keyword descending for title descending sort', () => {
    const result = factory.fromQuery(buildQuery(SortType.TITLE, SortOrder.DESCENDING));
    expect(result).toEqual([{ 'name.keyword': { order: SortOrder.DESCENDING } }]);
  });

  it('delegates to programLevelProvider for program level ascending sort', () => {
    mockProgramLevelProvider.mockClear();
    factory.fromQuery(buildQuery(SortType.PROGRAM_LEVEL, SortOrder.ASCENDING));
    expect(mockProgramLevelProvider).toHaveBeenCalledWith(SortOrder.ASCENDING);
  });

  it('delegates to programLevelProvider for program level descending sort', () => {
    mockProgramLevelProvider.mockClear();
    factory.fromQuery(buildQuery(SortType.PROGRAM_LEVEL, SortOrder.DESCENDING));
    expect(mockProgramLevelProvider).toHaveBeenCalledWith(SortOrder.DESCENDING);
  });
});
