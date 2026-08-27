import { BadgeStepClientProps } from '@/components/BadgePageClient/types';

export interface BadgeStepProps {
  step: BadgeStepClientProps;
  stepNumber: number;
  badgeProgramLevel: string;
  accordionTitle?: string;
  printAction?: boolean;
}
