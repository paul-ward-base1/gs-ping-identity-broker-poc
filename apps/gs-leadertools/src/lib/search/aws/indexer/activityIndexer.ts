import { Indexer } from '@/lib/search/aws/indexer/indexer';
import { Indices_Create_Response } from '@opensearch-project/opensearch/api/index.js';
import { Locale } from '@/lib/locale';
import { ActivityDocument } from './source/activity/activityDocument';
import { ActivityLoader } from '@/lib/search/aws/indexer/source/activity/activityLoader';
import { FieldType } from '@/lib/search/aws/indexer/fieldType';
import { SearchIndexType } from '@/lib/search/aws/searchIndex';
import { ProgramLevelFilter } from '@/types/filter';

/**
 * Indexer for activities in OpenSearch.
 *
 * This class extends the base Indexer class and provides functionality
 * to index activity documents in OpenSearch.
 *  It uses a data loader to fetch activity data and transforms the
 *  activity documents into a format suitable for indexing.
 *  It creates an index with specific mappings for activity-related fields.
 *
 *  @extends Indexer<ActivityDocument>
 *  @param {Locale} locale - The locale for the indexer.
 *  @param {Map<string, ProgramLevelFilter>} programLevelMap - A map of program level filters
 *  @example
 *    const activityIndexer = new ActivityIndexer(locale, programLevelMap);
 *    await activityIndexer.run();
 *  @see {@link Indexer}
 *  @see {@link ActivityDocument}
 */
export class ActivityIndexer extends Indexer<ActivityDocument> {

  constructor(locale: Locale, programLevelMap: Map<string, ProgramLevelFilter>) {
    super(
      SearchIndexType.ACTIVITY,
      locale,
      new ActivityLoader(programLevelMap),
      (activity: ActivityDocument) => activity.path);
  }

  protected createIndex(): Promise<Indices_Create_Response> {
    return this.client.indices.create({
      index: this.indexName,
      body: {
        mappings: {
          properties: {
            _checksum: { type: FieldType.KEYWORD },
            badgeFamilies: { type: FieldType.KEYWORD },
            programLevels: {
              type: FieldType.NESTED,
              properties: {
                id: { type: FieldType.KEYWORD },
                name: { type: FieldType.KEYWORD },
                order: { type: FieldType.BYTE }
              }
            },
            themes: { type: FieldType.KEYWORD },
          },
        },
      },
    });
  }

}

