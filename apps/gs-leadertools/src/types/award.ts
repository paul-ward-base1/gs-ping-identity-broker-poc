import { BaseEntity } from '@/types/base';
import { ImageModel } from '@/types/image';
import { ProgramLevel } from '@/types/programLevel';
import { DescriptionModel } from '@/types/description';
import { FileModel } from '@/types/file';
import { DonorModel } from '@/types/donorRecognition';
import { PurchaseLinkModel } from '@/types/badge';
import { ContentModule } from '@/types/contentModules';
import { ActivityModel } from '@/types/activity';

export interface AwardStepModel {
  path?: string;
  name?: string;
  description?: DescriptionModel;
  contentModules?: ContentModule[];
  activities?: ActivityModel[];
}

// Narrower than `AwardModel` — only what BE projects on `nextAwards[]`.
export interface NextAwardItem {
  path: string;
  badgeName: string;
  badgeId: string;
  description?: DescriptionModel;
  image?: ImageModel | null;
}

export interface AwardModel {
  path?: string;
  badgeName?: string;
  badgeId?: string;
  description?: DescriptionModel;
  image?: ImageModel | null;
  programLevel?: ProgramLevel[];
  theme?: BaseEntity | null;
  badgeFamily?: BaseEntity;
  purchaseLink?: PurchaseLinkModel | null;
  nextAwards?: NextAwardItem[];
  directiveTitle?: string;
  directiveDescription?: { html?: string };
  steps?: AwardStepModel[];
  activity?: ActivityModel[];
  closingQuestionTitle?: string;
  closingQuestionDescription?: { html?: string };
  closingQuestionContent?: string | string[];
  relatedResources?: FileModel[];
  donors?: DonorModel[];
  keywords?: string[] | null;
}
