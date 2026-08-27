import { describe, it, expect } from 'vitest';
import { SearchType } from '@/lib/search/api/search';
import { searchParamsInvalid } from '@/lib/search/url/searchUrl';

describe('searchParamsInvalid', () => {
  it('returns false for valid activity type and "en" locale', () => {
    expect(searchParamsInvalid(SearchType.ACTIVITY, 'en')).toBe(false);
  });

  it('returns false for valid badge type and "es" locale', () => {
    expect(searchParamsInvalid(SearchType.BADGE, 'es')).toBe(false);
  });

  it('returns true for invalid search type', () => {
    expect(searchParamsInvalid('unknown' as SearchType, 'en')).toBe(true);
  });

  it('returns true for invalid locale', () => {
    // @ts-expect-error — intentionally passing an unsupported locale to test the guard
    expect(searchParamsInvalid(SearchType.ACTIVITY, 'fr')).toBe(true);
  });

  it('returns true when both type and locale are invalid', () => {
    // @ts-expect-error — intentionally passing an unsupported locale to test the guard
    expect(searchParamsInvalid('unknown' as SearchType, 'fr')).toBe(true);
  });
});
