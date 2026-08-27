import { BadgeModel, RelatedBadgeModel } from '@/types/badge';
import { AccordionItemProps } from '@/components/AccordionItem/types';
import { ParsedContentModule } from '@/components/ActivityPageClient/types';

export interface BadgePageClientProps {
  badgeDetails: BadgeModel;
  badgeRelatedItems: RelatedBadgeModel[];
  devEnv?: boolean;
}

export interface BadgeStepClientProps {
  path?: string;
  name: string;
  description: string | undefined;
  descriptionHtml?: string;
  stepNumber: number;
  activities: AccordionItemProps[];
  contentModules?: ParsedContentModule[];
}
