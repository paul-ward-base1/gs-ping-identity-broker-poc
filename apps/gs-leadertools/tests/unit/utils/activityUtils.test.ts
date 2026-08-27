import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/api', () => ({ envUrl: 'https://aem.example.com/' }));
vi.mock('@/components/BadgePageClient/useBadgePageClient', () => ({
  handleResourceClick: vi.fn(() => vi.fn()),
}));

import { createRelatedBadges, createSupplies, createHandouts, mapActivityData } from '@/utils/activityUtils';
import { ProgramLevel, ProgramLevelEnum, ProgramLevelIds } from '@/types/programLevel';
import { ActivityModel } from '@/types/activity';
import { RelatedBadgeModel } from '@/types/badge';
import { Filter } from '@/types/filter';

const STUB_IMAGE = { path: '/stub-image.png' };

const buildProgramLevel = (id: ProgramLevelIds, name: ProgramLevelEnum): ProgramLevel => ({
  id,
  name,
  backgroundImage: STUB_IMAGE,
});

const mockAemProgramLevels: Filter[] = [
  { id: ProgramLevelIds.DAISY, name: ProgramLevelEnum.DAISY },
  { id: ProgramLevelIds.BROWNIE, name: ProgramLevelEnum.BROWNIE },
  { id: ProgramLevelIds.JUNIOR, name: ProgramLevelEnum.JUNIOR },
  { id: ProgramLevelIds.CADETTE, name: ProgramLevelEnum.CADETTE },
  { id: ProgramLevelIds.SENIOR, name: ProgramLevelEnum.SENIOR },
  { id: ProgramLevelIds.AMBASSADOR, name: ProgramLevelEnum.AMBASSADOR },
];

const mockAemProgramLevelsFull: ProgramLevel[] = mockAemProgramLevels.map(({ id, name }) =>
  buildProgramLevel(id as ProgramLevelIds, name as ProgramLevelEnum)
);

const buildRelatedBadge = (overrides: Partial<RelatedBadgeModel>): RelatedBadgeModel => ({
  badgeId: 'b1',
  badgeName: 'Test Badge',
  path: '/p',
  image: STUB_IMAGE,
  theme: { name: 'Theme' },
  programLevel: buildProgramLevel(ProgramLevelIds.DAISY, ProgramLevelEnum.DAISY),
  ...overrides,
});

const buildActivity = (overrides: Partial<ActivityModel>): ActivityModel => ({
  name: 'Test Activity',
  ...overrides,
});

// ── createRelatedBadges ──────────────────────────────────────────────────────

describe('createRelatedBadges', () => {
  it('returns empty array when given empty badges array', () => {
    expect(createRelatedBadges([], mockAemProgramLevels)).toEqual([]);
  });

  it('maps badge fields to RelatedBadgeProps shape', () => {
    const badge = buildRelatedBadge({
      badgeId: 'badge-1',
      badgeName: 'Nature Badge',
      path: '/content/badges/nature',
      image: { path: '/content/dam/images/nature.png' },
      theme: { name: 'Nature' },
      programLevel: buildProgramLevel(ProgramLevelIds.DAISY, ProgramLevelEnum.DAISY),
    });
    const result = createRelatedBadges([badge], mockAemProgramLevels);
    expect(result).toHaveLength(1);
    expect(result[0].badgeId).toBe('badge-1');
    expect(result[0].badgeName).toBe('Nature Badge');
    expect(result[0].path).toBe('/content/badges/nature');
    expect(result[0].theme).toBe('Nature');
  });

  it('builds image path using buildImagePath (returns /img/... format)', () => {
    const badge = buildRelatedBadge({
      image: { path: '/images/badge.png' },
      programLevel: buildProgramLevel(ProgramLevelIds.BROWNIE, ProgramLevelEnum.BROWNIE),
    });
    const result = createRelatedBadges([badge], mockAemProgramLevels);
    expect(result[0].badgeImage).toBe('/img/images/badge.png');
  });

  it('resolves programLevel.id by looking up name in aemProgramLevels', () => {
    const badge = buildRelatedBadge({
      programLevel: buildProgramLevel(ProgramLevelIds.JUNIOR, ProgramLevelEnum.JUNIOR),
    });
    const result = createRelatedBadges([badge], mockAemProgramLevels);
    expect(result[0].programLevel.id).toBe(ProgramLevelIds.JUNIOR);
    expect(result[0].programLevel.level).toBe(ProgramLevelEnum.JUNIOR);
  });

  it('uses empty string for theme when badge theme is absent', () => {
    const badge = buildRelatedBadge({ theme: undefined });
    const result = createRelatedBadges([badge], mockAemProgramLevels);
    expect(result[0].theme).toBe('');
  });
});

// ── createSupplies ───────────────────────────────────────────────────────────

