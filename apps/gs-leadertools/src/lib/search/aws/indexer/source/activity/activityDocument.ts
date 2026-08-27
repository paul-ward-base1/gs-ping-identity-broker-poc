import { IndexableDocument } from '@/lib/search/aws/indexer/source/document';
import { ProgramLevel } from '@/lib/search/aws/indexer/source/programLevel';

/**
 * ActivityDocument represents a document related to an activity in the search index.
 */
export interface ActivityDocument extends IndexableDocument {

  /**
   * The family of badges associated with the activity.
   */
  badgeFamilies?: string[],

  /**
   * The image URL associated with the activity.
   */
  image: string,

  /**
   * The keywords associated with the activity.
   */
  keywords?: string[],

  /**
   * The path to the activity document.
   */
  path: string,

  /**
   * The program level(s) associated with the activity.
   */
  programLevels?: ProgramLevel[],

  /**
   * The range of time during which the activity is relevant.
   */
  timeRange?: string,

  /**
   * The themes associated with the activity.
   */
  themes?: string[],
}
