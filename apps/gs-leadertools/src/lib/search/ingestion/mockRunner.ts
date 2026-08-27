import { NextResponse } from 'next/server';
import { IngestionRunner } from '@/lib/search/ingestion/ingestionRunner';
import { clearPdfCache } from '@/utils/pdfCache';

export default {
  run: async (_force = false) => {
    console.log('Mock ingestion runner executed');
    clearPdfCache();
    return NextResponse.json({
      status: 'ok',
      message: 'Mock ingestion completed successfully.',
    });
  },
} as IngestionRunner;