describe('createSupplies', () => {
  const translate = (key: string) => `translated:${key}`;

  it('returns empty array when activity has no materials', () => {
    const activity = buildActivity({ name: 'Test Activity' });
    expect(createSupplies(activity, translate)).toEqual([]);
  });

  it('maps each material to a supply with translated unit', () => {
    const activity = buildActivity({
      materials: [{ label: 'Rope', quantity: 2, optional: false, unit: 'Per girl' }],
    });
    const result = createSupplies(activity, translate);
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('supply');
    expect(result[0].label).toBe('Rope');
    expect(result[0].unit).toBe('translated:activityDetailPage.sideRail.suppliesAndHandouts.unit.Per girl');
  });

  it('sets unit to undefined when material has no unit', () => {
    const activity = buildActivity({
      materials: [{ label: 'String', quantity: 1, optional: false, unit: undefined }],
    });
    const result = createSupplies(activity, translate);
    expect(result[0].unit).toBeUndefined();
  });

  it('preserves all material fields on the returned supply', () => {
    const material = { label: 'Scissors', quantity: 5, optional: true, unit: 'Per group' };
    const activity = buildActivity({ materials: [material] });
    const result = createSupplies(activity, translate);
    expect(result[0].label).toBe('Scissors');
    expect(result[0].quantity).toBe(5);
    expect(result[0].optional).toBe(true);
  });
});

// ── createHandouts ───────────────────────────────────────────────────────────

describe('createHandouts', () => {
  const translate = (key: string) => `translated:${key}`;

  it('returns an empty array when activity has no relatedResources', () => {
    const activity = buildActivity({ name: 'Test' });
    expect(createHandouts(activity, translate)).toEqual([]);
  });

  it('maps a resource with a file path to a handout using the /img/... path', () => {
    const activity = buildActivity({
      relatedResources: [
        {
          title: 'Guide',
          file: { path: '/content/dam/guide.pdf', url: 'https://external.com/guide.pdf' },
          quantity: 1,
          unit: 'Per girl',
        },
      ],
    });
    const result = createHandouts(activity, translate);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Guide');
    expect(result[0].url).toBe('/img/content/dam/guide.pdf');
  });

  it('uses external URL for url when resource has no file path', () => {
    const activity = buildActivity({
      relatedResources: [
        {
          title: 'External Guide',
          file: { url: 'https://external.com/guide.pdf' },
          quantity: 1,
          unit: 'Per girl',
        },
      ],
    });
    const result = createHandouts(activity, translate);
    expect(result[0].url).toBe('https://external.com/guide.pdf');
  });

  it('deduplicates resources with the same file URL', () => {
    const activity = buildActivity({
      relatedResources: [
        { title: 'Guide A', file: { url: 'https://example.com/same.pdf' }, quantity: 1, unit: 'Per girl' },
        { title: 'Guide B', file: { url: 'https://example.com/same.pdf' }, quantity: 1, unit: 'Per girl' },
      ],
    });
    const result = createHandouts(activity, translate);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Guide A');
  });

  it('keeps resources with distinct file URLs', () => {
    const activity = buildActivity({
      relatedResources: [
        { title: 'Guide A', file: { url: 'https://example.com/a.pdf' }, quantity: 1, unit: 'Per girl' },
        { title: 'Guide B', file: { url: 'https://example.com/b.pdf' }, quantity: 1, unit: 'Per girl' },
      ],
    });
    const result = createHandouts(activity, translate);
    expect(result).toHaveLength(2);
  });
});

// ── mapActivityData ──────────────────────────────────────────────────────────

describe('mapActivityData', () => {
  it('maps basic activity fields', () => {
    const activity = buildActivity({
      name: 'Hiking Trip',
      timeRange: '30-45 minutes',
      description: { plaintext: 'Go for a hike.' },
      programLevel: [buildProgramLevel(ProgramLevelIds.DAISY, ProgramLevelEnum.DAISY)],
    });
    const result = mapActivityData(activity, mockAemProgramLevelsFull);
    expect(result.name).toBe('Hiking Trip');
    expect(result.timeRange).toBe('30-45 minutes');
    expect(result.description).toBe('Go for a hike.');
  });

  it('sets hasAllLevels true when activity program levels match all AEM levels', () => {
    const activity = buildActivity({
      name: 'All Levels Activity',
      programLevel: mockAemProgramLevelsFull,
    });
    const result = mapActivityData(activity, mockAemProgramLevelsFull);
    expect(result.hasAllLevels).toBe(true);
  });

  it('sets hasAllLevels false when activity has fewer program levels than AEM total', () => {
    const activity = buildActivity({
      name: 'Single Level Activity',
      programLevel: [buildProgramLevel(ProgramLevelIds.DAISY, ProgramLevelEnum.DAISY)],
    });
    const result = mapActivityData(activity, mockAemProgramLevelsFull);
    expect(result.hasAllLevels).toBe(false);
  });

  it('assigns ProgramLevelIds.ALL to all tags when hasAllLevels is true', () => {
    const activity = buildActivity({
      name: 'All Levels',
      programLevel: mockAemProgramLevelsFull,
    });
    const result = mapActivityData(activity, mockAemProgramLevelsFull);
    result.tags?.forEach(tag => {
      expect(tag.id).toBe(ProgramLevelIds.ALL);
    });
  });

  it('resolves tag id from aemProgramLevels when single level', () => {
    const activity = buildActivity({
      name: 'Brownie Activity',
      programLevel: [buildProgramLevel(ProgramLevelIds.BROWNIE, ProgramLevelEnum.BROWNIE)],
    });
    const result = mapActivityData(activity, mockAemProgramLevelsFull);
    expect(result.tags?.[0].id).toBe(ProgramLevelIds.BROWNIE);
    expect(result.tags?.[0].type).toBe('content');
  });

  it('returns empty tags array when activity has no programLevel', () => {
    const activity = buildActivity({ name: 'No Level Activity' });
    const result = mapActivityData(activity, mockAemProgramLevelsFull);
    expect(result.tags).toEqual([]);
  });
});
