import React from 'react';
import { Document, Image, Page, Text, View } from '@react-pdf/renderer';
import { AwardModel } from '@/types/award';
import { ContentModulesTypes } from '@/types/contentModules';
import { ParsedContentModule } from '@/components/ActivityPageClient/types';
import { AwardStepClientProps } from '@/components/AwardStep/types';
import { SideRailItemsProps } from '@/components/SideRail/types';
import { TagProps } from '@/components/Tag/types';
import { HandoutCardProps } from '@/components/Handouts/types';
import { AwardClosingQuestionsClientProps } from '@/components/AwardPageClient/awardData';
import { isRelatedBadge } from '@/utils/sideRailPrintUtils';
import { SideRailBoxType } from '@/components/SideRailBox/types';
import { buildImagePath } from '@/utils/buildImagePath';
import { toTintProxyPath } from '@/utils/toTintProxyPath';
import { printImageSrc } from '@/utils/printImageSrc';
import { resolveBaseUrl } from './resolveBaseUrl';
import { heroHeaderTint, sectionHeaderBar, styles } from './styles';
import { BRAND_SECONDARY, BRAND_TERTIARY, getPdfIconColor, getPdfLevelColor, getPdfLevelTint } from './printColors';
import { PdfFooter } from './components/PdfFooter';
import { PdfDonorBlock } from './components/PdfDonorBlock';
import { PdfHtml } from './components/PdfHtml';
import { PdfDocIcon } from './components/PdfDocIcon';
import { PdfHeroShapes } from './components/PdfHeroShapes';
import { hasDirectiveContent } from '@/utils/hasDirectiveContent';

export interface AwardPdfTranslations {
  breadcrumb: string;
  stepsHeader: string;
  stepsText: string;
  activitiesLabel: string;
  stepCompleteLabel: string;
  forMultiLevelGroups: string;
  nextAwardLabel: string;
  handoutsHeader: string;
  handoutsCount: (n: number) => string;
  handoutsSubtitle: string;
  copyright: string;
}

export interface AwardPdfDocumentProps {
  awardDetails: AwardModel;
  awardSteps: AwardStepClientProps[];
  awardProgramLevel: TagProps;
  awardProgramLevelTags: TagProps[];
  closingQuestion: AwardClosingQuestionsClientProps | null;
  sideRailBoxItems: SideRailItemsProps[];
  handouts?: HandoutCardProps[];
  pageUrl: string;
  qrDataUrl: string;
  awardImageSrc?: string;
  baseUrl?: string;
  /** Render the PDF in full color instead of the default black & white. */
  color?: boolean;
  translations: AwardPdfTranslations;
}

const resolveCalloutIconSrc = (
  iconPath: string | undefined,
  baseUrl: string | undefined,
  color: boolean,
  iconHex?: string
) => {
  if (!iconPath) return undefined;
  const base = buildImagePath(iconPath);
  // Color + SVG → recolor to the level color (web masks the SVG); otherwise grayscale/passthrough.
  const isSvg = /\.svg(\?|$)/i.test(iconPath);
  const proxied = color && isSvg ? toTintProxyPath(base, iconHex) : printImageSrc(base, color);
  const origin = resolveBaseUrl(baseUrl);
  return origin ? `${origin}${proxied}` : proxied;
};

