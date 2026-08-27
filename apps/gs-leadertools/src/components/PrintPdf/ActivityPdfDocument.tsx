import React from 'react';
import { Document, Image, Page, Text, View } from '@react-pdf/renderer';
import { ActivityModel } from '@/types/activity';
import { ContentModulesTypes } from '@/types/contentModules';
import { ProgramLevelIds } from '@/types/programLevel';
import { SideRailItemsProps } from '../SideRail/types';
import { SideRailBoxType } from '../SideRailBox/types';
import { TagProps } from '../Tag/types';
import { HandoutCardProps } from '../Handouts/types';
import {
  ParsedAccordionContent,
  ParsedContentModule,
  ParsedImageContent,
  ParsedRichTextContent,
} from '../ActivityPageClient/types';
import { isRelatedBadge } from '@/utils/sideRailPrintUtils';
import { heroHeaderTint, sectionHeaderBar, styles } from './styles';
import { normalizeClosingQuestions } from '@/utils/normalizeClosingQuestions';
import { PdfFooter } from './components/PdfFooter';
import { PdfDonorBlock } from './components/PdfDonorBlock';
import { PdfHtml } from './components/PdfHtml';
import { PdfDocIcon } from './components/PdfDocIcon';
import { PdfHeroShapes } from './components/PdfHeroShapes';
import { buildImagePath } from '@/utils/buildImagePath';
import { BRAND_SECONDARY, BRAND_TERTIARY, getPdfLevelColor, getPdfLevelTint } from './printColors';
import { printImageSrc } from '@/utils/printImageSrc';

export interface ActivityPdfTranslations {
  breadcrumb: string;
  associatedBadgesLabel: string;
  suppliesHeader: string;
  suppliesCount: (n: number) => string;
  optionalLabel: string;
  unitLabel: (unit: string) => string;
  handoutsHeader: string;
  handoutsCount: (n: number) => string;
  handoutsSubtitle: string;
  closingQuestionDefaultTitle: string;
  copyright: string;
}

export interface ActivityPdfDocumentProps {
  activity: ActivityModel;
  activityContent: ParsedContentModule[];
  programLevels: TagProps[];
  sideRailBoxItems: SideRailItemsProps[];
  handouts?: HandoutCardProps[];
  theme?: string;
  pageUrl: string;
  qrDataUrl: string;
  baseUrl?: string;
  /** Render the PDF in full color instead of the default black & white. */
  color?: boolean;
  translations: ActivityPdfTranslations;
}

