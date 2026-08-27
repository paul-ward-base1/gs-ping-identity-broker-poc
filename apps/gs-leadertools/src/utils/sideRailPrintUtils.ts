import {
  SideRailBoxItem,
  SideRailRelatedBadgeItem,
} from '@/components/SideRailBox/types';

export type SideRailItem = SideRailBoxItem;

export const isRelatedBadge = (item: SideRailItem): item is SideRailRelatedBadgeItem =>
  'badgeName' in item && typeof item.badgeName === 'string';
