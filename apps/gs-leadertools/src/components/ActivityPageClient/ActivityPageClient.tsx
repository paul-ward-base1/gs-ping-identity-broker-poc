'use client';
import { useTranslation } from 'react-i18next';
import { cloneElement, useMemo, useRef } from 'react';
import { useParams } from 'next/navigation';
import { cn } from '@/utils/classNames';
import { usePrintShortcut } from '@/utils/usePrintShortcut';
import { usePrintWithLoading } from '@/utils/usePrintWithLoading';
import { PrintLoadingOverlay } from '@/components/PrintLoadingOverlay';
import { normalizeActivityPath } from '@/lib/aemContext';
import { normalizeClosingQuestions } from '@/utils/normalizeClosingQuestions';
import { useScrollTracker } from '@/utils/useScrollTracker';
import { useCrossDomainTracker } from '@/utils/useCrossDomainTracker';
import { useStepsLinkTracker } from '@/utils/useStepsLinkTracker';
import { DetailPageLayout } from '@/components/DetailPageLayout';
import { SideRail } from '@/components/SideRail';
import { DetailPageHero } from '@/components/DetailPageHero';
import { SidePanel } from '@/components/SidePanel';
import { PrintMenu } from '@/components/PrintMenu';
import { SideRailBox } from '@/components/SideRailBox';
import { ClosingQuestion } from '@/components/ClosingQuestion';
import { Handouts } from '@/components/Handouts';
import { DonorRecognition } from '@/components/DonorRecognition';

import './ActivityPageClient.scss';
import { ActivityPageClientProps } from './types';
import { useActivityPageClient } from './useActivityPageClient';
import { ActivityContentModule } from './ActivityContentModule';
import { TagProps } from '@/components/Tag/types';
import { useIsAuthorMode } from '@/components/contexts/locale-context';

const bem = cn('activity-details-page');

export const ActivityPageClient = (props: ActivityPageClientProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const isAuthorMode = useIsAuthorMode();
  const { activity } = props;
  const {
    sideRailBoxItems,
    printButtonProps,
    programLevel,
    activityContent,
    theme,
    programLevels,
    sidePanelExpanded,
    toggleSidePanel,
    handouts,
    donors,
  } = useActivityPageClient(props);

  const routeParams = useParams<{ lang?: string }>();

  const pdfUrl = useMemo(() => {
    try {
      const normalized = normalizeActivityPath(activity.path);
      const match = normalized.match(/^\/([a-z]{2})\/activity\/(.+)$/);
      if (!match) return null;
      const [, langFromPath, tail] = match;
      const lang = routeParams?.lang ?? langFromPath;
      return `/api/print/activity/${lang}/${tail}`;
    } catch {
      return null;
    }
  }, [activity.path, routeParams?.lang]);

  const { handlePrint, isPrintLoading, printDisabled } = usePrintWithLoading(pdfUrl);

  usePrintShortcut(handlePrint);

  useScrollTracker({
    contentType: 'activity',
    programLevel: programLevel.id ?? '',
    theme: theme ?? '',
  });
  useCrossDomainTracker(containerRef);

  const activityContentRef = useRef<HTMLDivElement>(null);
  useStepsLinkTracker(activityContentRef);

  const closingQuestions = normalizeClosingQuestions(activity?.closingQuestionContent);
  const hasClosingQuestion = !!(
    activity?.closingQuestionTitle ||
    closingQuestions.length ||
    activity?.closingQuestionDescription?.html
  );
  const visibleDonors = donors?.filter(d => !d.hidden) ?? [];
  const hasExtras = hasClosingQuestion || !!handouts?.length || visibleDonors.length > 0;

  const aueProps =
    isAuthorMode && activity.path
      ? {
          'data-aue-resource': `urn:aemconnection:${activity.path}/jcr:content/data/master`,
          'data-aue-type': 'reference' as const,
          'data-aue-label': activity.name,
        }
      : {};

  return (
    <div ref={containerRef} className={bem()}>
      <DetailPageLayout>
        <>
          <div {...aueProps} className={bem('hero-wrapper')}>
            <DetailPageHero
              image={activity.image}
              imageAlt={activity.name}
              programLevels={programLevels as TagProps[]}
              title={activity.name ?? ''}
              description={activity.description?.plaintext ?? ''}
              descriptionHtml={activity.description?.html}
              secondaryButtonLabel={t('activityDetailPage.button.activityPreparation.label')}
              secondaryButtonAriaLabel={t('activityDetailPage.button.activityPreparation.hintFormat', {
                name: activity.name,
              })}
              secondaryButtonClick={toggleSidePanel}
              ueTitleProp="name"
            />
          </div>
          <div className={bem('data', { 'no-extras': !hasExtras })}>
            <div className={bem('activity-content')} ref={activityContentRef}>
              {activityContent?.map((el, index) => <ActivityContentModule key={`${el?.id}-${index}`} {...el} />)}
            </div>
          </div>
          {hasExtras && (
            <div className={bem('extras')}>
              {hasClosingQuestion && (
                <ClosingQuestion
                  title={activity?.closingQuestionTitle ?? ''}
                  description={activity?.closingQuestionDescription?.html ?? ''}
                  questionText={closingQuestions[0] ?? ''}
                  questions={closingQuestions}
                  uePath={activity.path}
                  ueLabel={activity.name}
                />
              )}
              {!!handouts?.length && <Handouts title={t('badgeDetailPage.section.handouts.header')} cards={handouts} />}
              {visibleDonors.length > 0 && (
                <div className={bem('donor', { level: programLevel.id })}>
                  <DonorRecognition donors={visibleDonors} />
                </div>
              )}
            </div>
          )}
        </>
        {cloneElement(
          <SideRail
            items={sideRailBoxItems}
            printButtonProps={printButtonProps}
            badgeProgramLevel={programLevel?.id}
            handlePrintClick={handlePrint}
            printDisabled={printDisabled}
            onPrintColor={handlePrint}
            printColorOptionLabels={{
              blackWhite: t('global.button.printBlackWhite.label', { defaultValue: 'Black and White' }),
              color: t('global.button.printColor.label', { defaultValue: 'Color' }),
            }}
          />,
          {
            slot: 'sidebar',
          }
        )}
      </DetailPageLayout>
      <SidePanel
        programLevel={programLevel?.id}
        title={t('activityDetailPage.sideRail.header')}
        isOpen={sidePanelExpanded}
        onClose={toggleSidePanel}
        closeButtonAreaLabel={t('global.button.close.hint')}
      >
        <div className={bem('mobile-print')}>
          <PrintMenu
            triggerLabel={printButtonProps.label}
            triggerAriaLabel={printButtonProps.hint}
            disabled={printDisabled}
            onPrint={handlePrint}
            blackWhiteLabel={t('global.button.printBlackWhite.label', { defaultValue: 'Black and White' })}
            colorLabel={t('global.button.printColor.label', { defaultValue: 'Color' })}
          />
        </div>
        {!!sideRailBoxItems.length &&
          sideRailBoxItems?.map((item, index) => (
            <SideRailBox
              key={`${item.id}-${index}`}
              title={item.title}
              count={item.count}
              items={item.items}
              icon={item.icon}
              level={programLevel?.id}
            />
          ))}
      </SidePanel>
      <PrintLoadingOverlay
        isOpen={isPrintLoading}
        label={t('global.print.preparing', { defaultValue: 'Preparing print' })}
      />
    </div>
  );
};
