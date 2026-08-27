import { type NextRequest, NextResponse } from 'next/server';
import { warmPdfCaches } from '@/utils/warmPdfCaches';
import { pdfBadgeCache, pdfActivityCache } from '@/utils/pdfCache';
import { getInternalBaseUrl } from '@/utils/internalBaseUrl';
import { resolvePublicOrigin } from '@/utils/resolvePublicOrigin';

export const runtime = 'nodejs';

export function GET() {
  return NextResponse.json({
    badges: pdfBadgeCache.size,
    activities: pdfActivityCache.size,
    total: pdfBadgeCache.size + pdfActivityCache.size,
  });
}

export async function POST(req: NextRequest) {
  const secret = process.env.REINDEX_SECRET;
  if (!secret) {
    console.error('[warm] REINDEX_SECRET env var is not set');
    return NextResponse.json({ status: 'error', message: 'Server misconfiguration.' }, { status: 500 });
  }

  const token = req.headers.get('x-reindex-token');
  if (!token || token !== secret) {
    return NextResponse.json({ status: 'error', message: 'Unauthorized.' }, { status: 401 });
  }

  const internalBaseUrl = getInternalBaseUrl();
  const publicBaseUrl = resolvePublicOrigin(req);
  warmPdfCaches(internalBaseUrl, publicBaseUrl).catch(err =>
    console.error('[warm] Unhandled error during PDF pre-warm:', err)
  );
  return NextResponse.json({ status: 'warming', internalBaseUrl });
}
