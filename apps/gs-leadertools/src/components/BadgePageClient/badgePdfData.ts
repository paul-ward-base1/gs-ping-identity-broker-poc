import { BadgeModel, RelatedBadgeModel } from '@/types/badge';
import { ProgramLevel, ProgramLevelEnum, ProgramLevelIds } from '@/types/programLevel';
import { ActivityModel } from '@/types/activity';
import { Filter, FilterModel } from '@/types/filter';
import { TagProps } from '@/components/Tag/types';
import { AccordionItemProps } from '@/components/AccordionItem/types';
import { RelatedBadgeProps } from '@/components/RelatedBadge/types';
import { SectionItemProps, SideRailItemsProps } from '@/components/SideRail/types';
import { SideRailBoxType } from '@/components/SideRailBox/types';
import { HandoutCardProps } from '@/components/Handouts/types';
import { createResourceHandouts } from '@/utils/createResourceHandouts';
import { StepModel } from '@/types/step';
import { buildImagePath } from '@/utils/buildImagePath';
import { checkAllLevels, resolveProgramLevelId } from '@/utils/programLevelUtils';
import { parseContentModule } from '@/components/AwardPageClient/awardData';
import { ParsedContentModule } from '@/components/ActivityPageClient/types';
import { safeNormalizeActivityPath } from '@/lib/aemContext';
import { BadgeStepClientProps } from './types';

type Translate = (key: string, options?: Record<string, unknown>) => string;
type ActivityClickFactory = (path: string) => () => void;

export const createBadgeHandouts = (badgeDetails: BadgeModel, translate?: Translate): HandoutCardProps[] =>
  createResourceHandouts(badgeDetails.relatedResources, translate);

export const createActivityAccordionItem = (
  activity: ActivityModel,
  translate: Translate,
  onActivitySelection: ActivityClickFactory,
  aemFilters: FilterModel
): AccordionItemProps => {
  const hasAllLevels = checkAllLevels(
    activity.programLevel?.map(
      (l: ProgramLevel) => aemFilters?.programLevels?.find((el: Filter) => el.name === l.name)?.id ?? l.id
    )
  );

  const activityUrl = safeNormalizeActivityPath(activity?.path ?? '');

  return {
    title: activity.name,
    timeRange: activity.timeRange,
    primaryButton: {
      label: translate('badgeDetailPage.button.activity.label'),
      ariaLabel: translate('badgeDetailPage.button.activity.hintFormat', { name: activity.name }),
      ...(activityUrl ? { link: { url: activityUrl } } : {}),
      variant: 'secondary',
      size: 'small',
    },
    secondaryButton: {
      label: translate('badgeDetailPage.button.activityPreview.label'),
      labelShort: translate('badgeDetailPage.button.activityPreview.labelShort', { defaultValue: '' }),
      ariaLabel: translate('badgeDetailPage.button.activityPreview.hintFormat', { name: activity.name }),
      onClick: onActivitySelection(activity?.path ?? ''),
      variant: 'tertiary',
      size: 'small',
      icon: 'eye',
    },
    hasAllLevels,
    tags: activity.programLevel?.map((level: ProgramLevel) => ({
      id: hasAllLevels
        ? ProgramLevelIds.ALL
        : resolveProgramLevelId(aemFilters?.programLevels, level.name, ProgramLevelIds.MULTI),
      level: hasAllLevels ? translate('global.programLevel.allProgramLevels.label') : (level.name as ProgramLevelEnum),
      type: 'content',
    })),
  };
};

export const createBadgeStep = (
  step: StepModel,
  index: number,
  badgeProgramLevelId: string,
  translate: Translate,
  onActivitySelection: ActivityClickFactory,
  aemFilters: FilterModel
): BadgeStepClientProps => ({
  path: step.path,
  name: step.name ?? '',
  description: step.description?.plaintext,
  descriptionHtml: step.description?.html,
  stepNumber: index + 1,
  activities: step.activities.map(activity =>
    createActivityAccordionItem(activity, translate, onActivitySelection, aemFilters)
  ),
  contentModules: step.contentModules
    ?.map((module, idx) => parseContentModule(module, idx, badgeProgramLevelId))
    .filter((m): m is ParsedContentModule => m !== null),
});

export const createRelatedBadgeItem = (
  item: RelatedBadgeModel,
  aemProgramLevels: Filter[] | undefined,
  devEnv?: boolean
): RelatedBadgeProps => ({
  badgeId: item.badgeId,
  badgeName: item.badgeName,
  path: item.path,
  badgeImage: buildImagePath(item?.image?.path),
  programLevel: {
    id: resolveProgramLevelId(aemProgramLevels, item?.programLevel?.name),
    level: item.programLevel.name,
  },
  theme: item.theme?.name ?? '',
  devEnv,
});

export const createSideRailBoxItems = (
  translate: Translate,
  badgeRelatedItems: RelatedBadgeModel[],
  aemProgramLevels: Filter[] | undefined,
  handouts: HandoutCardProps[],
  devEnv?: boolean
): SideRailItemsProps[] => {
  const sideRailItems: (SectionItemProps | RelatedBadgeProps)[] = [
    { type: SideRailBoxType.SECTION, value: translate('badgeDetailPage.sideRail.relatedBadges.text') },
  ];

  const relatedBadgeItems = badgeRelatedItems.map(item => createRelatedBadgeItem(item, aemProgramLevels, devEnv));
  sideRailItems.push(...relatedBadgeItems);

  const boxItems: SideRailItemsProps[] = [
    {
      id: 'badge-details-side-rail-box-1',
      icon: 'usersThree',
      type: SideRailBoxType.RELATED_BADGES,
      items: sideRailItems,
      count: badgeRelatedItems.length,
      title: translate('badgeDetailPage.sideRail.relatedBadges.header'),
    },
  ];

  if (handouts.length > 0) {
    boxItems.push({
      id: 'badge-details-side-rail-handouts-box',
      icon: 'files',
      type: SideRailBoxType.HANDOUTS,
      title: translate('badgeDetailPage.sideRail.handouts.header'),
      count: handouts.length,
      items: [
        {
          header: translate('badgeDetailPage.sideRail.handouts.header'),
          handouts,
          type: SideRailBoxType.HANDOUT_ITEMS,
        },
      ],
    });
  }

  return boxItems;
};

export const resolveBadgeProgramLevel = (badgeDetails: BadgeModel, filters: FilterModel): TagProps => ({
  level: badgeDetails?.programLevel?.name ?? '',
  id: resolveProgramLevelId(filters?.programLevels, badgeDetails.programLevel?.name),
});

export const buildBadgePdfData = (
  badgeDetails: BadgeModel,
  badgeRelatedItems: RelatedBadgeModel[],
  filters: FilterModel,
  translate: Translate,
  devEnv?: boolean
) => {
  const noOpClick: ActivityClickFactory = () => () => undefined;
  const handouts = createBadgeHandouts(badgeDetails, translate);
  const sideRailBoxItems = createSideRailBoxItems(
    translate,
    badgeRelatedItems,
    filters?.programLevels,
    handouts,
    devEnv
  );
  const badgeProgramLevel = resolveBadgeProgramLevel(badgeDetails, filters);
  const badgeSteps =
    badgeDetails.steps?.map((step, index) =>
      createBadgeStep(step, index, badgeProgramLevel.id ?? '', translate, noOpClick, filters)
    ) ?? [];
  return {
    badgeProgramLevel,
    badgeSteps,
    handouts,
    sideRailBoxItems,
  };
};
