export type ChoicePropsTypes = 'checkbox' | 'radio';

export interface ChoiceProps {
  label: string;
  id: string;
  name?: string;
  value?: string;
  className?: string;
  ariaLabel?: string;
  type?: ChoicePropsTypes;
  checked?: boolean;
  disabled?: boolean;
  focus?: boolean;
  onChange?(value: boolean): void;
  onBlur?(value: boolean): void;
  onKeyDown?(event: React.KeyboardEvent<HTMLElement>): void;
}
