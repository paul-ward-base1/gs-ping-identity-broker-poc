import { describe, it, expect, vi, beforeEach } from 'vitest';

import type { Locale } from '@/lib/locale';
import type { ProgramLevelFilter } from '@/types/filter';

// fetchAwards is the only external dependency of the loader; mock it so each test
// drives the raw AEM award payload the loader transforms/filters.
const { fetchAwardsMock } = vi.hoisted(() => ({ fetchAwardsMock: vi.fn() }));

vi.mock('@/apis/awards', () => ({ fetchAwards: fetchAwardsMock }));

import { AwardLoader } from '@/lib/search/aws/indexer/source/award/awardLoader';

// The loader only reads name + order off each filter, so the heavier
// ProgramLevelFilter shape is cast away for these fixtures.
const programLevelFilters = new Map<string, ProgramLevelFilter>([
  ['Junior', { id: 'junior', name: 'Junior', order: 3 } as ProgramLevelFilter],
  ['Cadette', { id: 'cadette', name: 'Cadette', order: 4 } as ProgramLevelFilter],
]);

// A minimal award that passes every mandatory-field / non-empty-description check.
const validAward = () => ({
  badgeId: 'AW-1',
  badgeName: 'Sample Award',
  path: '/content/dam/gsusa-vtk-redesign/en/awards/junior/sample-award/sample-award',
  description: { html: '<p>Do it</p>', plaintext: 'Do it' },
  image: { path: '/img/sample.png' },
});

const loadDocuments = (awards: object[]) => {
  fetchAwardsMock.mockResolvedValue(awards);
  return new AwardLoader(programLevelFilters).loadData('en' as Locale);
};

describe('AwardLoader.loadData', () => {
  beforeEach(() => {
    fetchAwardsMock.mockReset();
  });

  it('maps a complete award into an AwardDocument', async () => {
    const award = {
      badgeId: 'Junior-TrueNorth-2026',
      badgeName: 'Junior True North Award',
      path: '/content/dam/gsusa-vtk-redesign/en/awards/junior/true-north-award/junior-true-north-award',
      description: { html: '<p>Earn it!</p>', plaintext: 'Earn it!' },
      image: { path: '/img/jtn.png', url: 'http://example/jtn.png' },
      badgeFamily: { path: '/static/badge-families/true-north-award', name: 'True North Award' },
      programLevel: [{ name: 'Junior' }],
      theme: { path: '/static/themes/balanced-living', name: 'Balanced Living' },
      keywords: ['gsusa-vtk-redesign:keyword/a/leadership', 'not-a-keyword-tag'],
    };

    const [doc] = await loadDocuments([award]);

    expect(doc).toEqual({
      id: 'Junior-TrueNorth-2026',
      name: 'Junior True North Award',
      path: '/content/dam/gsusa-vtk-redesign/en/awards/junior/true-north-award/junior-true-north-award',
      description: 'Earn it!',
      image: '/img/jtn.png',
      keywords: ['leadership'],
      family: 'True North Award',
      programLevels: [{ name: 'Junior', order: 3 }],
      theme: 'Balanced Living',
    });
  });

  it('drops awards missing any mandatory field', async () => {
    const docs = await loadDocuments([
      validAward(),
      { ...validAward(), badgeName: undefined }, // no name
      { ...validAward(), path: '' }, // empty path
      { ...validAward(), image: undefined }, // no image
    ]);

    expect(docs).toHaveLength(1);
    expect(docs[0].id).toBe('AW-1');
  });

  it('drops awards whose description has no plaintext', async () => {
    const docs = await loadDocuments([
      validAward(),
      { ...validAward(), description: { html: '<p>x</p>', plaintext: '' } }, // empty plaintext
      { ...validAward(), description: { html: '<p>x</p>' } }, // missing plaintext
    ]);

    expect(docs).toHaveLength(1);
    expect(docs[0].id).toBe('AW-1');
  });

  it('extracts keyword tags that match the pattern and drops the rest', async () => {
    const [doc] = await loadDocuments([
      {
        ...validAward(),
        keywords: ['gsusa-vtk-redesign:keyword/a/leadership', 'gsusa-vtk-redesign:keyword/b/teamwork', 'garbage'],
      },
    ]);

    expect(doc.keywords).toEqual(['leadership', 'teamwork']);
  });

  it('resolves program levels via the filter map and drops unknown names', async () => {
    const [doc] = await loadDocuments([
      { ...validAward(), programLevel: [{ name: 'Junior' }, { name: 'Cadette' }, { name: 'Daisy' }] },
    ]);

    // Daisy is absent from the filter map, so it is dropped.
    expect(doc.programLevels).toEqual([
      { name: 'Junior', order: 3 },
      { name: 'Cadette', order: 4 },
    ]);
  });

  it('leaves optional fields undefined when the source omits them', async () => {
    const [doc] = await loadDocuments([validAward()]);

    expect(doc).toMatchObject({ id: 'AW-1', name: 'Sample Award', description: 'Do it', image: '/img/sample.png' });
    expect(doc.keywords).toBeUndefined();
    expect(doc.family).toBeUndefined();
    expect(doc.programLevels).toBeUndefined();
    expect(doc.theme).toBeUndefined();
  });
});
