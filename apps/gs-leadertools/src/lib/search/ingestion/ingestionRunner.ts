import { NextResponse } from 'next/server';

/**
 * Interface for data ingestion runners for search engine.
 */
export interface IngestionRunner {
  run: (force?: boolean) => Promise<NextResponse>;
}
