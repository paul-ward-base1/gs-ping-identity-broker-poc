import { describe, expect, it } from 'vitest';
import { toTintProxyPath } from '@/utils/toTintProxyPath';

describe('toTintProxyPath', () => {
  it('inserts the /c<hex>/ token into an /img/ proxy path', () => {
    expect(toTintProxyPath('/img/badges/junior/automotive.svg', '#E22F22')).toBe(
      '/img/ce22f22/badges/junior/automotive.svg'
    );
  });

  it('accepts a hex without a leading #', () => {
    expect(toTintProxyPath('/img/a/b.svg', '5c1f8b')).toBe('/img/c5c1f8b/a/b.svg');
  });

  it('is idempotent (does not stack tokens)', () => {
    const once = toTintProxyPath('/img/a/b.svg', 'e22f22');
    expect(toTintProxyPath(once, 'e22f22')).toBe(once);
  });

  it('returns the src unchanged for an invalid/missing color', () => {
    expect(toTintProxyPath('/img/a/b.svg', undefined)).toBe('/img/a/b.svg');
    expect(toTintProxyPath('/img/a/b.svg', 'nothex')).toBe('/img/a/b.svg');
    expect(toTintProxyPath('/img/a/b.svg', '#fff')).toBe('/img/a/b.svg');
  });

  it('leaves non-proxy URLs untouched and handles empty input', () => {
    expect(toTintProxyPath('https://example.com/a.svg', 'e22f22')).toBe('https://example.com/a.svg');
    expect(toTintProxyPath(undefined, 'e22f22')).toBe('');
  });
});
