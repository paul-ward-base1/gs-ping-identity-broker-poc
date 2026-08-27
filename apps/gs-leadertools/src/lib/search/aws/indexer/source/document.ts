import { DESCRIPTION_FIELD, NAME_FIELD } from '@/lib/search/aws/indexer/source/common';

export interface DocumentBase {
  description: string;
  name: string;
}

export interface Checksum {
  _checksum?: string;
}

export interface IndexableDocument extends Checksum, DocumentBase {}

export type ChecksumKey = keyof Checksum;

export const MANDATORY_DOCUMENT_BASE_FIELDS = [
  DESCRIPTION_FIELD,
  NAME_FIELD,
];
