import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAEMFilters } from '@/components/contexts/locale-context';
import { useScrollTracker } from '@/utils/useScrollTracker';
import {
  createAwardHandouts,
  createAwardStep,
  createAwardClosingQuestions,
  createAwardSideRailBoxItems,
  resolveAwardProgramLevel,
  resolveAwardProgramLevelTags,
} from './awardData';
import { AwardPageClientProps } from './types';

export const useAwardPageClient = ({
  awardDetails,
  awardRelatedItems = [],
  allAwards = [],
  devEnv,
}: AwardPageClientProps) => {
  const { t: translate } = useTranslation();
  const aemFilters = useAEMFilters();
  const containerRef = useRef<HTMLDivElement>(null);

  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [selectedActivityPath, setSelectedActivityPath] = useState<string>('');
  const [sidePanelExpanded, setSidePanelExpanded] = useState(false);

  const toggleSidePanel = useCallback(() => {
    setSidePanelExpanded(prev => !prev);
  }, []);

  const handleActivitySelection = useCallback(
    (activityPath: string) => () => {
      setSelectedActivityPath(activityPath);
      setPreviewModalOpen(true);
    },
    []
  );

  const handleCloseModal = useCallback(() => {
    setPreviewModalOpen(false);
    setSelectedActivityPath('');
  }, []);

  const awardProgramLevel = useMemo(
    () => resolveAwardProgramLevel(awardDetails, aemFilters),
    [aemFilters, awardDetails]
  );

  const awardProgramLevelTags = useMemo(
    () => resolveAwardProgramLevelTags(awardDetails, aemFilters),
    [aemFilters, awardDetails]
  );

  const handouts = useMemo(() => createAwardHandouts(awardDetails, translate), [awardDetails, translate]);

  const awardSteps = useMemo(
    () =>
      awardDetails.steps?.map((step, index) =>
        createAwardStep(step, index, awardProgramLevel.id, translate, handleActivitySelection, aemFilters)
      ) ?? [],
    [awardDetails.steps, awardProgramLevel.id, translate, handleActivitySelection, aemFilters]
  );

  const closingQuestion = useMemo(() => createAwardClosingQuestions(awardDetails), [awardDetails]);

  const sideRailBoxItems = useMemo(
    () =>
      createAwardSideRailBoxItems({
        translate,
        nextAwards: awardDetails.nextAwards ?? [],
        multiProgramLevel: awardRelatedItems,
        allAwards,
        aemProgramLevels: aemFilters?.programLevels,
        handouts,
        devEnv,
      }),
    [translate, awardDetails.nextAwards, awardRelatedItems, allAwards, aemFilters, handouts, devEnv]
  );

  const donors = useMemo(() => awardDetails.donors ?? [], [awardDetails.donors]);

  const printButtonProps = useMemo(() => {
    const label = translate('global.button.print.label');
    return {
      label,
      hint: translate('global.button.print.ariaLabelFormat', {
        label,
        pageTitle: awardDetails.badgeName,
        defaultValue: `${label} for ${awardDetails.badgeName}`,
      }),
    };
  }, [translate, awardDetails.badgeName]);

  useScrollTracker({
    contentType: 'award',
    programLevel: awardProgramLevel.level,
    theme: awardDetails.theme?.name ?? '',
  });

  const updateVars = useCallback(() => {
    const header = document.querySelector('header');
    const headerHeight = header?.clientHeight ?? 0;
    const el = containerRef.current;
    if (!el) return;
    el.style.setProperty('--header-height', `${headerHeight}px`);
    el.style.setProperty('--sidebar-height', `calc(100% - ${headerHeight}px)`);
  }, []);

  useEffect(() => {
    updateVars();
    if (awardDetails.badgeName) {
      document.title = awardDetails.badgeName;
    }
    window.addEventListener('resize', updateVars);
    return () => window.removeEventListener('resize', updateVars);
  }, [updateVars, awardDetails.badgeName]);

  return {
    containerRef,
    awardProgramLevel,
    awardProgramLevelTags,
    sideRailBoxItems,
    awardSteps,
    closingQuestion,
    handouts,
    donors,
    previewModalOpen,
    selectedActivityPath,
    handleCloseModal,
    printButtonProps,
    sidePanelExpanded,
    toggleSidePanel,
  };
};
