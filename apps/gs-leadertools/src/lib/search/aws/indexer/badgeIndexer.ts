import { BadgeDocument } from '@/lib/search/aws/indexer/source/badge/badgeDocument';
import { Indexer } from '@/lib/search/aws/indexer/indexer';
import { Indices_Create_Response } from '@opensearch-project/opensearch/api/index.js';
import { Locale } from '@/lib/locale';
import { BadgeLoader } from '@/lib/search/aws/indexer/source/badge/badgeLoader';
import { FieldType } from '@/lib/search/aws/indexer/fieldType';
import { SearchIndexType } from '@/lib/search/aws/searchIndex';
import { ProgramLevelFilter } from '@/types/filter';

/**
 * Indexer for badges in OpenSearch.
 *
 * This class extends the base Indexer class and provides functionality
 * to index badge documents in OpenSearch.
 * It uses a data loader to fetch badge data and transforms the
 * badge documents into a format suitable for indexing.
 * It creates an index with specific mappings for badge-related fields.
 *
 * @extends Indexer<BadgeDocument>
 * @param {Locale} locale - The locale for the indexer.
 * @param {Map<string, ProgramLevelFilter>} programLevelMap - A map of program level filters
 * @example
 *   const badgeIndexer = new BadgeIndexer(locale, programLevelMap);
 *   await badgeIndexer.run();
 * @see {@link Indexer}
 * @see {@link BadgeDocument}
 */
export class BadgeIndexer extends Indexer<BadgeDocument> {

  constructor(locale: Locale, programLevelMap: Map<string, ProgramLevelFilter>) {
    super(
      SearchIndexType.BADGE,
      locale,
      new BadgeLoader(programLevelMap),
      (badge: BadgeDocument) => badge.path,
    );
  }

  protected createIndex(): Promise<Indices_Create_Response> {
    return this.client.indices.create({
      index: this.indexName,
      body: {
        mappings: {
          properties: {
            _checksum: { type: FieldType.KEYWORD },
            family: { type: FieldType.KEYWORD },
            programLevel: {
              type: FieldType.NESTED,
              properties: {
                id: { type: FieldType.KEYWORD },
                name: { type: FieldType.KEYWORD },
                order: { type: FieldType.BYTE }
              }
            },
            theme: { type: FieldType.KEYWORD },
          },
        },
      },
    });
  }

}

