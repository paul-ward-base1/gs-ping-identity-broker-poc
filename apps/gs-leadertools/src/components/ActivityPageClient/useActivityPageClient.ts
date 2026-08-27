import { useCallback, useEffect, useMemo, useState } from 'react';
import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { ActivityModel } from '@/types/activity';
import { useGTMTracker } from '@/utils/gtmTracker';
import { createHandouts, createRelatedBadges, createSupplies } from '@/utils/activityUtils';
import { SideRailBoxType } from '@/components/SideRailBox/types';
import { ContentModulesTypes } from '@/types/contentModules';
import { ParsedContentModule } from '@/components/ActivityPageClient/types';
import { SectionItemProps, SideRailItemsProps } from '@/components/SideRail/types';
import { HandoutCardProps } from '@/components/Handouts/types';
import { ProgramLevelEnum, ProgramLevelIds } from '@/types/programLevel';
import { useAEMFilters } from '@/components/contexts/locale-context';
import { Filter } from '@/types/filter';
import { checkAllLevels, resolveProgramLevelId } from '@/utils/programLevelUtils';
import { buildImagePath } from '@/utils/buildImagePath';

const createSideRailBoxData = (t: TFunction, activity: ActivityModel, aemProgramLevels: Filter[]) => {
  let boxData = [];

  if (activity?.timeRange) {
    boxData.push({
      id: 'activity-time-range-box',
      icon: 'time',
      title: t('activityDetailPage.sideRail.time.header'),
      items: [
        {
          type: SideRailBoxType.SECTION,
          value: activity?.timeRange,
        },
      ],
      type: SideRailBoxType.TIME,
    });
  }

  if (activity?.relatedResources?.length || activity?.materials?.length) {
    const handouts = createHandouts(activity, t);

    const supplies = createSupplies(activity, t);

    const handoutsBoxItems =
      handouts.length > 0
        ? [
            ...supplies,
            {
              header: t('activityDetailPage.sideRail.suppliesAndHandouts.handouts.header'),
              handouts,
              type: SideRailBoxType.HANDOUT_ITEMS,
            },
          ]
        : supplies;

    const handoutsBox = {
      id: 'activity-handouts-box',
      icon: 'paintBrush',
      title: t('activityDetailPage.sideRail.suppliesAndHandouts.header'),
      items: handoutsBoxItems,
      type: SideRailBoxType.HANDOUTS,
      count: supplies.length + handouts.length,
    };
    boxData.push(handoutsBox);
  }

  if (activity?.badgeConnection?.length) {
    let relatedBadgeItems = [];
    const associatedBadgeDescription: SectionItemProps = {
      type: SideRailBoxType.SECTION,
      value: t('activityDetailPage.sideRail.associatedBadges.text'),
    };

    relatedBadgeItems.push(associatedBadgeDescription);

    relatedBadgeItems.push(...createRelatedBadges(activity.badgeConnection, aemProgramLevels));

    const associatedBadgesBox = {
      id: 'activity-associated-badges-box',
      icon: 'sealCheck',
      title: t('activityDetailPage.sideRail.associatedBadges.header'),
      items: relatedBadgeItems,
      type: SideRailBoxType.ASSOCIATED_BADGES,
      count: activity?.badgeConnection?.length,
    };

    boxData.push(associatedBadgesBox);
  }

  return boxData;
};

