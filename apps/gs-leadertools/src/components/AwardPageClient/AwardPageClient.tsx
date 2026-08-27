'use client';

import { cloneElement, useMemo, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { cn } from '@/utils/classNames';
import { SideRail } from '@/components/SideRail';
import { SideRailBox } from '@/components/SideRailBox';
import { SidePanel } from '@/components/SidePanel';
import { PrintMenu } from '@/components/PrintMenu';
import { AwardSteps } from '@/components/AwardSteps';
import { ClosingQuestion } from '@/components/ClosingQuestion';
import { Handouts } from '@/components/Handouts';
import { DonorRecognition } from '@/components/DonorRecognition';
import { DetailPageLayout } from '@/components/DetailPageLayout';
import { DetailPageHero } from '@/components/DetailPageHero';
import { DirectiveContent } from '@/components/DirectiveContent';
import { ActivityPreview } from '@/components/BadgePageClient/ActivityPreview';
import { usePrintShortcut } from '@/utils/usePrintShortcut';
import { usePrintWithLoading } from '@/utils/usePrintWithLoading';
import { PrintLoadingOverlay } from '@/components/PrintLoadingOverlay';
import { normalizeAwardPath } from '@/lib/aemContext';
import { useCrossDomainTracker } from '@/utils/useCrossDomainTracker';
import { useStepsLinkTracker } from '@/utils/useStepsLinkTracker';
import { useIsAuthorMode } from '@/components/contexts/locale-context';
import { hasDirectiveContent } from '@/utils/hasDirectiveContent';

import { AwardPageClientProps } from './types';
import { useAwardPageClient } from './useAwardPageClient';
import './AwardPageClient.scss';

const bem = cn('award-details-page');

export const AwardPageClient = (props: AwardPageClientProps) => {
  const { t } = useTranslation();
  const isAuthorMode = useIsAuthorMode();
  const { awardDetails } = props;
  const {
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
  } = useAwardPageClient(props);

  const routeParams = useParams<{ lang?: string }>();

  // `/{locale}/award/{slug}` or `/{locale}/award/{level}/{slug}` — same as the
  // page route so print and page always resolve to the same content.
  const pdfUrl = useMemo(() => {
    try {
      const normalized = normalizeAwardPath(awardDetails.path);
      const parts = normalized.split('/').filter(Boolean);
      const langFromPath = parts[0];
      const tail = parts.slice(2);
      const lang = routeParams?.lang ?? langFromPath ?? 'en';
      if (tail.length === 0) return null;
      return `/api/print/award/${lang}/${tail.join('/')}`;
    } catch {
      return null;
    }
  }, [awardDetails.path, routeParams?.lang]);

  const { handlePrint, isPrintLoading, printDisabled } = usePrintWithLoading(pdfUrl);

  usePrintShortcut(handlePrint);
  useCrossDomainTracker(containerRef);

  const stepsRef = useRef<HTMLDivElement>(null);
  useStepsLinkTracker(stepsRef);

  const visibleDonors = donors?.filter(d => !d.hidden) ?? [];
  const hasDirective = hasDirectiveContent(awardDetails);
  const hasExtras = !!closingQuestion || !!handouts?.length || visibleDonors.length > 0;

  const aueProps =
    isAuthorMode && awardDetails.path
      ? {
          'data-aue-resource': `urn:aemconnection:${awardDetails.path}/jcr:content/data/master`,
          'data-aue-type': 'reference' as const,
          'data-aue-label': awardDetails.badgeName,
        }
      : {};

  return (
    <div ref={containerRef} className={bem()}>
      <DetailPageLayout>
        <>
          <div {...aueProps} className={bem('hero-wrapper')}>
            <DetailPageHero
              image={awardDetails.image || undefined}
              imageAlt={awardDetails.badgeName}
              programLevels={awardProgramLevelTags}
              theme={awardDetails.theme?.name}
              title={awardDetails.badgeName ?? ''}
              description={awardDetails.description?.plaintext ?? ''}
              descriptionHtml={awardDetails.description?.html}
              primaryButton={awardDetails.purchaseLink ?? undefined}
              secondaryButtonLabel={t('awardDetailPage.button.awardPreparation.label', {
                defaultValue: 'View award preparation',
              })}
              secondaryButtonAriaLabel={t('awardDetailPage.button.awardPreparation.ariaLabelFormat', {
                label: t('awardDetailPage.button.awardPreparation.label', { defaultValue: 'View award preparation' }),
                name: awardDetails.badgeName,
                defaultValue: `View award preparation for ${awardDetails.badgeName}`,
              })}
              secondaryButtonClick={toggleSidePanel}
            />
          </div>

          {hasDirective && (
            <div className={bem('directive')}>
              <DirectiveContent
                title={awardDetails.directiveTitle}
                descriptionHtml={awardDetails.directiveDescription?.html}
              />
            </div>
          )}

          <div className={bem('data', { 'no-extras': !hasExtras })}>
            {!!awardSteps?.length && (
              <div className={bem('steps')} ref={stepsRef}>
                <AwardSteps
                  title={t('awardDetailPage.section.steps.header', { defaultValue: 'Steps to earn this award' })}
                  description={
                    awardSteps.length > 1
                      ? t('awardDetailPage.section.steps.textFormat.plural', {
                          count: awardSteps.length,
                          defaultValue: `It takes ${awardSteps.length} steps to earn this award.`,
                        })
                      : t('awardDetailPage.section.steps.textFormat.singular', {
                          count: awardSteps.length,
                          defaultValue: 'It takes 1 step to earn this award.',
                        })
                  }
                  steps={awardSteps}
                  accordionTitle={t('awardDetailPage.section.steps.activities.header', {
                    defaultValue: 'Activity ideas',
                  })}
                  badgeProgramLevel={awardProgramLevel?.id}
                />
              </div>
            )}
          </div>

          {hasExtras && (
            <div className={bem('extras')}>
              {!!closingQuestion && (
                <ClosingQuestion
                  title={closingQuestion.title}
                  description={closingQuestion.descriptionHtml}
                  questionText={closingQuestion.questions[0] ?? ''}
                  questions={closingQuestion.questions}
                  uePath={closingQuestion.uePath}
                  ueLabel={closingQuestion.ueLabel}
                />
              )}
              {!!handouts?.length && (
                <Handouts
                  title={t('awardDetailPage.section.relatedHandouts.header', {
                    defaultValue: 'Related Handouts',
                  })}
                  cards={handouts}
                />
              )}
              {visibleDonors.length > 0 && (
                <div className={bem('donor', { level: awardProgramLevel?.id })}>
                  <DonorRecognition donors={visibleDonors} />
                </div>
              )}
            </div>
          )}
        </>
        {cloneElement(
          <SideRail
            items={sideRailBoxItems}
            badgeProgramLevel={awardProgramLevel.id}
            handlePrintClick={handlePrint}
            printButtonProps={printButtonProps}
            printDisabled={printDisabled || !pdfUrl}
            onPrintColor={handlePrint}
            printColorOptionLabels={{
              blackWhite: t('global.button.printBlackWhite.label', { defaultValue: 'Black and White' }),
              color: t('global.button.printColor.label', { defaultValue: 'Color' }),
            }}
          />,
          { slot: 'sidebar' }
        )}
      </DetailPageLayout>
      <SidePanel
        programLevel={awardProgramLevel?.id}
        title={t('awardDetailPage.sideRail.header', { defaultValue: 'Award preparation' })}
        isOpen={sidePanelExpanded}
        onClose={toggleSidePanel}
        closeButtonAreaLabel={t('global.button.close.hint')}
      >
        <div className={bem('mobile-print')}>
          <PrintMenu
            triggerLabel={printButtonProps.label}
            triggerAriaLabel={printButtonProps.hint}
            disabled={printDisabled || !pdfUrl}
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
              level={awardProgramLevel?.id}
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
