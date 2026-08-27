'use client';

import { cloneElement, useMemo, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { cn } from '@/utils/classNames';
import { SideRail } from '@/components/SideRail';
import { SideRailBox } from '@/components/SideRailBox';
import { SidePanel } from '@/components/SidePanel';
import { BadgeSteps } from '@/components/BadgeSteps';

import { PrintMenu } from '@/components/PrintMenu';
import { ClosingQuestion } from '@/components/ClosingQuestion';

import { Handouts } from '@/components/Handouts';
import { DonorRecognition } from '@/components/DonorRecognition';

import { DetailPageLayout } from '@/components/DetailPageLayout';
import { DetailPageHero } from '@/components/DetailPageHero';
import { DirectiveContent } from '@/components/DirectiveContent';
import { usePrintShortcut } from '@/utils/usePrintShortcut';
import { usePrintWithLoading } from '@/utils/usePrintWithLoading';
import { PrintLoadingOverlay } from '@/components/PrintLoadingOverlay';
import { useScrollTracker } from '@/utils/useScrollTracker';
import { useCrossDomainTracker } from '@/utils/useCrossDomainTracker';
import { useStepsLinkTracker } from '@/utils/useStepsLinkTracker';
import { normalizeBadgePath } from '@/lib/aemContext';
import { normalizeClosingQuestions } from '@/utils/normalizeClosingQuestions';
import { hasDirectiveContent } from '@/utils/hasDirectiveContent';

import { BadgePageClientProps } from './types';
import { useBadgePageClient } from './useBadgePageClient';
import { ActivityPreview } from './ActivityPreview';
import './BadgePageClient.scss';
import { useIsAuthorMode } from '@/components/contexts/locale-context';

const bem = cn('badge-details-page');

export const BadgePageClient = (props: BadgePageClientProps) => {
  const { t } = useTranslation();
  const isAuthorMode = useIsAuthorMode();

  const { badgeDetails } = props;
  const {
    containerRef,
    badgeProgramLevel,
    sideRailBoxItems,
    sidePanelExpanded,
    toggleSidePanel,
    badgeSteps,
    handouts,
    donors,
    printButtonProps,
    previewModalOpen,
    selectedActivityPath,
    handleCloseModal,
  } = useBadgePageClient(props);

  const routeParams = useParams<{ lang?: string }>();

  const pdfUrl = useMemo(() => {
    try {
      const normalized = normalizeBadgePath(badgeDetails.path);
      const [, level, slug] = normalized.split('/');
      const lang = routeParams?.lang ?? badgeDetails.path?.match(/\/dam\/[^/]+\/([a-z]{2})\//)?.[1] ?? 'en';
      if (!level || !slug) return null;
      return `/api/print/badge/${lang}/${level}/${slug}`;
    } catch {
      return null;
    }
  }, [badgeDetails.path, routeParams?.lang]);

  const { handlePrint, isPrintLoading, printDisabled } = usePrintWithLoading(pdfUrl);

  usePrintShortcut(handlePrint);

  useScrollTracker({
    contentType: 'badge',
    programLevel: badgeProgramLevel.level,
    theme: badgeDetails.theme?.name ?? '',
  });
  useCrossDomainTracker(containerRef);

  const stepsRef = useRef<HTMLDivElement>(null);
  useStepsLinkTracker(stepsRef);

  const aueProps =
    isAuthorMode && badgeDetails.path
      ? {
          'data-aue-resource': `urn:aemconnection:${badgeDetails.path}/jcr:content/data/master`,
          'data-aue-type': 'reference' as const,
          'data-aue-label': badgeDetails.badgeName,
        }
      : {};

  const closingQuestions = normalizeClosingQuestions(badgeDetails?.closingQuestionContent);
  const hasClosingQuestion = !!(
    badgeDetails?.closingQuestionTitle ||
    closingQuestions.length ||
    badgeDetails?.closingQuestionDescription?.html
  );
  const visibleDonors = donors?.filter(d => !d.hidden) ?? [];
  const hasDirective = hasDirectiveContent(badgeDetails);
  const hasExtras = hasClosingQuestion || !!handouts?.length || visibleDonors.length > 0;

  return (
    <div ref={containerRef} className={bem()}>
      <DetailPageLayout>
        <>
          <div {...aueProps} className={bem('hero-wrapper')}>
            <DetailPageHero
              image={badgeDetails.image}
              imageAlt={badgeDetails.badgeName}
              programLevels={[badgeProgramLevel]}
              theme={badgeDetails.theme?.name}
              title={badgeDetails.badgeName ?? ''}
              description={badgeDetails.description?.plaintext ?? ''}
              descriptionHtml={badgeDetails.description?.html}
              primaryButton={badgeDetails.purchaseLink}
              secondaryButtonLabel={t('badgeDetailPage.button.badgePreparation.label')}
              secondaryButtonAriaLabel={t('badgeDetailPage.button.badgePreparation.hintFormat', {
                name: badgeDetails.badgeName,
              })}
              secondaryButtonClick={toggleSidePanel}
            />
          </div>
          {hasDirective && (
            <div className={bem('directive')}>
              <DirectiveContent
                title={badgeDetails.directiveTitle}
                descriptionHtml={badgeDetails.directiveDescription?.html}
              />
            </div>
          )}
          <div className={bem('data', { 'no-extras': !hasExtras })}>
            {!!badgeDetails?.steps?.length && (
              <div className={bem('steps')} ref={stepsRef}>
                <BadgeSteps
                  title={t('badgeDetailPage.section.steps.header')}
                  description={
                    badgeDetails.steps.length > 1
                      ? t('badgeDetailPage.section.steps.textFormat.plural', { count: badgeDetails.steps.length })
                      : t('badgeDetailPage.section.steps.textFormat.singular', { count: badgeDetails.steps.length })
                  }
                  steps={badgeSteps}
                  accordionTitle={t('badgeDetailPage.section.steps.activities.header')}
                  badgeProgramLevel={badgeProgramLevel?.id}
                />
              </div>
            )}
          </div>
          {hasExtras && (
            <div className={bem('extras')}>
              {hasClosingQuestion && (
                <ClosingQuestion
                  title={badgeDetails?.closingQuestionTitle ?? ''}
                  description={badgeDetails?.closingQuestionDescription?.html ?? ''}
                  questionText={closingQuestions[0] ?? ''}
                  questions={closingQuestions}
                  uePath={badgeDetails.path}
                  ueLabel={badgeDetails.badgeName}
                />
              )}
              {!!handouts?.length && (
                <Handouts title={t('badgeDetailPage.section.relatedHandouts.header')} cards={handouts} />
              )}
              {visibleDonors.length > 0 && (
                <div className={bem('donor', { level: badgeProgramLevel?.id })}>
                  <DonorRecognition donors={visibleDonors} />
                </div>
              )}
            </div>
          )}
        </>
        {cloneElement(
          <SideRail
            items={sideRailBoxItems}
            badgeProgramLevel={badgeProgramLevel.id}
            handlePrintClick={handlePrint}
            printButtonProps={printButtonProps}
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
        programLevel={badgeProgramLevel?.id}
        title={t('badgeDetailPage.sideRail.header')}
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
          sideRailBoxItems.map((item, index) => (
            <SideRailBox
              key={`${item.id}-${index}`}
              title={item.title}
              count={item.count}
              items={item.items}
              icon={item.icon}
              level={badgeProgramLevel?.id}
            />
          ))}
      </SidePanel>
      <ActivityPreview isOpen={previewModalOpen} handleClose={handleCloseModal} activityPath={selectedActivityPath} />
      <PrintLoadingOverlay
        isOpen={isPrintLoading}
        label={t('global.print.preparing', { defaultValue: 'Preparing print' })}
      />
    </div>
  );
};
