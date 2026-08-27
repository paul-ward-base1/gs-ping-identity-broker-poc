import { ProgramLevel } from '@/types/programLevel';
import { Filter } from '@/types/filter';
import { RelatedBadgeProps } from '@/components/RelatedBadge/types';
import { buildImagePath } from '@/utils/buildImagePath';
import { resolveProgramLevelId } from '@/utils/programLevelUtils';

/** Normalized input for any list row `RelatedBadge` renders (badges, awards, etc). */
export interface RelatedBadgeInput {
  id: string;
  name: string;
  path: string;
  /** Pre-resolved client route; required for non-`/badges/` paths (e.g. awards). */
  hrefOverride?: string;
  imagePath?: string;
  programLevel: ProgramLevel;
  additionalProgramLevels?: ProgramLevel[];
  theme?: string;
}

export const toRelatedBadgeProps = (
  input: RelatedBadgeInput,
  aemProgramLevels: Filter[] | undefined,
  devEnv?: boolean
): RelatedBadgeProps => ({
  badgeId: input.id,
  badgeName: input.name,
  path: input.path,
  hrefOverride: input.hrefOverride,
  badgeImage: buildImagePath(input.imagePath),
  programLevel: {
    id: resolveProgramLevelId(aemProgramLevels, input.programLevel?.name),
    level: input.programLevel?.name ?? '',
  },
  additionalProgramLevels: input.additionalProgramLevels?.map(level => ({
    id: resolveProgramLevelId(aemProgramLevels, level.name),
    level: level.name,
  })),
  theme: input.theme ?? '',
  devEnv,
});
