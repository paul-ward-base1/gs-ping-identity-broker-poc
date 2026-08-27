import { DescriptionModel } from '@/types/description';

export interface BaseEntity {
  name: string;
  description?: DescriptionModel;
  path?: string;
}
