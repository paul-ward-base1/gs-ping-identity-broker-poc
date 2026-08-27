import type { TFunction } from 'i18next';
import { ActivityModel } from '@/types/activity';
import { ContentModulesTypes } from '@/types/contentModules';
import { ParsedContentModule } from './types';
import { SectionItemProps, SideRailItemsProps } from '@/components/SideRail/types';
import { SideRailBoxType } from '@/components/SideRailBox/types';
import { Filter, FilterModel } from '@/types/filter';
import { ProgramLevelEnum, ProgramLevelIds } from '@/types/programLevel';
import { TagProps } from '@/components/Tag/types';
import { HandoutCardProps } from '@/components/Handouts/types';
import { checkAllLevels } from '@/utils/programLevelUtils';
import { createHandouts, createRelatedBadges, createSupplies } from '@/utils/activityUtils';

const buildSideRailBoxData = (
  t: TFunction,
  activity: ActivityModel,
  aemProgramLevels: Filter[],
  handouts: HandoutCardProps[]
): SideRailItemsProps[] => {
  const boxData: SideRailItemsProps[] = [];

  if (activity?.timeRange) {
    boxData.push({
      id: 'activity-time-range-box',
      icon: 'time',
      title: t('activityDetailPage.sideRail.time.header'),
      items: [{ type: SideRailBoxType.SECTION, value: activity?.timeRange }],
      type: SideRailBoxType.TIME,
    });
  }

  if (activity?.relatedResources?.length || activity?.materials?.length) {
    const supplies = createSupplies(activity, t);
    const handoutsBoxItems = (
      handouts.length > 0
        ? [
            ...supplies,
            {
              header: t('activityDetailPage.sideRail.suppliesAndHandouts.handouts.header'),
              handouts,
              type: SideRailBoxType.HANDOUT_ITEMS,
            },
          ]
        : supplies
    ) as NonNullable<SideRailItemsProps['items']>;

    boxData.push({
      id: 'activity-handouts-box',
      icon: 'paintBrush',
      title: t('activityDetailPage.sideRail.suppliesAndHandouts.header'),
      items: handoutsBoxItems,
      type: SideRailBoxType.HANDOUTS,
      count: supplies.length + handouts.length,
    });
  }

  if (activity?.badgeConnection?.length) {
    const relatedBadgeItems: (SectionItemProps | unknown)[] = [
      { type: 'section', value: t('activityDetailPage.sideRail.associatedBadges.text') } as SectionItemProps,
      ...createRelatedBadges(activity.badgeConnection, aemProgramLevels),
    ];
    boxData.push({
      id: 'activity-associated-badges-box',
      icon: 'sealCheck',
      title: t('activityDetailPage.sideRail.associatedBadges.header'),
      items: relatedBadgeItems as SideRailItemsProps['items'],
      type: SideRailBoxType.ASSOCIATED_BADGES,
      count: activity?.badgeConnection?.length,
    });
  }

  return boxData;
};

const buildActivityContent = (activity: ActivityModel, programLevel: TagProps): ParsedContentModule[] => {
  if (!activity.content) return [];
  return activity.content.reduce<ParsedContentModule[]>((acc, el, index) => {
    switch (el.type) {
      case ContentModulesTypes.RichTextModel: {
        const { path, type, content } = el;
        acc.push({ id: index, path, type, content: content.html });
        break;
      }
      case ContentModulesTypes.AccordionModel: {
        const { path, type, header, label, items } = el;
        acc.push({
          id: index,
          path,
          type,
          title: header,
          header: label,
          level: programLevel.level ?? '',
          items: items?.map(item => ({ value: item.html })),
        });
        break;
      }
      case ContentModulesTypes.VideoModel: {
        const { path, type, title, videoId, platform } = el;
        acc.push({ id: index, path, type, title, videoId, platform });
        break;
      }
      case ContentModulesTypes.ImageModel: {
        const { path, type, label, file } = el;
        acc.push({ id: index, path, type, label, file });
        break;
      }
      default:
        break;
    }
    return acc;
  }, []);
};

export const buildActivityPdfData = (activity: ActivityModel, filters: FilterModel, translate: TFunction) => {
  const aemProgramLevels = filters?.programLevels ?? [];

  const hasAllLevels = checkAllLevels(
    activity?.programLevel?.map(l => aemProgramLevels.find((el: Filter) => el.name === l.name)?.id ?? l.id)
  );

  const matchedLevel = aemProgramLevels.find((el: Filter) => el.name === activity?.programLevel?.[0]?.name);
  const programLevel: TagProps =
    activity?.programLevel && activity.programLevel.length > 1
      ? { id: ProgramLevelIds.MULTI, level: ProgramLevelEnum.MULTI }
      : matchedLevel
        ? ({ id: matchedLevel.id as ProgramLevelIds, level: matchedLevel.name } as TagProps)
        : { id: ProgramLevelIds.ALL, level: translate('global.programLevel.allProgramLevels.label') };

  const programLevels: TagProps[] = hasAllLevels
    ? [{ id: ProgramLevelIds.ALL, level: translate('global.programLevel.allProgramLevels.label') }]
    : (activity?.programLevel?.map(level => ({
        id: (aemProgramLevels.find((el: Filter) => el.name === level.name)?.id ?? level.id) as ProgramLevelIds,
        level: level.name,
      })) ?? []);

  const theme =
    activity.badgeConnection
      ?.map(c => c.theme?.name)
      .filter(Boolean)
      .join(', ') ?? '';

  const handouts = createHandouts(activity, translate) as HandoutCardProps[];

  return {
    sideRailBoxItems: buildSideRailBoxData(translate, activity, aemProgramLevels, handouts),
    handouts,
    donors: activity.donors ?? [],
    programLevel,
    programLevels,
    theme,
    activityContent: buildActivityContent(activity, programLevel),
  };
};
