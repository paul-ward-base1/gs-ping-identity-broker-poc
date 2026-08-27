import { AwardModel } from '@/types/award';

export interface AwardPageClientProps {
  awardDetails: AwardModel;
  /** Awards sharing the same `badgeFamily` — feeds the "multi-level groups" side rail box. */
  awardRelatedItems?: AwardModel[];
  /** Full awards list used to enrich `nextAwards` rows with their program level. */
  allAwards?: AwardModel[];
  devEnv?: boolean;
}
