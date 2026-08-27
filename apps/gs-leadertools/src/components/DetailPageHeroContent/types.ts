import { ImageModel } from '@/types/image';
import { PurchaseLinkModel } from '@/types/badge';
import { TagProps } from '@/components/Tag/types';

export interface DetailPageHeroContentProps {
  image?: ImageModel;
  imageAlt?: string;
  programLevels: TagProps[];
  theme?: string;
  title: string;
  description: string;
  descriptionHtml?: string;
  primaryButton?: PurchaseLinkModel;
  secondaryButtonLabel?: string;
  secondaryButtonAriaLabel?: string;
  secondaryButtonClick?: () => void;
  /** UE field name for the title — defaults to 'badgeName' (badge CF), pass 'name' for activity CF */
  ueTitleProp?: string;
}
