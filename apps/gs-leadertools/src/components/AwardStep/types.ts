import { ParsedContentModule } from '@/components/ActivityPageClient/types';
import { AccordionItemProps } from '@/components/AccordionItem/types';

export interface AwardStepClientProps {
  path?: string;
  name: string;
  description: string | undefined;
  descriptionHtml?: string;
  stepNumber: number;
  activities: AccordionItemProps[];
  contentModules?: ParsedContentModule[];
}

export interface AwardStepProps {
  step: AwardStepClientProps;
  stepNumber: number;
  badgeProgramLevel: string;
  accordionTitle?: string;
  printAction?: boolean;
}
