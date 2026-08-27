import { ActivityModel } from '@/types/activity';
import { ContentModulesTypes, ImageFile, VideoPlatforms } from '@/types/contentModules';
import { AccordionItemProps } from '@/components/AccordionItem/types';
import { SideRailItemsProps } from '@/components/SideRail/types';
import { TagProps } from '@/components/Tag/types';
import { HandoutCardProps } from '@/components/Handouts/types';

export interface ActivityPageClientProps {
  activity: ActivityModel;
}

export interface ParsedAccordionItem {
  value: string;
  title?: string;
}

export interface ParsedAccordionContent {
  id: number;
  path?: string;
  type: ContentModulesTypes.AccordionModel;
  title?: string;
  label?: string;
  header?: string;
  level: string;
  items: ParsedAccordionItem[] | AccordionItemProps[];
  defaultOpen?: boolean;
}

export interface ParsedRichTextContent {
  id: number;
  path?: string;
  type: ContentModulesTypes.RichTextModel;
  content?: string;
}

export interface ParsedImageContent {
  id: number;
  path?: string;
  type: ContentModulesTypes.ImageModel;
  label?: string;
  file: ImageFile;
}

export interface ParsedVideoContent {
  id?: number;
  path?: string;
  type: ContentModulesTypes.VideoModel;
  title?: string;
  videoId?: string;
  platform?: VideoPlatforms;
}

export interface ParsedCalloutContent {
  id: number;
  path?: string;
  type: ContentModulesTypes.CalloutModel;
  title?: string;
  iconName?: string;
  iconPath?: string;
  descriptionHtml?: string;
  level?: string;
}

export interface ParsedFileContent {
  id: number;
  path?: string;
  type: ContentModulesTypes.FileModel;
  title?: string;
  url?: string;
  ariaLabel?: string;
}

export type ParsedContentModule =
  | ParsedAccordionContent
  | ParsedRichTextContent
  | ParsedVideoContent
  | ParsedImageContent
  | ParsedCalloutContent
  | ParsedFileContent;

export interface ActivityPagePrintProps {
  programLevel: string;
  programLevels: TagProps[];
  activity: ActivityModel;
  activityContent: ParsedContentModule[];
  theme?: string;
  sideRailBoxItems: SideRailItemsProps[];
  handouts?: HandoutCardProps[];
}
