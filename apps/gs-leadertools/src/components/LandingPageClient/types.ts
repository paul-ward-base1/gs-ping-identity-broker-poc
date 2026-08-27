import { ChoiceProps } from '@/components/Choice/types';
import { SortOrder, SortType } from '@/lib/search/api/search';
import { Filter } from '@/types/filter';

export interface FilterObject {
  type: string;
  label: string;
  options: ChoiceProps[];
}
export interface SelectedFilter {
  type: string;
  values: Filter[];
}

export enum SortOptionEnum {
  ALPHABETICAL_ASC = 'alphabetical-asc',
  ALPHABETICAL_DESC = 'alphabetical-desc',
  PROGRAM_LEVEL_ASC = 'program-level-asc',
  PROGRAM_LEVEL_DESC = 'program-level-desc',
}

export interface SortOption {
  id: string;
  label: string;
  value: SortOptionEnum;
  sort: {
    type: SortType;
    order: SortOrder;
  };
}

export interface LandingPageClientProps {
  filters: FilterObject[];
  lang: string;
  pageTitle: string;
}

export interface SearchResultItem {
  path: string;
  name: string;
  theme: string;
  imagePath: string;
  programLevel?: string;
  programLevels?: string[];
  timeRange?: string;
  type?: string;
}

export type FilterType = 'programLevel' | 'theme' | 'badgeFamily';
