import { describe, it, expect } from 'vitest';
import {
  buildAemBadgePath,
  buildAemAwardPath,
  buildCmsActivityPath,
  normalizeBadgePath,
  normalizeAwardPath,
  normalizeActivityPath,
  safeNormalizeActivityPath,
} from '@/lib/aemContext';

describe('buildAemBadgePath', () => {
  it('builds a path without id', () => {
    expect(buildAemBadgePath('en', 'junior', 'automotive')).toBe(
      '/content/dam/gsusa-vtk-redesign/en/badges/junior/automotive'
    );
  });

  it('appends id when provided', () => {
    expect(buildAemBadgePath('es', 'brownie', 'pets', 'jcr:content')).toBe(
      '/content/dam/gsusa-vtk-redesign/es/badges/brownie/pets/jcr:content'
    );
  });
});

describe('buildCmsActivityPath', () => {
  it('builds a single-slug path when no group is given', () => {
    expect(buildCmsActivityPath('en', 'explore', 'lemon')).toBe(
      '/content/dam/gsusa-vtk-redesign/en/activities/explore/lemon/lemon'
    );
  });

  it('builds a grouped path when group is given', () => {
    expect(buildCmsActivityPath('en', 'badge', 'visit-a-food-bank', 's-z')).toBe(
      '/content/dam/gsusa-vtk-redesign/en/activities/badge/s-z/visit-a-food-bank/visit-a-food-bank'
    );
  });
});

describe('normalizeBadgePath', () => {
  it('returns "/" for undefined input', () => {
    expect(normalizeBadgePath(undefined)).toBe('/');
  });

  it('returns "/" for empty string', () => {
    expect(normalizeBadgePath('')).toBe('/');
  });

  it('extracts level and slug from a well-formed DAM path', () => {
    expect(
      normalizeBadgePath('/content/dam/gsusa-vtk-redesign/en/badges/junior/automotive/jcr:content/data/master')
    ).toBe('badge/junior/automotive');
  });

  it('throws when the path does not contain a "badges" segment', () => {
    expect(() => normalizeBadgePath('/content/dam/gsusa-vtk-redesign/en/foo/bar')).toThrow(
      'Invalid badge path structure'
    );
  });

  it('throws when "badges" is present but the segment after level is missing', () => {
    expect(() => normalizeBadgePath('/content/dam/gsusa-vtk-redesign/en/badges/junior')).toThrow(
      'Invalid badge path structure'
    );
  });
});

describe('buildAemAwardPath', () => {
  it('builds a doubled-slug path when no level is given (current dev shape)', () => {
    expect(buildAemAwardPath('en', 'true-north-award')).toBe(
      '/content/dam/gsusa-vtk-redesign/en/awards/true-north-award/true-north-award'
    );
  });

  it('builds a path with a level segment when one is given (future foldered shape)', () => {
    expect(buildAemAwardPath('en', 'true-north-award', 'multi')).toBe(
      '/content/dam/gsusa-vtk-redesign/en/awards/multi/true-north-award/true-north-award'
    );
  });

  it('preserves the "es" locale', () => {
    expect(buildAemAwardPath('es', 'bronze-award')).toBe(
      '/content/dam/gsusa-vtk-redesign/es/awards/bronze-award/bronze-award'
    );
  });
});

describe('normalizeAwardPath', () => {
  it('returns "/" for undefined input', () => {
    expect(normalizeAwardPath(undefined)).toBe('/');
  });

  it('returns "/" for empty string', () => {
    expect(normalizeAwardPath('')).toBe('/');
  });

  it('returns a 1-segment route for doubled-slug paths (current dev shape)', () => {
    expect(normalizeAwardPath('/content/dam/gsusa-vtk-redesign/en/awards/true-north-award/true-north-award')).toBe(
      '/en/award/true-north-award'
    );
  });

  it('returns a 2-segment route when a level folder is present (future shape)', () => {
    expect(normalizeAwardPath('/content/dam/gsusa-vtk-redesign/en/awards/junior/silver-award/silver-award')).toBe(
      '/en/award/junior/silver-award'
    );
  });

  it('preserves the "es" locale', () => {
    expect(normalizeAwardPath('/content/dam/gsusa-vtk-redesign/es/awards/bronze-award/bronze-award')).toBe(
      '/es/award/bronze-award'
    );
  });

  it('throws when the path does not match the awards root', () => {
    expect(() => normalizeAwardPath('/some/other/prefix/en/awards/foo/foo')).toThrow('Invalid award path structure');
  });

  it('throws when the locale segment is not two lowercase letters', () => {
    expect(() => normalizeAwardPath('/content/dam/gsusa-vtk-redesign/EN/awards/foo/foo')).toThrow(
      'Invalid award path structure'
    );
  });

  it('throws when the trailing repeated-slug segment is missing', () => {
    expect(() => normalizeAwardPath('/content/dam/gsusa-vtk-redesign/en/awards/foo')).toThrow(
      'Invalid award path structure'
    );
  });
});

describe('normalizeActivityPath', () => {
  it('returns "/" for undefined input', () => {
    expect(normalizeActivityPath(undefined)).toBe('/');
  });

  it('returns "/" for empty string', () => {
    expect(normalizeActivityPath('')).toBe('/');
  });

  it('returns a 2-level slug path when group is present', () => {
    expect(
      normalizeActivityPath(
        '/content/dam/gsusa-vtk-redesign/en/activities/badge/s-z/visit-a-food-bank/visit-a-food-bank'
      )
    ).toBe('/en/activity/badge/s-z/visit-a-food-bank');
  });

  it('returns a 1-level slug path when no group is present', () => {
    expect(normalizeActivityPath('/content/dam/gsusa-vtk-redesign/en/activities/explore/lemon/lemon')).toBe(
      '/en/activity/explore/lemon'
    );
  });

  it('preserves the "es" locale', () => {
    expect(
      normalizeActivityPath(
        '/content/dam/gsusa-vtk-redesign/es/activities/badge/s-z/visit-a-food-bank/visit-a-food-bank'
      )
    ).toBe('/es/activity/badge/s-z/visit-a-food-bank');
  });

  it('throws when the path does not start with the CMS root', () => {
    expect(() => normalizeActivityPath('/some/other/prefix/en/activities/badge/foo/foo')).toThrow(
      'Invalid CMS activity path format'
    );
  });

  it('throws when the locale segment is not two lowercase letters', () => {
    expect(() => normalizeActivityPath('/content/dam/gsusa-vtk-redesign/EN/activities/badge/s-z/foo/foo')).toThrow(
      'Invalid CMS activity path format'
    );
  });

  it('throws when the trailing repeated-slug segment is missing', () => {
    expect(() => normalizeActivityPath('/content/dam/gsusa-vtk-redesign/en/activities/badge/foo')).toThrow(
      'Invalid CMS activity path format'
    );
  });
});

describe('safeNormalizeActivityPath', () => {
  it('returns the normalized route for a valid activity path', () => {
    expect(
      safeNormalizeActivityPath(
        '/content/dam/gsusa-vtk-redesign/en/activities/badge/m-r/play-a-vehicle-matching-game/play-a-vehicle-matching-game'
      )
    ).toBe('/en/activity/badge/m-r/play-a-vehicle-matching-game');
  });

  it('returns undefined for a malformed path instead of throwing', () => {
    expect(safeNormalizeActivityPath('/invalid/path')).toBeUndefined();
  });

  it('returns "/" for an empty path', () => {
    expect(safeNormalizeActivityPath('')).toBe('/');
  });
});
