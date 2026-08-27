import { TagProps } from '@/components/Tag/types';

export interface RelatedBadgeProps {
  badgeId: string;
  path: string;
  /** Pre-resolved href; required for non-`/badges/` paths (e.g. awards). */
  hrefOverride?: string;
  badgeName: string;
  badgeImage: string;
  programLevel: TagProps;
  additionalProgramLevels?: TagProps[];
  theme: string;
  devEnv?: boolean;
}
