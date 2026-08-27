import { describe, it, expect } from 'vitest';
import { getLocale, pathnameHasLocale } from '@/lib/locale';

describe('getLocale', () => {
  it('extracts "en" from English pathname', () => {
    expect(getLocale('/en/search')).toBe('en');
  });

  it('extracts "es" from Spanish pathname', () => {
    expect(getLocale('/es/badges')).toBe('es');
  });

  it('defaults to "en" for unknown locale segment', () => {
    expect(getLocale('/fr/page')).toBe('en');
  });

  it('defaults to "en" for root path', () => {
    expect(getLocale('/')).toBe('en');
  });

  it('defaults to "en" for empty string', () => {
    expect(getLocale('')).toBe('en');
  });
});

describe('pathnameHasLocale', () => {
  it('returns true for exact "/en"', () => {
    expect(pathnameHasLocale('/en')).toBe(true);
  });

  it('returns true for path starting with "/en/"', () => {
    expect(pathnameHasLocale('/en/search')).toBe(true);
  });

  it('returns true for "/es/badges"', () => {
    expect(pathnameHasLocale('/es/badges')).toBe(true);
  });

  it('returns false for unknown locale prefix', () => {
    expect(pathnameHasLocale('/fr/page')).toBe(false);
  });

  it('returns false for root path', () => {
    expect(pathnameHasLocale('/')).toBe(false);
  });
});
