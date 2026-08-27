import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createResourceHandouts } from '@/utils/createResourceHandouts';
import { FileModel } from '@/types/file';

describe('createResourceHandouts', () => {
  beforeEach(() => {
    vi.stubEnv('AEM_DAM_PATH', 'content/dam/gsusa-vtk-redesign');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns an empty array when resources is undefined', () => {
    expect(createResourceHandouts(undefined)).toEqual([]);
  });

  it('returns an empty array when resources is empty', () => {
    expect(createResourceHandouts([])).toEqual([]);
  });

  it('skips resources that have no file.url', () => {
    const resources: FileModel[] = [
      { title: 'Has URL', file: { url: 'https://example.com/a.pdf' } },
      { title: 'No URL', file: { url: undefined as unknown as string } },
      { title: 'No file at all' },
    ];
    expect(createResourceHandouts(resources)).toHaveLength(1);
  });

  it('dedupes resources sharing the same file.url', () => {
    const resources: FileModel[] = [
      { title: 'First', file: { url: 'https://example.com/dup.pdf' } },
      { title: 'Duplicate', file: { url: 'https://example.com/dup.pdf' } },
      { title: 'Different', file: { url: 'https://example.com/other.pdf' } },
    ];
    const result = createResourceHandouts(resources);
    expect(result).toHaveLength(2);
    expect(result.map(r => r.title)).toEqual(['First', 'Different']);
  });

  it('produces an aria-label of "Download <title>"', () => {
    const resources: FileModel[] = [{ title: 'Courage Plan', file: { url: 'https://example.com/courage.pdf' } }];
    expect(createResourceHandouts(resources)[0]).toMatchObject({
      title: 'Courage Plan',
      ariaLabel: 'Download Courage Plan',
    });
  });

  it('resolves the url via buildImagePath when file.path is present (preferring AEM proxy over raw url)', () => {
    const resources: FileModel[] = [
      {
        title: 'With DAM path',
        file: {
          url: 'https://example.com/should-be-overridden.pdf',
          path: '/content/dam/gsusa-vtk-redesign/common/media/handouts/courage-plan.pdf',
        },
      },
    ];
    expect(createResourceHandouts(resources)[0].url).toBe('/img/common/media/handouts/courage-plan.pdf');
  });

  it('falls back to file.url when no file.path is present', () => {
    const resources: FileModel[] = [{ title: 'Raw URL only', file: { url: 'https://example.com/raw.pdf' } }];
    expect(createResourceHandouts(resources)[0].url).toBe('https://example.com/raw.pdf');
  });

  it('uses the resolved url as the card id', () => {
    const resources: FileModel[] = [{ title: 'One', file: { url: 'https://example.com/one.pdf' } }];
    expect(createResourceHandouts(resources)[0].id).toBe('https://example.com/one.pdf');
  });

  it('returns an empty title string when none is provided', () => {
    const resources: FileModel[] = [{ file: { url: 'https://example.com/no-title.pdf' } }];
    expect(createResourceHandouts(resources)[0]).toMatchObject({
      title: '',
      ariaLabel: 'Download ',
    });
  });

  it('forwards quantity + raw unit when no translate function is provided', () => {
    const resources: FileModel[] = [
      {
        title: 'Worksheet',
        quantity: 1,
        unit: 'Per girl',
        thumbnail: { path: '/somewhere.png' },
        file: { url: 'https://example.com/worksheet.pdf' },
      },
    ];
    const card = createResourceHandouts(resources)[0];
    expect(card).toEqual({
      id: 'https://example.com/worksheet.pdf',
      title: 'Worksheet',
      ariaLabel: 'Download Worksheet',
      url: 'https://example.com/worksheet.pdf',
      quantity: 1,
      unit: 'Per girl',
    });
  });

  it('translates the unit via the activity dictionary key when translate is provided', () => {
    const resources: FileModel[] = [
      {
        title: 'Worksheet',
        quantity: 2,
        unit: 'Per group',
        file: { url: 'https://example.com/worksheet.pdf' },
      },
    ];
    const translate = vi.fn((key: string) => `T:${key}`);
    const card = createResourceHandouts(resources, translate)[0];
    expect(translate).toHaveBeenCalledWith(`activityDetailPage.sideRail.suppliesAndHandouts.unit.Per group`);
    expect(card.unit).toBe(`T:activityDetailPage.sideRail.suppliesAndHandouts.unit.Per group`);
    expect(card.quantity).toBe(2);
  });
});
