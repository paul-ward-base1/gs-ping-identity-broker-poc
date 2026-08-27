import { Locale } from '@/lib/locale';

/**
 * SearchIndexType enum defines the types of search indices available in the application.
 */
export enum SearchIndexType {
  /**
   * ACTIVITY index is used for searching activities.
   */
  ACTIVITY = 'activity',

  /**
   * AWARD index is used for searching awards.
   */
  AWARD = 'award',

  /**
   * BADGE index is used for searching badges.
   */
  BADGE = 'badge',
}

/**
 * indexNameFor function generates the name of the search index based on the type and locale.
 *
 * @param type - The type of search index.
 * @param locale - The locale for which the index is being generated.
 */
export const indexNameFor = (type: SearchIndexType, locale: Locale): string => `${type}-${locale}`;