export const useActivityPageClient = ({ activity }: { activity: ActivityModel }) => {
  const { t } = useTranslation();
  const aemFilters = useAEMFilters();
  const [sidePanelExpanded, setSidePanelExpanded] = useState(false);

  const hasAllLevels = useMemo(
    () =>
      checkAllLevels(
        activity?.programLevel?.map(
          l => aemFilters?.programLevels?.find((el: Filter) => el.name === l.name)?.id ?? l.id
        )
      ),
    [activity?.programLevel, aemFilters]
  );

  const sideRailBoxItems = useMemo(() => {
    return createSideRailBoxData(t, activity, aemFilters?.programLevels ?? []);
  }, [activity, aemFilters]) as SideRailItemsProps[];

  const handouts: HandoutCardProps[] =
    useMemo(() => {
      return createHandouts(activity ?? [], t);
    }, [t]) ?? [];

  const donors = useMemo(() => activity.donors ?? [], [activity.donors]);

  const programLevel = useMemo(() => {
    return activity?.programLevel && activity?.programLevel?.length > 1
      ? {
          id: ProgramLevelIds.MULTI,
          label: ProgramLevelEnum.MULTI,
        }
      : (aemFilters?.programLevels?.find((el: Filter) => el.name === activity?.programLevel?.[0]?.name) ?? {
          id: ProgramLevelIds.ALL,
          level: t('global.programLevel.allProgramLevels.label'),
        });
  }, [aemFilters, t]);

  const programLevels = useMemo(() => {
    return hasAllLevels
      ? [
          {
            id: ProgramLevelIds.ALL,
            level: t('global.programLevel.allProgramLevels.label'),
          },
        ]
      : (activity?.programLevel?.map(level => {
          return {
            id: resolveProgramLevelId(aemFilters.programLevels, level.name, ProgramLevelIds.MULTI),
            level: level.name,
          };
        }) ?? []);
  }, [activity?.programLevel, aemFilters, t, hasAllLevels]);

  const theme = useMemo(() => {
    return activity.badgeConnection
      ?.map(connection => {
        if (connection.theme) {
          return connection.theme.name;
        }
      })
      .join(', ');
  }, [activity]);

  const activityContent: ParsedContentModule[] = useMemo(() => {
    if (!activity.content) return [];

    return activity.content.reduce<ParsedContentModule[]>((acc, el, index) => {
      switch (el.type) {
        case ContentModulesTypes.RichTextModel: {
          const { path, type, content } = el;
          acc.push({
            id: index,
            path,
            type,
            content: content.html,
          });
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
            level: programLevel.id,
            items: items?.map(item => ({ value: item.html })),
          });
          break;
        }

        case ContentModulesTypes.VideoModel: {
          const { path, type, title, videoId, platform } = el;
          acc.push({
            id: index,
            path,
            type,
            title,
            videoId,
            platform,
          });
          break;
        }

        case ContentModulesTypes.ImageModel: {
          const { path, type, label, file } = el;
          acc.push({
            id: index,
            path,
            type,
            label,
            file,
          });
          break;
        }

        case ContentModulesTypes.CalloutModel: {
          const { path, type, title, icon, description } = el;
          acc.push({
            id: index,
            path,
            type,
            title,
            iconName: icon?.alt,
            iconPath: icon?.path,
            descriptionHtml: description?.html,
            level: programLevel.id,
          });
          break;
        }

        case ContentModulesTypes.FileModel: {
          const { path, type, title, file } = el;
          const url = file?.path ? buildImagePath(file.path) : file?.url;
          const fileTitle = title ?? file?.title ?? '';
          acc.push({
            id: index,
            path,
            type,
            title: fileTitle,
            url,
            ariaLabel: `Download ${fileTitle}`,
          });
          break;
        }

        default:
          break;
      }

      return acc;
    }, []);
  }, [activity, programLevel]);

  const toggleSidePanel = useCallback(() => {
    setSidePanelExpanded(prev => !prev);
  }, [sidePanelExpanded]);

  const printButtonProps = {
    label: t('global.button.print.label'),
    hint: t('global.button.print.hintFormat', { pageTitle: activity?.name }),
  };

  useGTMTracker({
    event: 'select_activity',
    data: {
      activity_name: activity?.name,
      program_level: activity?.programLevel?.map(level => level.name),
      theme,
    },
  });

  useEffect(() => {
    document.title = activity.name ?? '';
  }, [activity.name]);

  return {
    theme,
    programLevels,
    programLevel,
    printButtonProps,
    sideRailBoxItems,
    activityContent,
    sidePanelExpanded,
    toggleSidePanel,
    handouts,
    donors,
  };
};
