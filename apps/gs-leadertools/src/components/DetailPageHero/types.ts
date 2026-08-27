import { PurchaseLinkModel } from '@/types/badge';
import { ImageModel } from '@/types/image';
import { TagProps } from '@/components/Tag/types';

export interface DetailPageHeroProps {
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
  ueTitleProp?: string;
}
