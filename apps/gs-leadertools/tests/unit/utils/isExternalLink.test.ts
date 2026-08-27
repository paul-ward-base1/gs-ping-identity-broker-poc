import { describe, it, expect } from 'vitest';
import { isExternalLink } from '@/utils/isExternalLink';

describe('isExternalLink', () => {
  it('returns false for null href', () => {
    expect(isExternalLink(null, 'girlscouts.org')).toBe(false);
  });

  it('returns false for empty string href', () => {
    expect(isExternalLink('', 'girlscouts.org')).toBe(false);
  });

  it('returns false for a relative path', () => {
    expect(isExternalLink('/activities/hiking', 'girlscouts.org')).toBe(false);
  });

  it('returns false for an https link to the same hostname', () => {
    expect(isExternalLink('https://girlscouts.org/page', 'girlscouts.org')).toBe(false);
  });

  it('returns true for an https link to a different hostname', () => {
    expect(isExternalLink('https://example.com/page', 'girlscouts.org')).toBe(true);
  });

  it('returns true for an http link to a different hostname', () => {
    expect(isExternalLink('http://example.com/page', 'girlscouts.org')).toBe(true);
  });

  it('returns true for a www link to a different hostname', () => {
    expect(isExternalLink('www.example.com/page', 'girlscouts.org')).toBe(true);
  });

  it('returns false for a www link containing the same hostname', () => {
    expect(isExternalLink('www.girlscouts.org/page', 'girlscouts.org')).toBe(false);
  });
});
