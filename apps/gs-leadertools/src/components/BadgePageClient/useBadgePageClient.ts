import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ProgramLevelIds } from '@/types/programLevel';
import { BadgePageClientProps } from '@/components/BadgePageClient/types';
import { useGTMTracker } from '@/utils/gtmTracker';
import { useAEMFilters } from '@/components/contexts/locale-context';
import { Filter } from '@/types/filter';
import { TagProps } from '@/components/Tag/types';
import {
  createBadgeHandouts,
  createActivityAccordionItem,
  createBadgeStep,
  createSideRailBoxItems,
} from './badgePdfData';

export { createBadgeHandouts, createActivityAccordionItem, createBadgeStep, createSideRailBoxItems };

export const useBadgePageClient = ({ badgeDetails, badgeRelatedItems, devEnv }: BadgePageClientProps) => {
  const [sidePanelExpanded, setSidePanelExpanded] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [selectedActivityPath, setSelectedActivityPath] = useState<string>('');

  const { t: translate } = useTranslation();
  const aemFilters = useAEMFilters();
  const containerRef = useRef<HTMLDivElement>(null);

  const badgeProgramLevel = useMemo(
    () => ({
      level: badgeDetails?.programLevel?.name,
      id:
        aemFilters?.programLevels?.find((el: Filter) => el.name === badgeDetails.programLevel?.name)?.id ??
        ProgramLevelIds.MULTI,
    }),
    [aemFilters, badgeDetails]
  ) as TagProps;

  const handleActivitySelection = useCallback(
    (activityPath: string) => () => {
      setSelectedActivityPath(activityPath);
      setPreviewModalOpen(prev => !prev);
    },
    []
  );

  const handouts = useMemo(() => createBadgeHandouts(badgeDetails, translate), [badgeDetails, translate]);

  const sideRailBoxItems = useMemo(
    () => createSideRailBoxItems(translate, badgeRelatedItems, aemFilters?.programLevels, handouts, devEnv),
    [translate, badgeRelatedItems, aemFilters, handouts, devEnv]
  );

  const badgeSteps = useMemo(
    () =>
      badgeDetails.steps?.map((step, index) =>
        createBadgeStep(step, index, badgeProgramLevel.id ?? '', translate, handleActivitySelection, aemFilters)
      ),
    [badgeDetails.steps, badgeProgramLevel.id, translate, handleActivitySelection, aemFilters]
  );

  const donors = useMemo(() => badgeDetails.donors ?? [], [badgeDetails.donors]);

  const printButtonProps = {
    label: translate('global.button.print.label'),
    hint: translate('global.button.print.hintFormat', { pageTitle: badgeDetails.badgeName }),
  };

  const handleCloseModal = useCallback(() => {
    setPreviewModalOpen(prev => !prev);
    setSelectedActivityPath('');
  }, []);

  const toggleSidePanel = useCallback(() => {
    setSidePanelExpanded(prev => !prev);
  }, []);

  const updateVars = useCallback(() => {
    const header = document.querySelector('header');
    const headerHeight = header?.clientHeight ?? 0;
    const el = containerRef.current;
    if (!el) return;
    el.style.setProperty('--header-height', `${headerHeight}px`);
    el.style.setProperty('--sidebar-height', `calc(100% - ${headerHeight}px`);
  }, [containerRef]);

  useGTMTracker({
    event: 'select_badge',
    data: {
      badge_id: badgeDetails.badgeId,
      badge_name: badgeDetails.badgeName,
      program_level: badgeDetails.programLevel?.name,
      theme: badgeDetails.theme?.name ?? '',
    },
  });

  useEffect(() => {
    updateVars();
    document.title = badgeDetails.badgeName ?? '';
    window.addEventListener('resize', updateVars);
    return () => window.removeEventListener('resize', updateVars);
  }, [updateVars, badgeDetails.badgeName]);

  return {
    containerRef,
    sidePanelExpanded,
    badgeProgramLevel,
    sideRailBoxItems,
    toggleSidePanel,
    badgeSteps,
    handouts,
    donors,
    printButtonProps,
    previewModalOpen,
    selectedActivityPath,
    handleCloseModal,
  };
};
