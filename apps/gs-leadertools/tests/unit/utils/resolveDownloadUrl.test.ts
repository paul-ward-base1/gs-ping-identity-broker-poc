import { describe, it, expect } from 'vitest';
import { resolveDownloadUrl } from '@/utils/resolveDownloadUrl';

describe('resolveDownloadUrl', () => {
  it('returns relative URLs unchanged', () => {
    expect(resolveDownloadUrl('/dam/file.pdf')).toBe('/dam/file.pdf');
  });

  it('routes absolute URLs through the /api/download proxy (encoded)', () => {
    expect(resolveDownloadUrl('https://author.example.com/a b.pdf')).toBe(
      '/api/download?url=https%3A%2F%2Fauthor.example.com%2Fa%20b.pdf'
    );
  });

  it('returns undefined for an empty or undefined url', () => {
    expect(resolveDownloadUrl(undefined)).toBeUndefined();
    expect(resolveDownloadUrl('')).toBeUndefined();
  });
});
