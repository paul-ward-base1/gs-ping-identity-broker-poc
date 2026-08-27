import React from 'react';
import { Readable } from 'stream';
import { type NextRequest, NextResponse } from 'next/server';
import { renderToStream } from '@react-pdf/renderer';
import type { DocumentProps } from '@react-pdf/renderer';
import QRCode from 'qrcode';
import { fetchBadgeDetailByPath, fetchRelatedBadges } from '@/apis/badges';
import { buildAemBadgePath } from '@/lib/aemContext';
import { getFilterModel } from '@/lib/filters';
import { getDictionary } from '@/lib/dictionaries';
import { locales, type Locale } from '@/lib/locale';
import { createI18nInstance } from '@/i18n';
import { buildImagePath } from '@/utils/buildImagePath';
import { buildBadgePdfData } from '@/components/BadgePageClient/badgePdfData';
import { BadgePdfDocument } from '@/components/PrintPdf/BadgePdfDocument';
import { registerPdfFonts } from '@/components/PrintPdf/fonts';
import { pdfBadgeCache, type PdfCacheEntry } from '@/utils/pdfCache';
import { getInternalBaseUrl } from '@/utils/internalBaseUrl';
import { resolvePublicOrigin } from '@/utils/resolvePublicOrigin';
import { fetchErrorDetails } from '@/utils/fetchErrorDetails';

export const runtime = 'nodejs';

const slugify = (value: string | undefined): string =>
  (value ?? 'badge')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const streamToBuffer = (stream: Readable): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk: Buffer) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', err => {
      stream.destroy();
      reject(err);
    });
  });

const inflightBadge = new Map<string, Promise<{ buf: Buffer; filename: string }>>();

async function buildBadgePdf(
  lang: string,
  level: string,
  slug: string,
  color: boolean,
  publicBaseUrl: string,
  internalBaseUrl: string
): Promise<{ buf: Buffer; filename: string }> {
  const key = `${lang}:${level}:${slug}:${color ? 'color' : 'bw'}:${publicBaseUrl}`;
  const hit = pdfBadgeCache.get(key);
  if (hit) return hit;

  const inflight = inflightBadge.get(key);
  if (inflight) return inflight;

  const promise = (async () => {
    try {
      return await renderBadgePdf(lang, level, slug, color, publicBaseUrl, internalBaseUrl, key);
    } finally {
      inflightBadge.delete(key);
    }
  })();
  inflightBadge.set(key, promise);
  return promise;
}

async function renderBadgePdf(
  lang: string,
  level: string,
  slug: string,
  color: boolean,
  publicBaseUrl: string,
  internalBaseUrl: string,
  cacheKey: string
): Promise<{ buf: Buffer; filename: string }> {
  const locale = lang as Locale;
  const badgePath = buildAemBadgePath(lang, level, slug);
  const pageUrl = `${publicBaseUrl}/${lang}/badge/${level}/${slug}`;

  const [badgeDetails, dict, filters, qrDataUrl] = await Promise.all([
    fetchBadgeDetailByPath(badgePath),
    getDictionary(locale),
    getFilterModel(locale),
    QRCode.toDataURL(pageUrl, { margin: 0, width: 132 }),
  ]);
  if (!badgeDetails) throw new Error('Badge not found');

  const [relatedItems, i18n] = await Promise.all([
    badgeDetails.badgeFamily?.path
      ? fetchRelatedBadges(lang, badgeDetails.badgeFamily.path, badgeDetails.path ?? '')
      : Promise.resolve([]),
    createI18nInstance(lang, dict),
  ]);
  const t = (key: string, options?: Record<string, unknown>) => i18n.t(key, options) as string;

  const { badgeProgramLevel, badgeSteps, sideRailBoxItems, handouts } = buildBadgePdfData(
    badgeDetails,
    relatedItems,
    filters,
    t,
    process.env.ENV === 'dev'
  );

  const stepsCount = badgeSteps.length;
  const stepsText =
    stepsCount > 1
      ? t('badgeDetailPage.section.steps.textFormat.plural', { count: stepsCount })
      : t('badgeDetailPage.section.steps.textFormat.singular', { count: stepsCount });

  const badgeImageSrc = badgeDetails.image?.path
    ? `${internalBaseUrl}${buildImagePath(badgeDetails.image.path)}`
    : undefined;

  registerPdfFonts(internalBaseUrl);

  const element = (
    <BadgePdfDocument
      badgeDetails={badgeDetails}
      badgeSteps={badgeSteps}
      badgeProgramLevel={badgeProgramLevel}
      sideRailBoxItems={sideRailBoxItems}
      handouts={handouts}
      pageUrl={pageUrl}
      qrDataUrl={qrDataUrl}
      badgeImageSrc={badgeImageSrc}
      baseUrl={internalBaseUrl}
      color={color}
      translations={{
        breadcrumb: 'Girl Scouts® | Badges & Activities',
        stepsHeader: t('badgeDetailPage.section.steps.header'),
        stepsText,
        activitiesLabel: t('badgeDetailPage.section.steps.activities.header'),
        stepCompleteLabel: 'Step complete',
        forMultiLevelGroups: 'For Multi-Level Groups',
        handoutsHeader: t('badgeDetailPage.section.handouts.header'),
        handoutsCount: (n: number) => `${n} resources`,
        handoutsSubtitle: 'Print or share these materials alongside this badge.',
        copyright: `© ${new Date().getFullYear()} Girl Scouts of the United States of America. A 501(c)(3) Organization. All Rights Reserved.`,
      }}
    />
  ) as React.ReactElement<DocumentProps>;

  const stream = await renderToStream(element);
  const buf = await streamToBuffer(stream as unknown as Readable);
  const filename = `${slugify(badgeDetails.badgeName)}.pdf`;

  pdfBadgeCache.set(cacheKey, { buf, filename } satisfies PdfCacheEntry);
  return { buf, filename };
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ lang: string; level: string; slug: string }> }
) {
  const { lang, level, slug } = await params;
  const publicBaseUrl = resolvePublicOrigin(req);
  const internalBaseUrl = getInternalBaseUrl();
  const color = req.nextUrl.searchParams.get('color') === 'true';

  if (!locales.includes(lang as Locale)) {
    return new NextResponse('Invalid locale', { status: 400 });
  }

  try {
    buildAemBadgePath(lang, level, slug);
  } catch {
    return new NextResponse('Bad badge path', { status: 400 });
  }

  let result: { buf: Buffer; filename: string };
  try {
    result = await buildBadgePdf(lang, level, slug, color, publicBaseUrl, internalBaseUrl);
  } catch (err) {
    const msg = (err as Error).message;
    if (msg === 'Badge not found') return new NextResponse('Badge not found', { status: 404 });
    console.error('[print/badge] PDF render failed', {
      lang,
      level,
      slug,
      internalBaseUrl,
      ...fetchErrorDetails(err),
    });
    return new NextResponse('PDF render failed', { status: 500 });
  }

  return new NextResponse(new Uint8Array(result.buf), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${result.filename}"`,
      'Cache-Control': 'public, max-age=600',
    },
  });
}
