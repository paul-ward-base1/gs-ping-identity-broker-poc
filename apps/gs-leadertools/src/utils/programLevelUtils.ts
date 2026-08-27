import { ProgramLevelIds } from '@/types/programLevel';
import { Filter } from '@/types/filter';

export const allLevelIds: ProgramLevelIds[] = [
  ProgramLevelIds.JUNIOR,
  ProgramLevelIds.CADETTE,
  ProgramLevelIds.BROWNIE,
  ProgramLevelIds.DAISY,
  ProgramLevelIds.AMBASSADOR,
  ProgramLevelIds.SENIOR,
];

export const checkAllLevels = (programLevelIds: (string | undefined)[] | undefined): boolean => {
  return allLevelIds.every(id => programLevelIds?.includes(id));
};

const PROGRAM_LEVEL_ID_SET = new Set<string>(Object.values(ProgramLevelIds));

const asProgramLevelId = (value: string | undefined, fallback: ProgramLevelIds): ProgramLevelIds =>
  value && PROGRAM_LEVEL_ID_SET.has(value) ? (value as ProgramLevelIds) : fallback;

/**
 * Look up the canonical `ProgramLevelIds` for a given program-level name.
 * Falls back to `fallbackId` (default: `ProgramLevelIds.MULTI`) if the name
 * is not found in `aemLevels` or the resolved id is not a known enum value.
 */
export const resolveProgramLevelId = (
  aemLevels: Filter[] | undefined,
  name: string | undefined,
  fallbackId: ProgramLevelIds = ProgramLevelIds.MULTI,
): ProgramLevelIds => {
  const matchId = aemLevels?.find(level => level.name === name)?.id;
  return asProgramLevelId(matchId, fallbackId);
};
