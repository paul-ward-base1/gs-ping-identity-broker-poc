import { BadgeDocument, Step } from '@/lib/search/aws/indexer/source/badge/badgeDocument';
import { DataLoader } from '@/lib/search/aws/indexer/source/dataLoader';
import { DESCRIPTION_FIELD } from '@/lib/search/aws/indexer/source/common';
import { DocumentBase, MANDATORY_DOCUMENT_BASE_FIELDS } from '@/lib/search/aws/indexer/source/document';
import { Locale } from '@/lib/locale';
import { fetchBadges } from '@/apis/badges';
import { ProgramLevelFilter } from '@/types/filter';
import { BadgeModel } from '@/types/badge';
import { StepModel } from '@/types/step';
import { ActivityModel } from '@/types/activity';

const MANDATORY_BADGE_FIELDS = [
  'badgeId',
  'badgeName',
  DESCRIPTION_FIELD,
  'image',
  'path',
];

const MANDATORY_STEP_FIELDS = [
  ...MANDATORY_DOCUMENT_BASE_FIELDS,
  'activities',
];


/**
 * BadgeLoader is a DataLoader for loading badge documents.
 *
 * This class extends the base DataLoader class and provides functionality
 * to load badge documents from an external source.
 * It filters out badges that do not have mandatory fields
 * and ensures that the description is non-empty.
 * It maps the raw badge data to the {@link BadgeDocument} format,
 * including extracting keywords, family, program level, steps, and themes.
 *
 * @extends DataLoader<BadgeDocument>
 * @param {Map<string, ProgramLevelFilter>} programLevelFilters - A map of program level filters
 * to apply when loading badges.
 * @example
 *   const badgeLoader = new BadgeLoader(programLevelFilters);
 *   const badges = await badgeLoader.loadData(locale);
 * @see {@link DataLoader}
 * @see {@link BadgeDocument}
 */
export const BadgeLoader = class extends DataLoader<BadgeDocument> {

  constructor(programLevelFilters: Map<string, ProgramLevelFilter>) {
    super(programLevelFilters);
  }

  loadData = async (locale: Locale): Promise<BadgeDocument[]> => {
    const rawBadges = (await fetchBadges(locale)) as BadgeModel[];

    return rawBadges
      .filter((badge) => this.validateNonEmpty(MANDATORY_BADGE_FIELDS, badge)
        && this.hasNonEmptyPlainText(badge.description))
      .map((badge) => ({
          id: badge.badgeId ?? '',
          name: badge.badgeName ?? '',
          path: badge.path ?? '',
          description: badge.description?.plaintext ?? '',
          image: badge.image?.path ?? '',
          keywords: badge.keywords?.map((rawKeyword) => this.extractKeyword(rawKeyword)).filter((k): k is string => !!k) ?? undefined,
          family: badge.badgeFamily?.name ?? undefined,
          programLevel: this.findProgramLevelByName(badge.programLevel?.name),
          steps: this.extractSteps(badge.steps),
          theme: badge.theme?.name ?? undefined,
        } satisfies BadgeDocument),
      );
  };

  private extractActivities(rawActivities: ActivityModel[] = []): DocumentBase[] | undefined {
    const activities = rawActivities
      .filter((rawActivity) => this.validateNonEmpty(MANDATORY_DOCUMENT_BASE_FIELDS, rawActivity)
        && this.hasNonEmptyPlainText(rawActivity.description))
      .map((rawActivity) => {
        return {
          name: rawActivity.name,
          description: rawActivity.description ? this.extractPlainTextFrom(rawActivity.description) : '',
        };
      });

    return activities.length ? activities : undefined;
  };

  private extractSteps(rawSteps: StepModel[] = []): Step[] | undefined {
    const steps = rawSteps
      .filter((rawStep) => this.validateNonEmpty(MANDATORY_STEP_FIELDS, rawStep)
        && this.hasNonEmptyPlainText(rawStep.description))
      .map((rawStep) => {
        return {
          name: rawStep.name,
          description: rawStep.description ? this.extractPlainTextFrom(rawStep.description) : '',
          activities: this.extractActivities(rawStep.activities),
        };
      });

    return steps.length ? steps : undefined;
  };

};
