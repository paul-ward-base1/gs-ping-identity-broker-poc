import { NextResponse } from 'next/server';
import { IngestionRunner } from '@/lib/search/ingestion/ingestionRunner';

/**
 * No-op ingestion runner used when SEARCH_TYPE=aem (Universal Editor / author mode).
 * Reindexing is not applicable in this mode — search is served directly from AEM GraphQL.
 */
export default {
  run: async (_force = false) => {
    return NextResponse.json({
      status: 'ok',
      message: 'Reindexing is not applicable in AEM search mode.',
    });
  },
} as IngestionRunner;
