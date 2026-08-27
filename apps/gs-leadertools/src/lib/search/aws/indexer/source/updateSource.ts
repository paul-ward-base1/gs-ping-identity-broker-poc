import { Md5 } from 'ts-md5';
import { DocumentBase } from '@/lib/search/aws/indexer/source/document';

/**
 * UpdateSource represents a source document for updating an index in AWS.
 */
export interface UpdateSource<T extends DocumentBase> {
  doc: T;
  meta: {
    id: string;
  };
}

/**
 * IdSourceTransformer is a function type that transforms a document of type T into a string identifier.
 */
export type IdSourceTransformer<T> = (value: T) => string;


/**
 * asUpdateSource transforms a document into an UpdateSource format.
 *
 * This function takes a document of type T and an IdSourceTransformer function,
 * which is used to generate a unique identifier for the document.
 *
 * @param document - The document to be transformed.
 * @param idSourceTransformer - A function that transforms the document into a string identifier.
 * @return An UpdateSource object containing the document and its metadata.
 */
export const asUpdateSource = <T extends DocumentBase>(document: T, idSourceTransformer: IdSourceTransformer<T>) => {
  const idSource = idSourceTransformer(document);

  return {
    meta: {
      id: Md5.hashStr(idSource)
    },
    doc: document
  };
};