const stripHtml = (html?: string): string =>
  (html ?? '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim();

const NumberedItem = ({ number, text, color }: { number: number; text: string; color?: boolean }) => (
  <View style={styles.numberedItem} wrap={false}>
    <Text
      style={
        color ? [styles.numberBubble, { backgroundColor: BRAND_SECONDARY, color: '#ffffff' }] : styles.numberBubble
      }
    >
      {number}
    </Text>
    <Text style={styles.numberedItemText}>{text}</Text>
  </View>
);

export const ActivityPdfDocument = ({
  activity,
  activityContent,
  programLevels,
  sideRailBoxItems,
  handouts,
  theme,
  pageUrl,
  qrDataUrl,
  baseUrl = '',
  color = false,
  translations: t,
}: ActivityPdfDocumentProps) => {
  const associatedBadgesBox = sideRailBoxItems.find(b => b.type === SideRailBoxType.ASSOCIATED_BADGES);
  const associatedBadges = (associatedBadgesBox?.items ?? []).filter(isRelatedBadge);
  // Multiple program levels theme as "multi" (grey), like the web.
  const resolvedLevelId = programLevels.length > 1 ? ProgramLevelIds.MULTI : programLevels[0]?.id;
  const levelColor = getPdfLevelColor(resolvedLevelId);
  const levelTint = getPdfLevelTint(resolvedLevelId);

  const requiredSupplies = (activity.materials ?? []).filter(m => !m.optional);
  const optionalSupplies = (activity.materials ?? []).filter(m => m.optional);
  const totalSupplies = requiredSupplies.length + optionalSupplies.length;
  const visibleContent = activityContent.filter(m => m.type !== ContentModulesTypes.VideoModel);

  const closingQuestions = normalizeClosingQuestions(activity.closingQuestionContent);
  const hasClosingQuestion = !!(
    activity.closingQuestionTitle ||
    closingQuestions.length ||
    activity.closingQuestionDescription?.html
  );

  const badgeName = activity.badgeConnection?.[0]?.badgeName ?? theme ?? '';
  const breadcrumbLine = badgeName ? `${t.breadcrumb} — ${badgeName}` : t.breadcrumb;

  const renderContentModule = (module: ParsedContentModule, key: string) => {
    if (module.type === ContentModulesTypes.AccordionModel) {
      const acc = module as ParsedAccordionContent;
      return (
        <View key={key} style={[styles.card, styles.block]} wrap>
          {acc.title ? <Text style={styles.cardTitle}>{acc.title}</Text> : null}
          {acc.header ? <Text style={styles.cardDescription}>{acc.header}</Text> : null}
          {(acc.items ?? []).map((item, idx) => (
            <NumberedItem key={idx} number={idx + 1} text={stripHtml(item.value)} color={color} />
          ))}
        </View>
      );
    }

    if (module.type === ContentModulesTypes.RichTextModel) {
      const rt = module as ParsedRichTextContent;
      return (
        <View key={key} style={[styles.card, styles.block]} wrap>
          <PdfHtml html={rt.content} baseUrl={baseUrl} color={color} />
        </View>
      );
    }

    if (module.type === ContentModulesTypes.ImageModel) {
      const img = module as ParsedImageContent;
      const imgProxied = img.file?.path ? buildImagePath(img.file.path) : '';
      const src = imgProxied ? `${baseUrl}${imgProxied.startsWith('/') ? imgProxied : `/${imgProxied}`}` : '';
      return src ? (
        <View key={key} style={styles.block} wrap={false}>
          <Image src={printImageSrc(src, color)} style={styles.contentImage} />
        </View>
      ) : null;
    }

    return null;
  };

  return (
    <Document title={activity.name ?? 'Activity'}>
      <Page size="LETTER" style={styles.page}>
        <View style={color ? [styles.fullHeader, heroHeaderTint(levelTint)] : styles.fullHeader}>
          {color && <PdfHeroShapes level={resolvedLevelId} />}
          <View style={styles.headerRow}>
            <View style={styles.headerLeftCol}>
              <Text style={styles.breadcrumb}>{breadcrumbLine}</Text>
              <Text style={styles.title}>{activity.name}</Text>
              {activity.description?.html ? (
                <PdfHtml html={activity.description.html} baseUrl={baseUrl} color={color} />
              ) : activity.description?.plaintext ? (
                <Text style={styles.description}>{activity.description.plaintext}</Text>
              ) : null}
              {activity.timeRange ? (
                <View
                  style={
                    color
                      ? [styles.timeRange, { backgroundColor: levelColor.bg, borderColor: levelColor.bg }]
                      : styles.timeRange
                  }
                >
                  <Text style={color ? [styles.timeText, { color: levelColor.text }] : styles.timeText}>
                    {activity.timeRange}
                  </Text>
                </View>
              ) : null}
            </View>
            <View style={styles.headerRight}>
              {programLevels.length > 0 && (
                <View style={styles.programLevelsRow}>
                  {programLevels.map(pl => {
                    const lc = getPdfLevelColor(pl.id);
                    return (
                      <Text
                        key={pl.level}
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
                        {pl.level}
                      </Text>
                    );
                  })}
                </View>
              )}
              {associatedBadges.length > 0 && (
                <View style={styles.relatedBox}>
                  <Text
                    style={
                      color
                        ? [styles.relatedLabel, sectionHeaderBar(levelColor.bg, levelColor.text, 6, 3)]
                        : styles.relatedLabel
                    }
                  >
                    {t.associatedBadgesLabel}
                  </Text>
                  {associatedBadges.map(badge => (
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

        {totalSupplies > 0 && (
          <View
            style={
              color ? [styles.supplies, styles.block, { backgroundColor: levelTint }] : [styles.supplies, styles.block]
            }
            wrap={false}
          >
            <View style={styles.suppliesHeading}>
              <Text style={styles.handoutsTitle}>{t.suppliesHeader}</Text>
              <Text style={styles.handoutsCount}>{t.suppliesCount(totalSupplies)}</Text>
            </View>
            <View style={styles.suppliesCols}>
              <View style={styles.suppliesCol}>
                {requiredSupplies.map((mat, idx) => (
                  <View key={idx} style={styles.supplyItem}>
                    <View style={styles.checkboxSmall} />
                    <Text style={styles.supplyLabel}>{mat.label}</Text>
                    {mat.quantity ? (
                      <Text style={styles.supplyQuantity}>
                        {mat.quantity} {mat.unit ? t.unitLabel(mat.unit) : ''}
                      </Text>
                    ) : null}
                  </View>
                ))}
                <View style={styles.supplyItem}>
                  <View style={styles.checkboxSmall} />
                  <View style={styles.supplyBlankLine} />
                </View>
                <View style={styles.supplyItem}>
                  <View style={styles.checkboxSmall} />
                  <View style={styles.supplyBlankLine} />
                </View>
              </View>
              {optionalSupplies.length > 0 && (
                <>
                  <View style={styles.suppliesDivider} />
                  <View style={styles.suppliesCol}>
                    <Text style={styles.suppliesOptionalLabel}>{t.optionalLabel}</Text>
                    {optionalSupplies.map((mat, idx) => (
                      <View key={idx} style={styles.supplyItem}>
                        <View style={styles.checkboxSmall} />
                        <Text style={styles.supplyLabel}>{mat.label}</Text>
                        {mat.quantity ? (
                          <Text style={styles.supplyQuantity}>
                            {mat.quantity} {mat.unit ? t.unitLabel(mat.unit) : ''}
                          </Text>
                        ) : null}
                      </View>
                    ))}
                  </View>
                </>
              )}
            </View>
          </View>
        )}

        {visibleContent.map((module, idx) => renderContentModule(module, `module-${module.id ?? idx}`))}

        {hasClosingQuestion && (
          <View style={[styles.card, styles.block]} wrap={false}>
            <Text style={styles.cardTitle}>{activity.closingQuestionTitle ?? t.closingQuestionDefaultTitle}</Text>
            {activity.closingQuestionDescription?.html ? (
              <PdfHtml html={activity.closingQuestionDescription.html} baseUrl={baseUrl} color={color} />
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

        {activity.donors && activity.donors.length > 0 && (
          <View style={styles.block}>
            <PdfDonorBlock donors={activity.donors} baseUrl={baseUrl} color={color} />
          </View>
        )}

        <PdfFooter pageUrl={pageUrl} qrDataUrl={qrDataUrl} copyrightLine={t.copyright} />
      </Page>
    </Document>
  );
};
