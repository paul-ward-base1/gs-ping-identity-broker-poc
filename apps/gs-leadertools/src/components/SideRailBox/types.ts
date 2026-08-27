import { HandoutCardProps } from '@/components/Handouts/types';
import { MaterialModel } from '@/types/material';
import { RelatedBadgeProps } from '@/components/RelatedBadge/types';

export type SideRailBoxIconType =
  | 'shield'
  | 'usersThree'
  | 'time'
  | 'sealCheck'
  | 'paintBrush'
  | 'fileText'
  | 'files'
  | 'trophy';

export enum SideRailBoxType {
  TIME = 'time',
  SECTION = 'section',
  HANDOUT = 'handout',
  HANDOUT_ITEMS = 'handout_items',
  HANDOUTS = 'handouts',
  SUPPLY = 'supply',
  RELATED_BADGES = 'relatedBadges',
  ASSOCIATED_BADGES = 'associated_Badges',
  SAFETY = 'safety',
  NEXT_AWARDS = 'nextAwards',
  MULTI_LEVEL_GROUP = 'multiLevelGroup',
}

export interface SideRailHandoutsProps {
  header: string;
  handouts: HandoutCardProps[];
}

export interface SideRailSectionItem {
  type: SideRailBoxType.SECTION | SideRailBoxType.TIME;
  value: string;
}

export type SideRailSupplyItem = MaterialModel & {
  type: SideRailBoxType.SUPPLY;
};

export type SideRailHandoutsItem = SideRailHandoutsProps & {
  type: SideRailBoxType.HANDOUT_ITEMS;
};

export type SideRailRelatedBadgeItem = RelatedBadgeProps & {
  type?: SideRailBoxType.RELATED_BADGES | SideRailBoxType.NEXT_AWARDS | SideRailBoxType.MULTI_LEVEL_GROUP;
};

export type SideRailBoxItem =
  | SideRailSectionItem
  | SideRailSupplyItem
  | SideRailHandoutsItem
  | SideRailRelatedBadgeItem;

export interface SideRailBoxProps {
  icon?: SideRailBoxIconType;
  title?: string;
  level?: string;
  count?: number;
  items?: SideRailBoxItem[];
  type?: SideRailBoxType;
  volunteers?: number;
  girlScouts?: number;
}
