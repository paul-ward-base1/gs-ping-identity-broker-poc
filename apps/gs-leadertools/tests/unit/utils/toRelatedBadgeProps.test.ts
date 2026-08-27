import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { toRelatedBadgeProps } from '@/utils/toRelatedBadgeProps';
import { ProgramLevelEnum, ProgramLevelIds, ProgramLevel } from '@/types/programLevel';
import { Filter } from '@/types/filter';

const mkLevel = (name: string): ProgramLevel => ({ name, id: '', backgroundImage: { path: '' } });

const aemLevels: Filter[] = [
  { id: ProgramLevelIds.JUNIOR, name: ProgramLevelEnum.JUNIOR },
  { id: ProgramLevelIds.SENIOR, name: ProgramLevelEnum.SENIOR },
  { id: ProgramLevelIds.CADETTE, name: ProgramLevelEnum.CADETTE },
  { id: ProgramLevelIds.AMBASSADOR, name: ProgramLevelEnum.AMBASSADOR },
];

describe('toRelatedBadgeProps', () => {
  beforeEach(() => {
    vi.stubEnv('AEM_DAM_PATH', 'content/dam/gsusa-vtk-redesign');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('maps basic identity fields straight through', () => {
    const result = toRelatedBadgeProps(
      {
        id: 'bronze-cadette',
        name: 'Bronze Award',
        path: '/some/path',
        programLevel: mkLevel(ProgramLevelEnum.CADETTE),
        theme: 'Highest Awards',
      },
      aemLevels
    );
    expect(result.badgeId).toBe('bronze-cadette');
    expect(result.badgeName).toBe('Bronze Award');
    expect(result.path).toBe('/some/path');
    expect(result.theme).toBe('Highest Awards');
  });

  it('passes hrefOverride through unchanged', () => {
    const result = toRelatedBadgeProps(
      {
        id: 'x',
        name: 'x',
        path: '/x',
        hrefOverride: '/en/award/true-north-award',
        programLevel: mkLevel(ProgramLevelEnum.JUNIOR),
      },
      aemLevels
    );
    expect(result.hrefOverride).toBe('/en/award/true-north-award');
  });

  it('routes imagePath through buildImagePath', () => {
    const result = toRelatedBadgeProps(
      {
        id: 'x',
        name: 'x',
        path: '/x',
        imagePath: '/content/dam/gsusa-vtk-redesign/common/media/images/badge-images/animal-habitats.png',
        programLevel: mkLevel(ProgramLevelEnum.JUNIOR),
      },
      aemLevels
    );
    expect(result.badgeImage).toBe('/img/common/media/images/badge-images/animal-habitats.png');
  });

  it('returns empty badgeImage when no imagePath is provided', () => {
    const result = toRelatedBadgeProps(
      { id: 'x', name: 'x', path: '/x', programLevel: mkLevel(ProgramLevelEnum.JUNIOR) },
      aemLevels
    );
    expect(result.badgeImage).toBe('');
  });

  it('resolves programLevel.id via aemLevels lookup', () => {
    const result = toRelatedBadgeProps(
      { id: 'x', name: 'x', path: '/x', programLevel: mkLevel(ProgramLevelEnum.SENIOR) },
      aemLevels
    );
    expect(result.programLevel.id).toBe(ProgramLevelIds.SENIOR);
    expect(result.programLevel.level).toBe(ProgramLevelEnum.SENIOR);
  });

  it('falls back programLevel.id to MULTI when aem dictionary has no match', () => {
    const result = toRelatedBadgeProps({ id: 'x', name: 'x', path: '/x', programLevel: mkLevel('Unknown') }, aemLevels);
    expect(result.programLevel.id).toBe(ProgramLevelIds.MULTI);
  });

  it('maps additionalProgramLevels in order, resolving each id', () => {
    const result = toRelatedBadgeProps(
      {
        id: 'x',
        name: 'x',
        path: '/x',
        programLevel: mkLevel(ProgramLevelEnum.SENIOR),
        additionalProgramLevels: [mkLevel(ProgramLevelEnum.AMBASSADOR)],
      },
      aemLevels
    );
    expect(result.additionalProgramLevels).toEqual([
      { id: ProgramLevelIds.AMBASSADOR, level: ProgramLevelEnum.AMBASSADOR },
    ]);
  });

  it('returns additionalProgramLevels as undefined when none provided', () => {
    const result = toRelatedBadgeProps(
      { id: 'x', name: 'x', path: '/x', programLevel: mkLevel(ProgramLevelEnum.JUNIOR) },
      aemLevels
    );
    expect(result.additionalProgramLevels).toBeUndefined();
  });

  it('defaults theme to empty string when omitted', () => {
    const result = toRelatedBadgeProps(
      { id: 'x', name: 'x', path: '/x', programLevel: mkLevel(ProgramLevelEnum.JUNIOR) },
      aemLevels
    );
    expect(result.theme).toBe('');
  });

  it('propagates the devEnv flag', () => {
    const result = toRelatedBadgeProps(
      { id: 'x', name: 'x', path: '/x', programLevel: mkLevel(ProgramLevelEnum.JUNIOR) },
      aemLevels,
      true
    );
    expect(result.devEnv).toBe(true);
  });

  it('handles undefined aemLevels by falling back to MULTI', () => {
    const result = toRelatedBadgeProps(
      { id: 'x', name: 'x', path: '/x', programLevel: mkLevel(ProgramLevelEnum.JUNIOR) },
      undefined
    );
    expect(result.programLevel.id).toBe(ProgramLevelIds.MULTI);
  });
});
