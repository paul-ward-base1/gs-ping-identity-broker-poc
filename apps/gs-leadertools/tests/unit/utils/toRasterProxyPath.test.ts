import { describe, expect, it } from 'vitest';
import { toRasterProxyPath } from '@/utils/toRasterProxyPath';

describe('toRasterProxyPath', () => {
  it('inserts the /r/ token into an /img/ proxy path', () => {
    expect(toRasterProxyPath('/img/badges/junior/automotive.svg')).toBe('/img/r/badges/junior/automotive.svg');
  });

  it('is idempotent (does not stack tokens)', () => {
    expect(toRasterProxyPath('/img/r/a/b.svg')).toBe('/img/r/a/b.svg');
  });

  it('leaves non-proxy URLs untouched and handles empty input', () => {
    expect(toRasterProxyPath('https://example.com/a.svg')).toBe('https://example.com/a.svg');
    expect(toRasterProxyPath(undefined)).toBe('');
  });
});
