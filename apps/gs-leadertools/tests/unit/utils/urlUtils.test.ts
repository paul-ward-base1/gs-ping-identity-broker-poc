import { describe, it, expect } from 'vitest';
import { encodeFiltersToUrl, decodeFiltersFromUrl } from '@/utils/urlUtils';

describe('encodeFiltersToUrl', () => {
  it('returns empty string for empty filters array', () => {
    expect(encodeFiltersToUrl([])).toBe('');
  });

  it('encodes a single filter with one value', () => {
    const filters = [{ type: 'level', values: [{ id: 'daisy', name: 'Daisy' }] }];
    expect(encodeFiltersToUrl(filters)).toBe('level=daisy');
  });

  it('encodes a filter with multiple values as repeated params', () => {
    const filters = [
      {
        type: 'level',
        values: [
          { id: 'daisy', name: 'Daisy' },
          { id: 'brownie', name: 'Brownie' },
        ],
      },
    ];
    const result = encodeFiltersToUrl(filters);
    expect(result).toContain('level=daisy');
    expect(result).toContain('level=brownie');
  });

  it('encodes multiple filter types into a single query string', () => {
    const filters = [
      { type: 'level', values: [{ id: 'daisy', name: 'Daisy' }] },
      { type: 'theme', values: [{ id: 'outdoors', name: 'Outdoors' }] },
    ];
    const result = encodeFiltersToUrl(filters);
    expect(result).toContain('level=daisy');
    expect(result).toContain('theme=outdoors');
  });
});

describe('decodeFiltersFromUrl', () => {
  const allFilters = [
    { id: 'daisy', name: 'Daisy' },
    { id: 'brownie', name: 'Brownie' },
    { id: 'outdoors', name: 'Outdoors' },
  ];

  it('returns empty array for empty search params', () => {
    expect(decodeFiltersFromUrl(new URLSearchParams(), allFilters)).toEqual([]);
  });

  it('returns empty array when param IDs do not match any known filter', () => {
    const params = new URLSearchParams('level=unknown-id');
    expect(decodeFiltersFromUrl(params, allFilters)).toEqual([]);
  });

  it('decodes a single known filter value', () => {
    const params = new URLSearchParams('level=daisy');
    const result = decodeFiltersFromUrl(params, allFilters);
    expect(result).toEqual([{ type: 'level', values: [{ id: 'daisy', name: 'Daisy' }] }]);
  });

  it('decodes multiple values for the same filter type', () => {
    const params = new URLSearchParams('level=daisy&level=brownie');
    const result = decodeFiltersFromUrl(params, allFilters);
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('level');
    expect(result[0].values).toHaveLength(2);
  });

  it('decodes filters of different types into separate entries', () => {
    const params = new URLSearchParams('level=daisy&theme=outdoors');
    const result = decodeFiltersFromUrl(params, allFilters);
    expect(result).toHaveLength(2);
    const types = result.map(f => f.type);
    expect(types).toContain('level');
    expect(types).toContain('theme');
  });
});
