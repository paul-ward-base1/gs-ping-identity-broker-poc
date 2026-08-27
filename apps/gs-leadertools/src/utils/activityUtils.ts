import { ActivityModel } from '@/types/activity';
import { ActivityDetailsProp } from '@/components/BadgePageClient/ActivityPreview/types';
import { ProgramLevel, ProgramLevelEnum, ProgramLevelIds } from '@/types/programLevel';
import { TagProps } from '@/components/Tag/types';
import { HandoutCardProps } from '@/components/Handouts/types';
import { RelatedBadgeModel } from '@/types/badge';
import { RelatedBadgeProps } from '@/components/RelatedBadge/types';
import { buildImagePath } from '@/utils/buildImagePath';
import { createResourceHandouts } from '@/utils/createResourceHandouts';
import { Filter } from '@/types/filter';
import { TranslateFn } from '@/types/i18n';
import { SideRailBoxType, SideRailSupplyItem } from '@/components/SideRailBox/types';
import { resolveProgramLevelId } from '@/utils/programLevelUtils';

export const createRelatedBadges = (badges: RelatedBadgeModel[], aemProgramLevels: Filter[]) =>
  badges.map(
    (item: RelatedBadgeModel): RelatedBadgeProps => ({
      badgeId: item.badgeId,
      badgeName: item.badgeName,
      path: item.path,
      badgeImage: buildImagePath(item?.image?.path),
      programLevel: {
        id: resolveProgramLevelId(aemProgramLevels, item?.programLevel?.name),
        level: item.programLevel.name,
      },
      theme: item.theme?.name ?? '',
    })
  );

export const createSupplies = (activityDetails: ActivityModel, translate: TranslateFn): SideRailSupplyItem[] =>
  activityDetails?.materials?.map(material => ({
    ...material,
    type: SideRailBoxType.SUPPLY,
    unit: material.unit && translate(`activityDetailPage.sideRail.suppliesAndHandouts.unit.${material.unit}`),
  })) ?? [];

// Previously a near-duplicate of that helper with its own unit lookup.
export const createHandouts = (activity: ActivityModel, translate: TranslateFn): HandoutCardProps[] =>
  createResourceHandouts(activity?.relatedResources, translate);

export const mapActivityData = (
  activityModel: ActivityModel,
  aemProgramLevels: ProgramLevel[]
): ActivityDetailsProp => {
  const { name, timeRange, description } = activityModel;
  const activityDescription = description?.plaintext;
  const hasAllLevels = activityModel.programLevel?.length === aemProgramLevels.length;
  const tags =
    activityModel.programLevel?.map(
      (level: ProgramLevel): TagProps => ({
        level: level.name as ProgramLevelEnum,
        id: hasAllLevels
          ? ProgramLevelIds.ALL
          : resolveProgramLevelId(aemProgramLevels, level.name, ProgramLevelIds.MULTI),
        type: 'content',
      })
    ) ?? [];

  return {
    name,
    timeRange,
    description: activityDescription,
    tags,
    hasAllLevels,
  };
};
