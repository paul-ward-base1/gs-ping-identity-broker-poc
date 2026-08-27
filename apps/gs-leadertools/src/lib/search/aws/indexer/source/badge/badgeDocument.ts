import { DocumentBase, IndexableDocument } from '@/lib/search/aws/indexer/source/document';
import { ProgramLevel } from '@/lib/search/aws/indexer/source/programLevel';

/**
 * Step represents a step in a badge, which may include activities.
 */
export interface Step extends DocumentBase {
  activities?: DocumentBase[];
}

/**
 * BadgeDocument represents a document related to a badge in the search index.
 */
export interface BadgeDocument extends IndexableDocument {

  /**
   * The identifier for the badge.
   */
  id: string,

  /**
   * The image URL associated with the badge.
   */
  image: string,

  /**
   * The family of badges associated with the badge.
   */
  family?: string,

  /**
   * The keywords associated with the badge.
   */
  keywords?: string[],

  /**
   * The path to the badge document.
   */
  path: string,

  /**
   * The program level(s) associated with the badge.
   */
  programLevel?: ProgramLevel,

  /**
   * The steps associated with the badge.
   */
  steps?: Step[],

  /**
   * The theme associated with the badge.
   */
  theme?: string,
}
