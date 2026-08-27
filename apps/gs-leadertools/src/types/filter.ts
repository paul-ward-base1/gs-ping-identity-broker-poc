import { BaseEntity } from '@/types/base';
import { ProgramLevel } from '@/types/programLevel';

/**
 * Interface for entities that can be identified by a unique ID.
 */
export interface Identifiable {

  /**
   * Unique identifier for the entity.
   */
  id: string;
}

/**
 * Interface representing a filter entity.
 */
export interface Filter extends BaseEntity, Identifiable {
}

/**
 * Interface representing a program level filter entity.
 */
export interface ProgramLevelFilter extends ProgramLevel, Identifiable {
  order: number;
}


/**
 * Interface representing a model for filters.
 */
export interface FilterModel {
  /**
   * List of badge family filters.
   */
  badgeFamilies?: Filter[];

  /**
   * List of program level filters.
   */
  programLevels?: ProgramLevelFilter[];

  /**
   * List of theme filters.
   */
  themes?: Filter[];
}
