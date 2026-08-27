import { ButtonProps } from '@/components/Button/types';
import { TagProps } from '@/components/Tag/types';

export interface AccordionItemProps {
  title?: string;
  timeRange?: string;
  value?: string;
  showBullet?: boolean;
  hasAllLevels?: boolean;
  primaryButton?: ButtonProps;
  secondaryButton?: ButtonProps;
  tags?: TagProps[];
}
