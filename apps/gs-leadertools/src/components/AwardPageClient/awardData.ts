import { AwardModel, NextAwardItem, AwardStepModel } from '@/types/award';
import { ProgramLevelIds, ProgramLevel } from '@/types/programLevel';
import { Filter, FilterModel } from '@/types/filter';
import { TagProps } from '@/components/Tag/types';
import { RelatedBadgeProps } from '@/components/RelatedBadge/types';
import { SideRailItemsProps } from '@/components/SideRail/types';
import { SideRailBoxType, SideRailBoxItem } from '@/components/SideRailBox/types';
import { HandoutCardProps } from '@/components/Handouts/types';
import { AwardStepClientProps } from '@/components/AwardStep/types';
import { AccordionItemProps } from '@/components/AccordionItem/types';
import { ParsedContentModule } from '@/components/ActivityPageClient/types';
import { ContentModulesTypes, ContentModule } from '@/types/contentModules';
import { normalizeClosingQuestions } from '@/utils/normalizeClosingQuestions';
import { ActivityModel } from '@/types/activity';
import { createResourceHandouts } from '@/utils/createResourceHandouts';
import { toRelatedBadgeProps } from '@/utils/toRelatedBadgeProps';
import { buildImagePath } from '@/utils/buildImagePath';
import { checkAllLevels, resolveProgramLevelId } from '@/utils/programLevelUtils';
import { normalizeAwardPath, safeNormalizeActivityPath } from '@/lib/aemContext';
import { ProgramLevelEnum } from '@/types/programLevel';

type Translate = (key: string, options?: Record<string, unknown>) => string;

export const createAwardHandouts = (award: AwardModel, translate?: Translate): HandoutCardProps[] =>
  createResourceHandouts(award.relatedResources, translate);

/** Parses an AEM content module into the shape `ActivityContentModule` renders. */
export const parseContentModule = (module: ContentModule, index: number, level: string): ParsedContentModule | null => {
  switch (module.type) {
    case ContentModulesTypes.RichTextModel:
      return {
        id: index,
        path: module.path,
        type: module.type,
        content: module.content?.html,
      };
    case ContentModulesTypes.AccordionModel:
      return {
        id: index,
        path: module.path,
        type: module.type,
        title: module.header,
        header: module.label,
        level,
        items: module.items?.map(item => ({ value: item.html })) ?? [],
      };
    case ContentModulesTypes.VideoModel:
      return {
        id: index,
        path: module.path,
        type: module.type,
        title: module.title,
        videoId: module.videoId,
        platform: module.platform,
      };
    case ContentModulesTypes.ImageModel:
      return {
        id: index,
        path: module.path,
        type: module.type,
        label: module.label,
        file: module.file,
      };
    case ContentModulesTypes.CalloutModel:
      return {
        id: index,
        path: module.path,
        type: module.type,
        title: module.title,
        iconName: module.icon?.alt,
        iconPath: module.icon?.path,
        descriptionHtml: module.description?.html,
        level,
      };
    case ContentModulesTypes.FileModel: {
      const url = module.file?.path ? buildImagePath(module.file.path) : module.file?.url;
      const title = module.title ?? module.file?.title ?? '';
      return {
        id: index,
        path: module.path,
        type: module.type,
        title,
        url,
        ariaLabel: `Download ${title}`,
      };
    }
    default:
      return null;
  }
};

type ActivityClickFactory = (path: string) => () => void;

