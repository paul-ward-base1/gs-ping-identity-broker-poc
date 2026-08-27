import { ChoiceProps, ChoicePropsTypes } from '@/components/Choice/types';
import { Filter } from '@/types/filter';

export interface FilterProps {
  label?: string;
  headerAriaLabel?: string;
  optionType?: ChoicePropsTypes;
  options: ChoiceProps[];
  selectedOptions?: Filter[];
  optionsPosition?: 'left' | 'right';
  handleValueChange?: (value: Filter) => void;
}
