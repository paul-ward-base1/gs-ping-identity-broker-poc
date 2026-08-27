import {
  SideRailBoxIconType,
  SideRailBoxItem,
  SideRailBoxType,
  SideRailSectionItem,
} from '@/components/SideRailBox/types';

interface PrintButtonProps {
  label: string;
  hint: string;
}

export type SectionItemProps = SideRailSectionItem;

export interface SideRailItemsProps {
  id: string;
  type: SideRailBoxType;
  icon: SideRailBoxIconType;
  title: string;
  count?: number;
  items?: SideRailBoxItem[];
}

export interface SideRailProps {
  items?: SideRailItemsProps[];
  printButtonProps?: PrintButtonProps;
  badgeProgramLevel?: string;
  handlePrintClick?: () => void;
  printDisabled?: boolean;
  hidePrint?: boolean;
  /** When provided, the print button becomes a B&W / color dropdown that prints in the chosen mode. */
  onPrintColor?: (color: boolean) => void;
  printColorOptionLabels?: { blackWhite: string; color: string };
}
