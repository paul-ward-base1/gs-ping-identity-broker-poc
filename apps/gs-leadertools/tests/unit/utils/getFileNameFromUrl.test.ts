import { describe, it, expect } from 'vitest';

import { getFileNameFromUrl } from '@/utils/getFileNameFromUrl';

describe('getFileNameFromUrl', () => {
  it('returns the basename with extension from an /img path', () => {
    expect(getFileNameFromUrl('/img/en/badges/junior/automotive/media/documents/Junior-Vehicle-Design-Guide.pdf')).toBe(
      'Junior-Vehicle-Design-Guide.pdf'
    );
  });

  it('returns the basename from an absolute URL', () => {
    expect(getFileNameFromUrl('https://example.com/files/report.pdf')).toBe('report.pdf');
  });

  it('strips query strings', () => {
    expect(getFileNameFromUrl('/files/report.pdf?v=2&download=true')).toBe('report.pdf');
  });

  it('strips hash fragments', () => {
    expect(getFileNameFromUrl('/files/report.pdf#page=3')).toBe('report.pdf');
  });

  it('decodes URL-encoded names', () => {
    expect(getFileNameFromUrl('/files/First%20Aid%20Kit.pdf')).toBe('First Aid Kit.pdf');
  });

  it('returns undefined for undefined input', () => {
    expect(getFileNameFromUrl(undefined)).toBeUndefined();
  });

  it('returns undefined for an empty string', () => {
    expect(getFileNameFromUrl('')).toBeUndefined();
  });

  it('returns undefined when the path ends in a slash', () => {
    expect(getFileNameFromUrl('/files/')).toBeUndefined();
  });
});