export const createAwardActivityAccordionItem = (
  activity: ActivityModel,
  translate: Translate,
  onActivitySelection: ActivityClickFactory,
  aemFilters: FilterModel
): AccordionItemProps => {
  const hasAllLevels = checkAllLevels(
    activity.programLevel?.map(level => resolveProgramLevelId(aemFilters?.programLevels, level.name))
  );

  const detailsLabel = translate('awardDetailPage.button.activity.label', { defaultValue: 'See full details' });
  const previewLabel = translate('awardDetailPage.button.activityPreview.label', { defaultValue: 'View preview' });
  const activityUrl = safeNormalizeActivityPath(activity?.path ?? '');

  return {
    title: activity.name,
    timeRange: activity.timeRange,
    primaryButton: {
      label: detailsLabel,
      ariaLabel: translate('awardDetailPage.button.activity.ariaLabelFormat', {
        label: detailsLabel,
        name: activity.name,
        defaultValue: `${detailsLabel} for ${activity.name}`,
      }),
      ...(activityUrl ? { link: { url: activityUrl } } : {}),
      variant: 'secondary',
      size: 'small',
    },
    secondaryButton: {
      label: previewLabel,
      ariaLabel: translate('awardDetailPage.button.activityPreview.ariaLabelFormat', {
        label: previewLabel,
        name: activity.name,
        defaultValue: `${previewLabel} for ${activity.name}`,
      }),
      onClick: onActivitySelection(activity?.path ?? ''),
      variant: 'tertiary',
      size: 'small',
      icon: 'eye',
    },
    hasAllLevels,
    tags: activity.programLevel?.map(level => ({
      id: hasAllLevels
        ? resolveProgramLevelId(aemFilters?.programLevels, ProgramLevelEnum.ALL)
        : resolveProgramLevelId(aemFilters?.programLevels, level.name),
      level: hasAllLevels ? ProgramLevelEnum.ALL : (level.name as ProgramLevelEnum),
      type: 'content',
    })),
  };
};

export const createAwardStep = (
  step: AwardStepModel,
  index: number,
  awardProgramLevelId: string,
  translate: Translate,
  onActivitySelection: ActivityClickFactory,
  aemFilters: FilterModel
): AwardStepClientProps => ({
  path: step.path,
  name: step.name ?? '',
  description: step.description?.plaintext,
  descriptionHtml: step.description?.html,
  stepNumber: index + 1,
  activities:
    step.activities?.map(activity =>
      createAwardActivityAccordionItem(activity, translate, onActivitySelection, aemFilters)
    ) ?? [],
  contentModules: step.contentModules
    ?.map((module, idx) => parseContentModule(module, idx, awardProgramLevelId))
    .filter((m): m is ParsedContentModule => m !== null),
});

export interface AwardClosingQuestionsClientProps {
  title: string;
  descriptionHtml: string;
  questions: string[];
  uePath?: string;
  ueLabel?: string;
}

export const createAwardClosingQuestions = (award: AwardModel): AwardClosingQuestionsClientProps | null => {
  const questions = normalizeClosingQuestions(award.closingQuestionContent);
  const hasHeader = !!(award.closingQuestionTitle || award.closingQuestionDescription?.html);
  if (!questions.length && !hasHeader) return null;
  return {
    title: award.closingQuestionTitle ?? '',
    descriptionHtml: award.closingQuestionDescription?.html ?? '',
    questions,
    uePath: award.path,
    ueLabel: award.badgeName,
  };
};

/** Single-level → that level's id; 0 or 2+ levels → `MULTI` for combined theming. */
export const resolveAwardProgramLevel = (award: AwardModel, filters: FilterModel): TagProps => {
  const levels = award.programLevel ?? [];
  if (levels.length === 0) {
    return { level: '', id: ProgramLevelIds.MULTI };
  }
  if (levels.length === 1) {
    return {
      level: levels[0].name,
      id: resolveProgramLevelId(filters?.programLevels, levels[0].name),
    };
  }
  return { level: '', id: ProgramLevelIds.MULTI };
};

export const resolveAwardProgramLevelTags = (award: AwardModel, filters: FilterModel): TagProps[] =>
  (award.programLevel ?? []).map(level => ({
    level: level.name,
    id: resolveProgramLevelId(filters?.programLevels, level.name),
  }));

// Pre-resolve to a `/award/...` route so `RelatedBadge` doesn't run
// `normalizeBadgePath` (which throws on non-`/badges/` paths).
const safeAwardHref = (path?: string): string | undefined => {
  if (!path) return undefined;
  try {
    return normalizeAwardPath(path);
  } catch {
    return undefined;
  }
};

// BE doesn't project `programLevel` on `NextAwardItem`. Look it up by `path`
// against the full awards list so the row can render its level (e.g. "Cadette").
// Falls back to MULTI when no match exists.
const toNextAwardCard = (
  item: NextAwardItem,
  allAwards: AwardModel[],
  aemProgramLevels: Filter[] | undefined,
  devEnv?: boolean
): RelatedBadgeProps => {
  const fullAward = allAwards.find(a => a.path === item.path);
  const [primary, ...rest] = fullAward?.programLevel ?? [];
  return toRelatedBadgeProps(
    {
      id: item.badgeId,
      name: item.badgeName,
      path: item.path,
      hrefOverride: safeAwardHref(item.path),
      imagePath: item.image?.path,
      programLevel: primary ?? ({ name: '', id: ProgramLevelIds.MULTI, backgroundImage: { path: '' } } as ProgramLevel),
      additionalProgramLevels: rest,
      theme: fullAward?.theme?.name,
    },
    aemProgramLevels,
    devEnv
  );
};

