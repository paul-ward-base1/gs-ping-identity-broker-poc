import React from 'react';
import { Document, Image, Page, Text, View } from '@react-pdf/renderer';
import { BadgeModel } from '@/types/badge';
import { BadgeStepClientProps } from '../BadgePageClient/types';
import { SideRailItemsProps } from '../SideRail/types';
import { TagProps } from '../Tag/types';
import { HandoutCardProps } from '../Handouts/types';
import { isRelatedBadge } from '@/utils/sideRailPrintUtils';
import { heroHeaderTint, sectionHeaderBar, styles } from './styles';
import { BRAND_SECONDARY, BRAND_TERTIARY, getPdfLevelColor, getPdfLevelTint } from './printColors';
import { printImageSrc } from '@/utils/printImageSrc';
import { normalizeClosingQuestions } from '@/utils/normalizeClosingQuestions';
import { hasDirectiveContent } from '@/utils/hasDirectiveContent';
import { PdfFooter } from './components/PdfFooter';
import { PdfDonorBlock } from './components/PdfDonorBlock';
import { PdfHtml } from './components/PdfHtml';
import { PdfDocIcon } from './components/PdfDocIcon';
import { PdfHeroShapes } from './components/PdfHeroShapes';

export interface BadgePdfTranslations {
  breadcrumb: string;
  stepsHeader: string;
  stepsText: string;
  activitiesLabel: string;
  stepCompleteLabel: string;
  forMultiLevelGroups: string;
  handoutsHeader: string;
  handoutsCount: (n: number) => string;
  handoutsSubtitle: string;
  copyright: string;
}

export interface BadgePdfDocumentProps {
  badgeDetails: BadgeModel;
  badgeSteps: BadgeStepClientProps[];
  badgeProgramLevel: TagProps;
  sideRailBoxItems: SideRailItemsProps[];
  handouts?: HandoutCardProps[];
  pageUrl: string;
  qrDataUrl: string;
  badgeImageSrc?: string;
  baseUrl?: string;
  /** Render the PDF in full color instead of the default black & white. */
  color?: boolean;
  translations: BadgePdfTranslations;
}

const StepBlock = ({
  step,
  activitiesLabel,
  stepCompleteLabel,
  baseUrl,
  color,
  tint,
}: {
  step: BadgeStepClientProps;
  activitiesLabel: string;
  stepCompleteLabel: string;
  baseUrl?: string;
  color?: boolean;
  tint?: string;
}) => (
  <View style={styles.card} wrap={false}>
    <View style={styles.stepHeader}>
      <View style={styles.stepHeaderLeft}>
        <Text
          style={
            color ? [styles.stepBubble, { backgroundColor: BRAND_SECONDARY, color: '#ffffff' }] : styles.stepBubble
          }
        >
          {step.stepNumber}
        </Text>
        <Text style={styles.stepName}>{step.name}</Text>
      </View>
      <View style={styles.stepComplete}>
        <View style={styles.checkbox} />
        <Text style={styles.stepCompleteLabel}>{stepCompleteLabel}</Text>
      </View>
    </View>
    {step.descriptionHtml ? (
      <PdfHtml html={step.descriptionHtml} baseUrl={baseUrl} color={color} />
    ) : step.description ? (
      <Text style={styles.stepDescription}>{step.description}</Text>
    ) : null}
    {step.activities.length > 0 && (
      <View style={color ? [styles.activityIdeas, { backgroundColor: tint }] : styles.activityIdeas}>
        <Text style={styles.activityIdeasLabel}>
          {activitiesLabel} ({step.activities.length})
        </Text>
        {step.activities.map((activity, idx) => (
          <View key={idx} style={styles.activityItem}>
            <View style={styles.checkboxSmall} />
            <Text style={styles.activityName}>{activity.title}</Text>
          </View>
        ))}
      </View>
    )}
  </View>
);

