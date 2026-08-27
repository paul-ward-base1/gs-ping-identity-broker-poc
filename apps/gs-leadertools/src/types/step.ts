import { BaseEntity } from '@/types/base';
import { ActivityModel } from '@/types/activity';
import { ContentModule } from '@/types/contentModules';

export interface StepModel extends BaseEntity {
  activities: ActivityModel[];
  contentModules?: ContentModule[];
}
