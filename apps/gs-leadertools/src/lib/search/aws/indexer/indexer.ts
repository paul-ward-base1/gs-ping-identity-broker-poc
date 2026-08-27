import { API, Client } from '@opensearch-project/opensearch';
import { DataLoader } from './source/dataLoader';
import { asUpdateSource, IdSourceTransformer, UpdateSource } from './source/updateSource';
import { getOpenSearchClient, MAX_SIZE } from '@/lib/search/aws/client';
import { Locale } from '@/lib/locale';
import { debugLog } from '@/lib/debug';
import { ChecksumKey, DocumentBase, IndexableDocument } from '@/lib/search/aws/indexer/source/document';
import { Md5 } from 'ts-md5';
import { indexNameFor, SearchIndexType } from '@/lib/search/aws/searchIndex';

const CHECKSUM_FIELD_NAME: ChecksumKey = '_checksum';
const INDEX_CREATION_DELAY = 30 * 1000; // delay for index creation

type DocumentStamps = Record<string, string | undefined>;

/**
 * Abstract class for indexing documents in OpenSearch.
 *
 * This class provides a framework for creating, updating, and deleting documents in an OpenSearch index.
 * It handles the lifecycle of the index, including checking for existence, creating the index if it does not exist,
 * and managing the upsert operations for documents.
 *
 * @template T - The type of documents to be indexed, which must extend {@link IndexableDocument}.
 */
export abstract class Indexer<T extends IndexableDocument> {
  protected readonly client: Client = getOpenSearchClient();
  protected readonly indexName: string;

  protected constructor(
    indexType: SearchIndexType,
    private readonly locale: Locale,
    protected readonly dataLoader: DataLoader<T>,
    protected readonly idSourceTransformer: IdSourceTransformer<T>
  ) {
    this.indexName = indexNameFor(indexType, locale);
  }

  /**
   * Runs the indexing process.
   * This method checks if the index exists, creates it if it does not,
   * loads data using the data loader, calculates missing document IDs,
   * deletes any missing documents, and upserts the documents into the index.
   *
   * @returns {Promise<void>} A promise that resolves when the indexing process is complete.
   */
  public async run(force = false) {
    console.log(`Processing ${this.indexName} index.`);
    const indexExists = await this.indexExists();
    if (indexExists && force) {
      console.log(`Force reindex — dropping index: ${this.indexName}`);
      await this.client.indices.delete({ index: this.indexName });
      console.log(`Index ${this.indexName} dropped.`);
    }
    if (!indexExists || force) {
      console.log('Creating index:', this.indexName);
      const { body: result } = await this.createIndex();
      console.log('Index created with status', result);
      console.log(`Waiting ${INDEX_CREATION_DELAY / 1000}s.`);
      await new Promise(resolve => setTimeout(resolve, INDEX_CREATION_DELAY));
      console.log(`Resuming.`);
    } else {
      console.log(`Index ${this.indexName} already exists.`);
    }

    const data = await this.dataLoader.loadData(this.locale);

    const updateSource = data.map(item => asUpdateSource(item, this.idSourceTransformer));
    const indexedDocuments = await this.getIndexedDocuments();
    const missingIds = this.calculateMissingDocumentIds(updateSource, indexedDocuments);
    if (missingIds.length > 0) {
      await this.deleteMissingDocuments(missingIds);
    } else {
      console.log(`No missing documents to delete in ${this.indexName}.`);
    }
    await this.upsertDocuments(updateSource, indexedDocuments);
  }

  protected abstract createIndex(): Promise<API.Indices_Create_Response>;

  private async indexExists(): Promise<boolean> {
    const client = getOpenSearchClient();
    const { body: indexExists } = await client.indices.exists({
      index: this.indexName,
    });
    return indexExists;
  }

  private async getIndexedDocuments(): Promise<DocumentStamps> {
    debugLog(Indexer.name, `Fetching document IDs for index: ${this.indexName}`);
    const { body: response } = await this.client.search({
      index: this.indexName,
      size: MAX_SIZE,
      _source: false,
      body: {
        fields: [CHECKSUM_FIELD_NAME],
        query: { match_all: {} },
      },
    });

    return response.hits.hits.reduce((acc, hit) => {
      // @opensearch-project/opensearch's HitsMetadata.hits type is declared as
      // `Hit & { _source?: T }[]`, which (operator precedence) intersects `Hit`
      // with an array type instead of producing `(Hit & { _source?: T })[]` —
      // so TS infers each element as just `{ _source?: T }`, dropping `fields`
      // and `_id`. Cast to the real runtime shape.
      const h = hit as unknown as { _id: string; fields?: Record<string, unknown[]> };
      const checksum = h.fields?.[CHECKSUM_FIELD_NAME]?.[0] as string | undefined;
      if (checksum) {
        acc[h._id] = checksum;
      }

      return acc;
    }, {} as DocumentStamps);
  }

  private calculateMissingDocumentIds(updateSource: UpdateSource<T>[], indexedDocuments: DocumentStamps): string[] {
    const sourceIds = updateSource.map(item => item.meta.id);
    debugLog(Indexer.name, `Source IDs: ${sourceIds}`);
    const indexedIds = Object.keys(indexedDocuments);
    const missingIds = indexedIds.filter(id => !sourceIds.includes(id));
    debugLog(Indexer.name, `Missing document IDs: '${missingIds.length ? missingIds : '<none>'}'.`);

    return missingIds;
  }

  private async deleteMissingDocuments(missingIds: string[]) {
    debugLog(Indexer.name, `Deleting missing documents for IDs: ${missingIds}`);
    const body = missingIds.flatMap((id: string) => [{ delete: { _index: this.indexName, _id: id } }]);
    const {
      body: { errors: hasError },
    } = await this.client.bulk({ body });
    console.log(`Deleted ${body.length} documents from ${this.indexName} with status='${hasError ? 'error' : 'ok'}'.`);
  }

  private async upsertDocuments(updateSource: UpdateSource<T>[], indexedDocuments: DocumentStamps) {
    debugLog(Indexer.name, `Calculating documents to upsert for index: ${this.indexName}`);

    const body = updateSource
      .map(item => this.addChecksum(indexedDocuments, item))
      .filter(item => item.doc._checksum)
      .flatMap(item => [
        { update: { _index: this.indexName, _id: item.meta.id } },
        { doc: item.doc, doc_as_upsert: true },
      ]);

    if (body.length > 0) {
      const {
        body: { errors: hasError },
      } = await this.client.bulk({ body });
      console.log(
        `Upserted ${body.length / 2} documents to ${this.indexName} with status='${hasError ? 'error' : 'ok'}'.`
      );
    } else {
      console.log(`Nothing to upsert for ${this.indexName}.`);
    }
  }

  private addChecksum(indexedDocuments: DocumentStamps, item: UpdateSource<T>) {
    const indexedChecksum = indexedDocuments[item.meta.id] ?? null;
    const checksum = this.checksumOf(item.doc);
    const requiresIndexing = !indexedChecksum || indexedChecksum !== checksum;
    if (requiresIndexing) {
      item.doc._checksum = checksum;
    }

    debugLog(Indexer.name, 'Calculating checksum', {
      documentId: item.meta.id,
      indexedChecksum,
      checksum,
      requiresIndexing,
    });

    return item;
  }

  private checksumOf(document: DocumentBase) {
    return Md5.hashStr(JSON.stringify(document));
  }
}