const ContentModuleBlock = ({
  module,
  baseUrl,
  color = false,
  tint,
  iconHex,
}: {
  module: ParsedContentModule;
  baseUrl?: string;
  color?: boolean;
  tint?: string;
  iconHex?: string;
}) => {
  switch (module.type) {
    case ContentModulesTypes.CalloutModel: {
      const iconSrc = resolveCalloutIconSrc(module.iconPath, baseUrl, color, iconHex);
      return (
        <View style={styles.calloutPdfBlock} wrap={false}>
          <View style={styles.calloutPdfRow}>
            {iconSrc && (
              <View style={color ? [styles.calloutPdfIcon, { backgroundColor: tint }] : styles.calloutPdfIcon}>
                <Image src={iconSrc} style={styles.calloutPdfIconImg} />
              </View>
            )}
            <View style={styles.calloutPdfContent}>
              {!!module.title && <Text style={styles.calloutPdfTitle}>{module.title}</Text>}
              {module.descriptionHtml ? (
                <PdfHtml html={module.descriptionHtml} baseUrl={baseUrl} color={color} />
              ) : null}
            </View>
          </View>
        </View>
      );
    }
    case ContentModulesTypes.RichTextModel:
      return module.content ? <PdfHtml html={module.content} baseUrl={baseUrl} color={color} /> : null;
    case ContentModulesTypes.AccordionModel: {
      const html = (module.items ?? [])
        .map(item => ('value' in item ? item.value : ''))
        .filter(Boolean)
        .join('');
      return (
        <View style={styles.calloutPdfBlock}>
          {!!module.title && <Text style={styles.calloutPdfTitle}>{module.title}</Text>}
          {!!module.header && <Text style={styles.calloutPdfSubtitle}>{module.header}</Text>}
          {!!html && <PdfHtml html={html} baseUrl={baseUrl} color={color} />}
        </View>
      );
    }
    case ContentModulesTypes.FileModel:
      // `wrap={false}` keeps the file card atomic at page boundaries.
      return (
        <View style={styles.filePdfBlock} wrap={false}>
          <View style={styles.filePdfIcon}>
            <PdfDocIcon size={12} color={color ? BRAND_TERTIARY : undefined} />
          </View>
          <Text style={styles.filePdfTitle}>{module.title ?? ''}</Text>
        </View>
      );
    case ContentModulesTypes.ImageModel:
      return null;
    case ContentModulesTypes.VideoModel:
      return module.title ? <Text style={styles.stepDescription}>{module.title}</Text> : null;
    default:
      return null;
  }
};

const StepBlock = ({
  step,
  activitiesLabel,
  stepCompleteLabel,
  baseUrl,
  color = false,
  tint,
  iconHex,
}: {
  step: AwardStepClientProps;
  activitiesLabel: string;
  stepCompleteLabel: string;
  baseUrl?: string;
  color?: boolean;
  tint?: string;
  iconHex?: string;
}) => (
  // The card wraps freely so long steps break across pages; only the header
  // is wrap={false} so the step number + title stay glued to its content.
  <View style={styles.card}>
    <View style={styles.stepHeader} wrap={false}>
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
    {step.contentModules?.map(module => (
      <View key={`${module.type}-${module.id}`} style={styles.contentModuleBlock}>
        <ContentModuleBlock module={module} baseUrl={baseUrl} color={color} tint={tint} iconHex={iconHex} />
      </View>
    ))}
  </View>
);

