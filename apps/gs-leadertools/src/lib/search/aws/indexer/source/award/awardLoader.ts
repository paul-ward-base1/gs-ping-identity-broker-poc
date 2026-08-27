import { DataLoader } from '@/lib/search/aws/indexer/source/dataLoader';
import { DESCRIPTION_FIELD } from '@/lib/search/aws/indexer/source/common';
import { AwardDocument } from '@/lib/search/aws/indexer/source/award/awardDocument';
import { Locale } from '@/lib/locale';
import { fetchAwards } from '@/apis/awards';
import { ProgramLevelFilter } from '@/types/filter';
import { AwardModel } from '@/types/award';
import { ProgramLevel } from '@/lib/search/aws/indexer/source/programLevel';

const MANDATORY_AWARD_FIELDS = ['badgeId', 'badgeName', DESCRIPTION_FIELD, 'image', 'path'];

export const AwardLoader = class extends DataLoader<AwardDocument> {
  constructor(programLevelFilters: Map<string, ProgramLevelFilter>) {
    super(programLevelFilters);
  }

  loadData = async (locale: Locale): Promise<AwardDocument[]> => {
    const rawAwards = (await fetchAwards(locale)) as AwardModel[];

    return rawAwards
      .filter(
        award => this.validateNonEmpty(MANDATORY_AWARD_FIELDS, award) && this.hasNonEmptyPlainText(award.description)
      )
      .map(
        award =>
          ({
            id: award.badgeId ?? '',
            name: award.badgeName ?? '',
            path: award.path ?? '',
            description: award.description?.plaintext ?? '',
            image: award.image?.path ?? '',
            keywords:
              award.keywords?.map(rawKeyword => this.extractKeyword(rawKeyword)).filter((k): k is string => !!k) ??
              undefined,
            family: award.badgeFamily?.name ?? undefined,
            programLevels: this.extractProgramLevels(award),
            theme: award.theme?.name ?? undefined,
          }) satisfies AwardDocument
      );
  };

  private extractProgramLevels(award: AwardModel): ProgramLevel[] | undefined {
    const programLevels = this.extractNames(award.programLevel ?? [])
      ?.map(name => this.findProgramLevelByName(name))
      ?.filter((p): p is ProgramLevel => !!p);

    return programLevels && programLevels.length > 0 ? programLevels : undefined;
  }
};
