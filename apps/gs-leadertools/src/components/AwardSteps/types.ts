import { AwardStepClientProps } from '@/components/AwardStep/types';

export interface AwardStepsProps {
  badgeProgramLevel: string;
  accordionTitle?: string;
  description?: string;
  title?: string;
  printAction?: boolean;
  steps?: AwardStepClientProps[];
}