export const AwardPdfDocument = ({
  awardDetails,
  awardSteps,
  awardProgramLevel,
  awardProgramLevelTags,
  closingQuestion,
  sideRailBoxItems,
  handouts,
  pageUrl,
  qrDataUrl,
  awardImageSrc,
  baseUrl = '',
  color = false,
  translations: t,
}: AwardPdfDocumentProps) => {
  const allBadgeRows = sideRailBoxItems.flatMap(item => item.items ?? []).filter(isRelatedBadge);
  const nextAwards = allBadgeRows.filter(row => row.type === SideRailBoxType.NEXT_AWARDS);
  const relatedAwards = allBadgeRows.filter(row => row.type === SideRailBoxType.MULTI_LEVEL_GROUP);
  const tagsToShow = awardProgramLevelTags.length > 0 ? awardProgramLevelTags : [awardProgramLevel];
  const hasDirective = hasDirectiveContent(awardDetails);
  const levelColor = getPdfLevelColor(awardProgramLevel.id);
  const levelTint = getPdfLevelTint(awardProgramLevel.id);

  return (
    <Document title={awardDetails.badgeName ?? 'Award'}>
      <Page size="LETTER" style={styles.page}>
        <View style={color ? [styles.fullHeader, heroHeaderTint(levelTint)] : styles.fullHeader}>
          {color && <PdfHeroShapes level={awardProgramLevel.id} />}
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              {awardImageSrc ? <Image src={printImageSrc(awardImageSrc, color)} style={styles.badgeImage} /> : null}
              <View style={styles.headerLeftCol}>
                <Text style={styles.breadcrumb}>{t.breadcrumb}</Text>
                <Text style={styles.title}>{awardDetails.badgeName}</Text>
                {awardDetails.description?.html ? (
                  <PdfHtml html={awardDetails.description.html} baseUrl={baseUrl} color={color} />
                ) : awardDetails.description?.plaintext ? (
                  <Text style={styles.description}>{awardDetails.description.plaintext}</Text>
                ) : null}
              </View>
            </View>
            <View style={styles.headerRight}>
              <View style={styles.programLevelsRow}>
                {tagsToShow
                  .filter(tag => !!tag.level)
                  .map(tag => {
                    const lc = getPdfLevelColor(tag.id);
                    return (
                      <Text
                        key={`${tag.id}-${tag.level}`}
                        style={
                          color
                            ? [
                                styles.pillProgramLevel,
                                {
                                  backgroundColor: lc.bg,
                                  color: lc.text,
                                  borderColor: lc.bg,
                                  paddingVertical: 3,
                                },
                              ]
                            : styles.pillProgramLevel
                        }
                      >
                        {tag.level}
                      </Text>
                    );
                  })}
              </View>
              {nextAwards.length > 0 && (
                <View style={styles.relatedBox}>
                  <Text
                    style={
                      color
                        ? [styles.relatedLabel, sectionHeaderBar(levelColor.bg, levelColor.text, 6, 3)]
                        : styles.relatedLabel
                    }
                  >
                    {t.nextAwardLabel}
                  </Text>
                  {nextAwards.map(award => {
                    const levels = [
                      award.programLevel?.level,
                      ...(award.additionalProgramLevels ?? []).map(l => l.level),
                    ]
                      .filter(Boolean)
                      .join(', ');
                    return (
                      <View key={`next-${award.badgeId}`} style={styles.relatedItem}>
                        <Text style={styles.relatedName}>{award.badgeName}</Text>
                        <Text style={styles.relatedLevel}>{levels}</Text>
                      </View>
                    );
                  })}
                </View>
              )}
              {relatedAwards.length > 0 && (
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
                  {relatedAwards.map(award => {
                    const levels = [
                      award.programLevel?.level,
                      ...(award.additionalProgramLevels ?? []).map(l => l.level),
                    ]
                      .filter(Boolean)
                      .join(', ');
                    return (
                      <View key={award.badgeId} style={styles.relatedItem}>
                        <Text style={styles.relatedName}>{award.badgeName}</Text>
                        <Text style={styles.relatedLevel}>{levels}</Text>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          </View>
        </View>

        {hasDirective && (
          <View style={[styles.block, styles.directiveBlock]} wrap={false}>
            {!!awardDetails.directiveTitle && <Text style={styles.sectionTitle}>{awardDetails.directiveTitle}</Text>}
            {awardDetails.directiveDescription?.html ? (
              <PdfHtml html={awardDetails.directiveDescription.html} baseUrl={baseUrl} color={color} />
            ) : null}
          </View>
        )}

        {awardSteps.length > 0 && (
          <Text style={styles.sectionHeading}>
            <Text style={styles.sectionTitle}>{t.stepsHeader}</Text>
            <Text style={[styles.sectionSubtitle, { paddingLeft: 6 }]}>{`   ${t.stepsText}`}</Text>
          </Text>
        )}

        {awardSteps.map(step => (
          <View key={`step-${step.stepNumber}`} style={styles.block}>
            <StepBlock
              step={step}
              activitiesLabel={t.activitiesLabel}
              stepCompleteLabel={t.stepCompleteLabel}
              baseUrl={baseUrl}
              color={color}
              tint={levelTint}
              iconHex={getPdfIconColor(awardProgramLevel.id)}
            />
          </View>
        ))}

        {!!closingQuestion && (closingQuestion.title || closingQuestion.questions.length > 0) && (
          <View style={[styles.closingQuestionBlock, styles.block]} wrap={false}>
            {!!closingQuestion.title && <Text style={styles.closingQuestionTitle}>{closingQuestion.title}</Text>}
            {closingQuestion.descriptionHtml ? (
              <PdfHtml html={closingQuestion.descriptionHtml} baseUrl={baseUrl} color={color} />
            ) : null}
            {closingQuestion.questions.map((question, idx) => (
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

        {awardDetails.donors && awardDetails.donors.length > 0 && (
          <View style={styles.block}>
            <PdfDonorBlock donors={awardDetails.donors} baseUrl={baseUrl} color={color} />
          </View>
        )}

        <PdfFooter pageUrl={pageUrl} qrDataUrl={qrDataUrl} copyrightLine={t.copyright} />
      </Page>
    </Document>
  );
};
