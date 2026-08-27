import { describe, expect, it } from 'vitest';
import { labelToLangId } from '@/components/Settings';

const items = [
  { id: 'en', label: 'English' },
  { id: 'es', label: 'Español' },
];

describe('labelToLangId', () => {
  it('matches exactly', () => {
    expect(labelToLangId('English', items)).toBe('en');
    expect(labelToLangId('Español', items)).toBe('es');
  });

  it('matches a OneLink label with a region suffix', () => {
    expect(labelToLangId('Español (Estados Unidos)', items)).toBe('es');
    expect(labelToLangId('English (United States)', items)).toBe('en');
  });

  it('matches case-insensitively', () => {
    expect(labelToLangId('english', items)).toBe('en');
    expect(labelToLangId('ESPAÑOL', items)).toBe('es');
  });

  it('returns undefined when no item matches', () => {
    expect(labelToLangId('Français', items)).toBeUndefined();
  });

  it('returns undefined for null', () => {
    expect(labelToLangId(null, items)).toBeUndefined();
  });

  it('returns undefined for undefined', () => {
    expect(labelToLangId(undefined, items)).toBeUndefined();
  });

  it('returns undefined for an empty string', () => {
    expect(labelToLangId('', items)).toBeUndefined();
  });

  it('returns undefined for a whitespace-only string', () => {
    expect(labelToLangId('   ', items)).toBeUndefined();
  });
});
