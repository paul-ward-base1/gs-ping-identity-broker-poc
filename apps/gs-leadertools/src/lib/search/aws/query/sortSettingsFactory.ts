import { SearchQuery, SortOrder, SortType } from '@/lib/search/api/search';

/**
 * OrderSettings defines the sorting order for a specific field.
 */
export interface OrderSettings {

  /**
   * The field to sort by, such as 'name.keyword' or 'programLevel'.
   */
  order: SortOrder;
}

/**
 * SortSettings defines the sorting settings for a search query.
 */
export type SortSettings = Record<string, OrderSettings>[];

/**
 * SortSettingsProvider is a function that provides sorting settings based on the specified order.
 */
export type SortSettingsProvider = (order: SortOrder) => SortSettings;

/**
 * SortSettingsFactory is responsible for creating sort settings based on a search query.
 */
export class SortSettingsFactory {

  /**
   * Creates an instance of SortSettingsFactory.
   *
   * @param programLevelSettingsProvider - A provider function that returns sort settings for program-level sorting.
   */
  constructor(private readonly programLevelSettingsProvider: SortSettingsProvider) {
  }

  /**
   * Creates sort settings based on the provided SearchQuery.
   *
   * @param query - The SearchQuery to create sort settings from.
   * @return SortSettings - The sort settings derived from the query.
   */
  public fromQuery(query: SearchQuery): SortSettings {
    const order = query.sort.order;

    return query.sort.type === SortType.PROGRAM_LEVEL ? [
      ...this.programLevelSettingsProvider(order),
    ] : [
      { ['name.keyword']: { order: order } },
    ];
  }


}
