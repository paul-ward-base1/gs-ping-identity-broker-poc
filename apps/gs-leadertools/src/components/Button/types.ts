import type { AriaAttributes } from 'react';
import { LinkModel } from '@/types/link';

export type ButtonIconType =
  | 'arrow-right'
  | 'eye'
  | 'cancel-filled'
  | 'caret-left'
  | 'caret-right'
  | 'caret-up'
  | 'caret-down'
  | 'arrow-square-out'
  | 'close'
  | 'printer'
  | 'clipboard-text'
  | 'filter'
  | 'download-simple';

export interface ButtonProps {
  /** Variant of the button */
  variant: 'primary' | 'secondary' | 'tertiary' | 'icon-only';
  /** How large should the button be? */
  size?: 'small' | 'large';
  /** Button contents */
  label?: string;
  /** Short label shown on mobile when both label and labelShort are provided */
  labelShort?: string;
  /** Optional aria label */
  ariaLabel?: string;
  /** Optional icon type */
  icon?: ButtonIconType;
  /** Optional disabled state */
  disabled?: boolean;
  /** Optional click handler */
  onClick?: () => void;
  /** Optional fill state */
  fill?: boolean;
  /** LinkModel object to make the button behave as a link */
  link?: LinkModel;
  /** Optional cta type */
  ctaType?: string;
  className?: string;
  count?: number;
  /** ARIA for menu/disclosure triggers. */
  ariaHasPopup?: AriaAttributes['aria-haspopup'];
  ariaExpanded?: boolean;
  ariaControls?: string;
}
