import { BadgeStepClientProps } from '@/components/BadgePageClient/types';

export interface BadgeStepsProps {
  badgeProgramLevel: string;
  accordionTitle?: string;
  description?: string;
  title?: string;
  printAction?: boolean;
  steps?: BadgeStepClientProps[];
}
