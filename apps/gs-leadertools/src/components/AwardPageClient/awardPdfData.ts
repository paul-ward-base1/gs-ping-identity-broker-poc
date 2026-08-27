import { AwardModel } from '@/types/award';
import { FilterModel } from '@/types/filter';
import {
  createAwardHandouts,
  createAwardSideRailBoxItems,
  createAwardStep,
  createAwardClosingQuestions,
  resolveAwardProgramLevel,
  resolveAwardProgramLevelTags,
} from './awardData';

type Translate = (key: string, options?: Record<string, unknown>) => string;

/** Server-side data builder for the award PDF route. */
export const buildAwardPdfData = (
  awardDetails: AwardModel,
  awardRelatedItems: AwardModel[],
  allAwards: AwardModel[],
  filters: FilterModel,
  translate: Translate,
  devEnv?: boolean
) => {
  const noOpClick = () => () => undefined;

  const awardProgramLevel = resolveAwardProgramLevel(awardDetails, filters);
  const awardProgramLevelTags = resolveAwardProgramLevelTags(awardDetails, filters);
  const handouts = createAwardHandouts(awardDetails, translate);

  const awardSteps =
    awardDetails.steps?.map((step, index) =>
      createAwardStep(step, index, awardProgramLevel.id, translate, noOpClick, filters)
    ) ?? [];

  const closingQuestion = createAwardClosingQuestions(awardDetails);

  const sideRailBoxItems = createAwardSideRailBoxItems({
    translate,
    nextAwards: awardDetails.nextAwards ?? [],
    multiProgramLevel: awardRelatedItems,
    allAwards,
    aemProgramLevels: filters?.programLevels,
    handouts,
    devEnv,
  });

  return {
    awardProgramLevel,
    awardProgramLevelTags,
    awardSteps,
    closingQuestion,
    handouts,
    sideRailBoxItems,
  };
};