export const BadgePdfDocument = ({
  badgeDetails,
  badgeSteps,
  badgeProgramLevel,
  sideRailBoxItems,
  handouts,
  pageUrl,
  qrDataUrl,
  badgeImageSrc,
  baseUrl = '',
  color = false,
  translations: t,
}: BadgePdfDocumentProps) => {
  const relatedBadges = sideRailBoxItems.flatMap(item => item.items ?? []).filter(isRelatedBadge);
  const levelColor = getPdfLevelColor(badgeProgramLevel.id);
  const levelTint = getPdfLevelTint(badgeProgramLevel.id);

  const closingQuestions = normalizeClosingQuestions(badgeDetails.closingQuestionContent);
  const hasClosingQuestion = !!(badgeDetails.closingQuestionTitle || closingQuestions.length);
  const hasDirective = hasDirectiveContent(badgeDetails);

  return (
    <Document title={badgeDetails.badgeName ?? 'Badge'}>
      <Page size="LETTER" style={styles.page}>
        <View style={color ? [styles.fullHeader, heroHeaderTint(levelTint)] : styles.fullHeader}>
          {color && <PdfHeroShapes level={badgeProgramLevel.id} />}
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              {badgeImageSrc ? <Image src={printImageSrc(badgeImageSrc, color)} style={styles.badgeImage} /> : null}
              <View style={styles.headerLeftCol}>
                <Text style={styles.breadcrumb}>{t.breadcrumb}</Text>
                <Text style={styles.title}>{badgeDetails.badgeName}</Text>
                {badgeDetails.description?.html ? (
                  <PdfHtml html={badgeDetails.description.html} baseUrl={baseUrl} color={color} />
                ) : badgeDetails.description?.plaintext ? (
                  <Text style={styles.description}>{badgeDetails.description.plaintext}</Text>
                ) : null}
              </View>
            </View>
            <View style={styles.headerRight}>
              {badgeProgramLevel.level ? (
                <Text
                  style={
                    color
                      ? [
                          styles.pillProgramLevel,
                          {
                            backgroundColor: levelColor.bg,
                            color: levelColor.text,
                            borderColor: levelColor.bg,
                            paddingVertical: 3,
                          },
                        ]
                      : styles.pillProgramLevel
                  }
                >
                  {badgeProgramLevel.level}
                </Text>
              ) : null}
              {relatedBadges.length > 0 && (
                <View style={styles.relatedBox}>
                  <Text
                    style={
                      color
                        ? [styles.relatedLabel, sectionHeaderBar(levelColor.bg, levelColor.text, 6, 3)]
                        : styles.relatedLabel
                    }
                  >
                    {t.forMultiLevelGroups}
                  </Text>
                  {relatedBadges.map(badge => (
                    <View key={badge.badgeId} style={styles.relatedItem}>
                      <Text style={styles.relatedName}>{badge.badgeName}</Text>
                      <Text style={styles.relatedLevel}>{badge.programLevel?.level}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        </View>

        {hasDirective && (
          <View style={[styles.block, styles.directiveBlock]} wrap={false}>
            {!!badgeDetails.directiveTitle && <Text style={styles.sectionTitle}>{badgeDetails.directiveTitle}</Text>}
            {badgeDetails.directiveDescription?.html ? (
              <PdfHtml html={badgeDetails.directiveDescription.html} baseUrl={baseUrl} color={color} />
            ) : null}
          </View>
        )}

        {badgeSteps.length > 0 && (
          <Text style={styles.sectionHeading}>
            <Text style={styles.sectionTitle}>{t.stepsHeader}</Text>
            <Text style={[styles.sectionSubtitle, { paddingLeft: 6 }]}>{`   ${t.stepsText}`}</Text>
          </Text>
        )}

        {badgeSteps.map(step => (
          <View key={`step-${step.stepNumber}`} style={styles.block}>
            <StepBlock
              step={step}
              activitiesLabel={t.activitiesLabel}
              stepCompleteLabel={t.stepCompleteLabel}
              baseUrl={baseUrl}
              color={color}
              tint={levelTint}
            />
          </View>
        ))}

        {hasClosingQuestion && (
          <View style={[styles.closingQuestionBlock, styles.block]} wrap={false}>
            {badgeDetails.closingQuestionTitle ? (
              <Text style={styles.closingQuestionTitle}>{badgeDetails.closingQuestionTitle}</Text>
            ) : null}
            {badgeDetails.closingQuestionDescription?.html ? (
              <PdfHtml html={badgeDetails.closingQuestionDescription.html} baseUrl={baseUrl} color={color} />
            ) : null}
            {closingQuestions.map((question, idx) => (
              <View key={idx} style={styles.closingQuestionContent}>
                <Text
                  style={color ? [styles.closingQuestionIcon, { color: BRAND_TERTIARY }] : styles.closingQuestionIcon}
                >
                  ?
                </Text>
                <Text style={styles.closingQuestionText}>{question}</Text>
              </View>
            ))}
          </View>
        )}

        {handouts && handouts.length > 0 && (
          <View style={[styles.handoutsBlock, styles.block]} wrap={false}>
            <View style={styles.handoutsHeading}>
              <Text style={styles.handoutsTitle}>{t.handoutsHeader}</Text>
              <Text style={styles.handoutsCount}>{t.handoutsCount(handouts.length)}</Text>
            </View>
            <Text style={styles.handoutsSubtitle}>{t.handoutsSubtitle}</Text>
            <View style={styles.handoutsList}>
              {handouts.map(h => (
                <View key={h.id} style={styles.handoutItem} wrap={false}>
                  <View style={styles.handoutItemIcon}>
                    <PdfDocIcon size={12} color={color ? BRAND_TERTIARY : undefined} />
                  </View>
                  <Text style={styles.handoutName}>{h.title}</Text>
                  {(h.quantity || h.unit) && (
                    <Text style={styles.handoutUnit}>{[h.quantity, h.unit].filter(Boolean).join(' ')}</Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {badgeDetails.donors && badgeDetails.donors.length > 0 && (
          <View style={styles.block}>
            <PdfDonorBlock donors={badgeDetails.donors} baseUrl={baseUrl} color={color} />
          </View>
        )}

        <PdfFooter pageUrl={pageUrl} qrDataUrl={qrDataUrl} copyrightLine={t.copyright} />
      </Page>
    </Document>
  );
};
