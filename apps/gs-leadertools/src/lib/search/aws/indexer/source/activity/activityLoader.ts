import { DataLoader } from '@/lib/search/aws/indexer/source/dataLoader';
import { DESCRIPTION_FIELD, NAME_FIELD } from '@/lib/search/aws/indexer/source/common';
import { Locale } from '@/lib/locale';
import { ActivityDocument } from '@/lib/search/aws/indexer/source/activity/activityDocument';
import { fetchActivities } from '@/apis/activities';
import { ProgramLevelFilter } from '@/types/filter';
import { ProgramLevel } from '@/lib/search/aws/indexer/source/programLevel';
import { ActivityModel } from '@/types/activity';

const MANDATORY_ACTIVITY_FIELDS = [
  NAME_FIELD,
  DESCRIPTION_FIELD,
  'image',
  'path',
];

const BADGE_FAMILY_FIELD = 'badgeFamily';
const THEME_FIELD = 'theme';

/**
 * ActivityLoader is a DataLoader for loading activity documents.
 *
 * This class extends the base DataLoader class and provides functionality
 * to load activity documents from an external source.
 * It filters out activities that do not have mandatory fields
 * and ensures that the description is non-empty.
 * It maps the raw activity data to the {@link ActivityDocument} format,
 * including extracting keywords, badge family, program level, and themes.
 *
 * @extends DataLoader<ActivityDocument>
 * @param {Map<string, ProgramLevelFilter>} programLevelFilters - A map of program level filters
 * to apply when loading activities.
 * @example
 *   const activityLoader = new ActivityLoader(programLevelFilters);
 *   const activities = await activityLoader.loadData(locale);
 * @see {@link DataLoader}
 * @see {@link ActivityDocument}
 */
export const ActivityLoader = class extends DataLoader<ActivityDocument> {

  constructor(programLevelFilters: Map<string, ProgramLevelFilter>) {
    super(programLevelFilters);
  }

  loadData = async (locale: Locale): Promise<ActivityDocument[]> => {
    const rawActivities = (await fetchActivities(locale)) as ActivityModel[];

    return rawActivities
      .filter((activity) => this.validateNonEmpty(MANDATORY_ACTIVITY_FIELDS, activity)
        && this.hasNonEmptyPlainText(activity.description))
      .map((activity) => ({
          name: activity.name,
          path: activity.path ?? '',
          description: activity.description?.plaintext ?? '',
          image: activity.image?.path ?? '',
          keywords: activity.keywords?.map((rawKeyword) => this.extractKeyword(rawKeyword)).filter((k): k is string => !!k) ?? undefined,
          badgeFamilies: this.extractNamesFrom(BADGE_FAMILY_FIELD, activity.badgeConnection),
          programLevels: this.extractProgramLevels(activity),
          themes: this.extractNamesFrom(THEME_FIELD, activity.badgeConnection),
          timeRange: activity.timeRange ?? undefined,
        } satisfies ActivityDocument),
      );
  };

  private extractProgramLevels(activity: ActivityModel): ProgramLevel[] | undefined {
    const programLevels = this.extractNames(activity.programLevel ?? [])
      ?.map(name => this.findProgramLevelByName(name))
      ?.filter((p): p is ProgramLevel => !!p);

    return programLevels && programLevels.length > 0 ? programLevels : undefined;
  }

};
