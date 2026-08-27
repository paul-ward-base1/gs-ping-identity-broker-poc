import { AwardDocument } from '@/lib/search/aws/indexer/source/award/awardDocument';
import { Indexer } from '@/lib/search/aws/indexer/indexer';
import { Indices_Create_Response } from '@opensearch-project/opensearch/api/index.js';
import { Locale } from '@/lib/locale';
import { AwardLoader } from '@/lib/search/aws/indexer/source/award/awardLoader';
import { FieldType } from '@/lib/search/aws/indexer/fieldType';
import { SearchIndexType } from '@/lib/search/aws/searchIndex';
import { ProgramLevelFilter } from '@/types/filter';

export class AwardIndexer extends Indexer<AwardDocument> {
  constructor(locale: Locale, programLevelMap: Map<string, ProgramLevelFilter>) {
    super(SearchIndexType.AWARD, locale, new AwardLoader(programLevelMap), (award: AwardDocument) => award.path);
  }

  protected createIndex(): Promise<Indices_Create_Response> {
    return this.client.indices.create({
      index: this.indexName,
      body: {
        mappings: {
          properties: {
            _checksum: { type: FieldType.KEYWORD },
            family: { type: FieldType.KEYWORD },
            programLevels: {
              type: FieldType.NESTED,
              properties: {
                name: { type: FieldType.KEYWORD },
                order: { type: FieldType.BYTE },
              },
            },
            theme: { type: FieldType.KEYWORD },
          },
        },
      },
    });
  }
}
