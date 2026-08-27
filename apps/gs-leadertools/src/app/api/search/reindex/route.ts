import { loadIngestionRunner } from '@/lib/search/ingestion/ingestionRunnerLoader';
import { NextRequest, NextResponse } from 'next/server';
import { warmPdfCaches } from '@/utils/warmPdfCaches';
import { warmImageCaches } from '@/utils/warmImageCaches';
import { getInternalBaseUrl } from '@/utils/internalBaseUrl';
import { resolvePublicOrigin } from '@/utils/resolvePublicOrigin';

const runner = await loadIngestionRunner.load();

export const POST = async (request: NextRequest) => {
  const secret = process.env.REINDEX_SECRET;
  if (!secret) {
    console.error('REINDEX_SECRET env var is not set');
    return NextResponse.json({ status: 'error', message: 'Server misconfiguration.' }, { status: 500 });
  }

  const token = request.headers.get('x-reindex-token');
  if (!token || token !== secret) {
    return NextResponse.json({ status: 'error', message: 'Unauthorized.' }, { status: 401 });
  }

  const force = request.nextUrl.searchParams.get('force') === 'true';
  const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown';
  console.log(JSON.stringify({ event: 'reindex.authorized', force, ip, ts: new Date().toISOString() }));

  const internalBaseUrl = getInternalBaseUrl();
  const publicBaseUrl = resolvePublicOrigin(request);
  const result = await runner.run(force);
  warmPdfCaches(internalBaseUrl, publicBaseUrl).catch(err => console.error('[reindex] PDF warm-up error:', err));
  warmImageCaches().catch(err => console.error('[reindex] image warm-up error:', err));
  return result;
};