const toMultiLevelAwardCard = (
  item: AwardModel,
  aemProgramLevels: Filter[] | undefined,
  devEnv?: boolean
): RelatedBadgeProps => {
  const [primary, ...rest] = item.programLevel ?? [];
  return toRelatedBadgeProps(
    {
      id: item.badgeId ?? '',
      name: item.badgeName ?? '',
      path: item.path ?? '',
      hrefOverride: safeAwardHref(item.path),
      imagePath: item.image?.path,
      programLevel: primary ?? ({ name: '', id: ProgramLevelIds.MULTI, backgroundImage: { path: '' } } as ProgramLevel),
      additionalProgramLevels: rest,
      theme: item.theme?.name,
    },
    aemProgramLevels,
    devEnv
  );
};

export interface CreateAwardSideRailBoxItemsOptions {
  translate: Translate;
  nextAwards: NextAwardItem[];
  multiProgramLevel: AwardModel[];
  /** Full awards list used to enrich `nextAwards` with `programLevel`/`theme`. */
  allAwards: AwardModel[];
  aemProgramLevels: Filter[] | undefined;
  handouts: HandoutCardProps[];
  devEnv?: boolean;
}

export const createAwardSideRailBoxItems = ({
  translate,
  nextAwards,
  multiProgramLevel,
  allAwards,
  aemProgramLevels,
  handouts,
  devEnv,
}: CreateAwardSideRailBoxItemsOptions): SideRailItemsProps[] => {
  const boxItems: SideRailItemsProps[] = [];

  if (nextAwards.length > 0) {
    const description = translate('awardDetailPage.sideRail.nextAwards.description', {
      defaultValue: "Once you complete this award, explore what's next.",
    });
    const items: SideRailBoxItem[] = [
      { type: SideRailBoxType.SECTION, value: description },
      ...nextAwards.map(award => ({
        ...toNextAwardCard(award, allAwards, aemProgramLevels, devEnv),
        type: SideRailBoxType.NEXT_AWARDS as const,
      })),
    ];
    boxItems.push({
      id: 'award-side-rail-next',
      icon: 'trophy',
      type: SideRailBoxType.NEXT_AWARDS,
      title: translate('awardDetailPage.sideRail.nextAwards.header', { defaultValue: 'Next Award' }),
      count: nextAwards.length,
      items,
    });
  }

  if (multiProgramLevel.length > 0) {
    const description = translate('awardDetailPage.sideRail.multiProgramLevel.description', {
      defaultValue: 'Related badges for groups with multiple program levels',
    });
    const items: SideRailBoxItem[] = [
      { type: SideRailBoxType.SECTION, value: description },
      ...multiProgramLevel.map(award => ({
        ...toMultiLevelAwardCard(award, aemProgramLevels, devEnv),
        type: SideRailBoxType.MULTI_LEVEL_GROUP as const,
      })),
    ];
    boxItems.push({
      id: 'award-side-rail-multi-level',
      icon: 'usersThree',
      type: SideRailBoxType.MULTI_LEVEL_GROUP,
      title: translate('awardDetailPage.sideRail.multiProgramLevel.header', {
        defaultValue: 'For multi-level groups',
      }),
      count: multiProgramLevel.length,
      items,
    });
  }

  if (handouts.length > 0) {
    boxItems.push({
      id: 'award-side-rail-handouts',
      icon: 'files',
      type: SideRailBoxType.HANDOUTS,
      title: translate('awardDetailPage.section.relatedHandouts.header', {
        defaultValue: 'Related Handouts',
      }),
      items: [
        {
          header: translate('awardDetailPage.sideRail.handouts.header', {
            defaultValue: 'Handouts',
          }),
          handouts,
          type: SideRailBoxType.HANDOUT_ITEMS,
        },
      ],
    });
  }

  return boxItems;
};
