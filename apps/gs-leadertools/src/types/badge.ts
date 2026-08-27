import { BaseEntity } from '@/types/base';
import { ImageModel } from '@/types/image';
import { ProgramLevel } from '@/types/programLevel';
import { StepModel } from '@/types/step';
import { DescriptionModel } from '@/types/description';
import { FileModel } from '@/types/file';
import { DonorModel } from '@/types/donorRecognition';

export interface ClosingQuestionDescriptionModel {
  html: string;
}

export interface BadgeModel {
  badgeId?: string;
  path?: string;
  badgeName?: string;
  description?: DescriptionModel;
  image?: ImageModel;
  purchaseLink?: PurchaseLinkModel;
  programLevel?: ProgramLevel;
  theme?: BaseEntity;
  badgeFamily?: BaseEntity;
  directiveTitle?: string;
  directiveDescription?: { html?: string };
  steps?: StepModel[];
  relatedResources?: FileModel[];
  keywords?: string[];
  closingQuestionTitle?: string;
  closingQuestionContent?: string | string[];
  closingQuestionDescription?: ClosingQuestionDescriptionModel;
  donors?: DonorModel[];
}

export interface RelatedBadgeModel {
  badgeId: string;
  path: string;
  badgeName: string;
  image: ImageModel;
  theme: BaseEntity;
  badgeFamily?: BaseEntity;
  programLevel: ProgramLevel;
}

export interface PurchaseLinkModel {
  path?: string;
  label: string;
  url: string;
}
