import { BaseEntity } from '@/types/base';
import { ImageModel } from '@/types/image';
import { ClosingQuestionDescriptionModel, RelatedBadgeModel } from '@/types/badge';
import { MaterialModel } from '@/types/material';
import { FileModel } from '@/types/file';
import { LinkModel } from '@/types/link';
import { ContentModule } from '@/types/contentModules';
import { ProgramLevel } from '@/types/programLevel';
import { DonorModel } from '@/types/donorRecognition';

export interface ActivityModel extends BaseEntity {
  image?: ImageModel;
  badgeConnection?: RelatedBadgeModel[];
  programLevel?: ProgramLevel[];
  theme?: BaseEntity;
  timeRange?: string;
  materials?: MaterialModel[];
  relatedResources?: FileModel[];
  relatedTraining?: LinkModel[];
  relatedShopLinks?: LinkModel[];
  content?: ContentModule[];
  keywords?: string[];
  closingQuestionTitle?: string;
  closingQuestionContent?: string | string[];
  closingQuestionDescription?: ClosingQuestionDescriptionModel;
  donors?: DonorModel[];
}
