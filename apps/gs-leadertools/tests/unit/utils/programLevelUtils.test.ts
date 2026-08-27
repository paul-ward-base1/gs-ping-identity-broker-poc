import { describe, it, expect } from 'vitest';
import { checkAllLevels, allLevelIds, resolveProgramLevelId } from '@/utils/programLevelUtils';
import { ProgramLevelEnum, ProgramLevelIds } from '@/types/programLevel';

describe('checkAllLevels', () => {
  it('returns true when all six program level ids are present', () => {
    const all = [
      ProgramLevelIds.JUNIOR,
      ProgramLevelIds.CADETTE,
      ProgramLevelIds.BROWNIE,
      ProgramLevelIds.DAISY,
      ProgramLevelIds.AMBASSADOR,
      ProgramLevelIds.SENIOR,
    ];
    expect(checkAllLevels(all)).toBe(true);
  });

  it('returns false when only some level ids are present', () => {
    expect(checkAllLevels([ProgramLevelIds.DAISY, ProgramLevelIds.BROWNIE])).toBe(false);
  });

  it('returns false when undefined is passed', () => {
    expect(checkAllLevels(undefined)).toBe(false);
  });

  it('returns false for empty array', () => {
    expect(checkAllLevels([])).toBe(false);
  });

  it('returns true when all level ids are present plus extras', () => {
    const withExtra = [...allLevelIds, 'Extra Level'];
    expect(checkAllLevels(withExtra)).toBe(true);
  });
});

describe('resolveProgramLevelId', () => {
  const aemLevels = [
    { id: ProgramLevelIds.DAISY, name: ProgramLevelEnum.DAISY },
    { id: ProgramLevelIds.BROWNIE, name: ProgramLevelEnum.BROWNIE },
  ];

  it('returns the matching ProgramLevelIds when the name is found', () => {
    expect(resolveProgramLevelId(aemLevels, ProgramLevelEnum.DAISY)).toBe(ProgramLevelIds.DAISY);
  });

  it('falls back to MULTI by default when name is not found', () => {
    expect(resolveProgramLevelId(aemLevels, 'Unknown')).toBe(ProgramLevelIds.MULTI);
  });

  it('uses the provided fallback when name is not found', () => {
    expect(resolveProgramLevelId(aemLevels, 'Unknown', ProgramLevelIds.ALL)).toBe(ProgramLevelIds.ALL);
  });

  it('falls back when the matched id is not a known ProgramLevelIds value', () => {
    const aemLevelsWithBadId = [{ id: 'not-a-real-id', name: 'Foo' }];
    expect(resolveProgramLevelId(aemLevelsWithBadId, 'Foo', ProgramLevelIds.MULTI)).toBe(ProgramLevelIds.MULTI);
  });

  it('returns the fallback when aemLevels is undefined', () => {
    expect(resolveProgramLevelId(undefined, ProgramLevelEnum.DAISY)).toBe(ProgramLevelIds.MULTI);
  });
});
