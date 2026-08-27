import { ButtonProps } from '@/components/Button/types';

const printButton: ButtonProps = {
  label: 'Print Page',
  variant: 'tertiary',
  size: 'small',
  icon: 'printer',
  ariaLabel: '',
};

export const defaultSidePanelProps = {
  title: 'ActivityPreview',
  printButton,
  isOpen: false,
};
