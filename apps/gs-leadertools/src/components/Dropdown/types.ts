import { ChoiceProps, ChoicePropsTypes } from '@/components/Choice/types';

export interface DropdownProps {
  defaultValue?: string;
  value?: string;
  headerAriaLabel?: string;
  optionType?: ChoicePropsTypes;
  options: ChoiceProps[];
  optionsPosition?: 'left' | 'right';
  handleValueChange?: (value: string) => void;
}
