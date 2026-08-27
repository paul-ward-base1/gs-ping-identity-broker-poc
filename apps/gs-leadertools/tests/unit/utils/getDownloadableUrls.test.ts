import { describe, it, expect } from 'vitest';
import { getDownloadableUrls } from '@/utils/getDownloadableUrls';

describe('getDownloadableUrls', () => {
  it('returns only defined urls, preserving order', () => {
    expect(getDownloadableUrls([{ url: '/a.pdf' }, { url: undefined }, { url: '/b.pdf' }])).toEqual([
      '/a.pdf',
      '/b.pdf',
    ]);
  });

  it('returns [] when no item has a url', () => {
    expect(getDownloadableUrls([{ url: undefined }, {}])).toEqual([]);
  });
});
