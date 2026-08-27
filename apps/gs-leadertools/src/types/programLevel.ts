import { BaseEntity } from '@/types/base';
import { ImageModel } from '@/types/image';

export enum ProgramLevelEnum {
  DAISY = 'Daisy',
  BROWNIE = 'Brownie',
  JUNIOR = 'Junior',
  CADETTE = 'Cadette',
  SENIOR = 'Senior',
  AMBASSADOR = 'Ambassador',
  ALL = 'All Program Levels',
  MULTI = 'Multi',
}

export enum ProgramLevelIds {
  DAISY = 'daisy',
  BROWNIE = 'brownie',
  JUNIOR = 'junior',
  CADETTE = 'cadette',
  SENIOR = 'senior',
  AMBASSADOR = 'ambassador',
  ALL = 'all',
  MULTI = 'multi',
}

export interface ProgramLevel extends BaseEntity {
  backgroundImage: ImageModel;
  id: string;
  name: string;
}
