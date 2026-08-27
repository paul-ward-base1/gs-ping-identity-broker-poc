import React from 'react';
import { Readable } from 'stream';
import { type NextRequest, NextResponse } from 'next/server';
import { renderToStream } from '@react-pdf/renderer';
import type { DocumentProps } from '@react-pdf/renderer';
import QRCode from 'qrcode';
import { fetchActivity } from '@/apis/activities';
import { buildCmsActivityPath } from '@/lib/aemContext';
import { getFilterModel } from '@/lib/filters';
import { getDictionary } from '@/lib/dictionaries';
import { createI18nInstance } from '@/i18n';
import { locales, type Locale } from '@/lib/locale';
import { buildActivityPdfData } from '@/components/ActivityPageClient/activityPdfData';
import { ActivityPdfDocument } from '@/components/PrintPdf/ActivityPdfDocument';
import { registerPdfFonts } from '@/components/PrintPdf/fonts';
import { pdfActivityCache, type PdfCacheEntry } from '@/utils/pdfCache';
import { getInternalBaseUrl } from '@/utils/internalBaseUrl';
import { resolvePublicOrigin } from '@/utils/resolvePublicOrigin';
import { fetchErrorDetails } from '@/utils/fetchErrorDetails';

export const runtime = 'nodejs';

const slugify = (value: string | undefined): string =>
  (value ?? 'activity')
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

const inflightActivity = new Map<string, Promise<{ buf: Buffer; filename: string }>>();

async function buildActivityPdf(
  lang: string,
  slug: string[],
  color: boolean,
  publicBaseUrl: string,
  internalBaseUrl: string
): Promise<{ buf: Buffer; filename: string }> {
  const cacheKey = `${lang}:${slug.join(':')}:${color ? 'color' : 'bw'}:${publicBaseUrl}`;
  const hit = pdfActivityCache.get(cacheKey);
  if (hit) return hit;

  const inflight = inflightActivity.get(cacheKey);
  if (inflight) return inflight;

  const promise = (async () => {
    try {
      return await renderActivityPdf(lang, slug, color, publicBaseUrl, internalBaseUrl, cacheKey);
    } finally {
      inflightActivity.delete(cacheKey);
    }
  })();
  inflightActivity.set(cacheKey, promise);
  return promise;
}

async function renderActivityPdf(
  lang: string,
  slug: string[],
  color: boolean,
  publicBaseUrl: string,
  internalBaseUrl: string,
  cacheKey: string
): Promise<{ buf: Buffer; filename: string }> {
  const locale = lang as Locale;
  const [type, maybeGroup, maybeSlug] = slug;
  const group = slug.length === 3 ? maybeGroup : undefined;
  const activitySlug = slug.length === 3 ? maybeSlug : maybeGroup;
  const activityPath = buildCmsActivityPath(lang, type, activitySlug, group);
  const pageUrl = `${publicBaseUrl}/${lang}/activity/${slug.join('/')}`;

  // All four are independent — fetch in parallel.
  const [activity, dict, filters, qrDataUrl] = await Promise.all([
    fetchActivity('activityDetails', activityPath),
    getDictionary(locale),
    getFilterModel(locale),
    QRCode.toDataURL(pageUrl, { margin: 0, width: 132 }),
  ]);
  if (!activity) throw new Error('Activity not found');

  const i18n = await createI18nInstance(lang, dict);
  const t = i18n.t.bind(i18n);

  const { sideRailBoxItems, handouts, programLevels, theme, activityContent } = buildActivityPdfData(
    activity,
    filters,
    t
  );

  registerPdfFonts(internalBaseUrl);

  const element = (
    <ActivityPdfDocument
      activity={activity}
      activityContent={activityContent}
      programLevels={programLevels}
      sideRailBoxItems={sideRailBoxItems}
      handouts={handouts}
      theme={theme}
      pageUrl={pageUrl}
      qrDataUrl={qrDataUrl}
      baseUrl={internalBaseUrl}
      color={color}
      translations={{
        breadcrumb: 'Girl Scouts® | Badges & Activities',
        associatedBadgesLabel: 'associated badges',
        suppliesHeader: t('activityDetailPage.sideRail.suppliesAndHandouts.header'),
        suppliesCount: (n: number) => `${n} items`,
        optionalLabel: 'Optional',
        unitLabel: (unit: string) => t(`activityDetailPage.sideRail.suppliesAndHandouts.unit.${unit}`),
        handoutsHeader: t('badgeDetailPage.section.handouts.header'),
        handoutsCount: (n: number) => `${n} resources`,
        handoutsSubtitle: 'Print or share these materials alongside this activity.',
        closingQuestionDefaultTitle: 'Closing question',
        copyright: `© ${new Date().getFullYear()} Girl Scouts of the United States of America. A 501(c)(3) Organization. All Rights Reserved.`,
      }}
    />
  ) as React.ReactElement<DocumentProps>;

  const stream = await renderToStream(element);
  const buf = await streamToBuffer(stream as unknown as Readable);
  const filename = `${slugify(activity.name)}.pdf`;

  pdfActivityCache.set(cacheKey, { buf, filename } satisfies PdfCacheEntry);
  return { buf, filename };
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ lang: string; slug: string[] }> }) {
  const { lang, slug } = await params;
  const publicBaseUrl = resolvePublicOrigin(req);
  const internalBaseUrl = getInternalBaseUrl();
  const color = req.nextUrl.searchParams.get('color') === 'true';

  if (!locales.includes(lang as Locale)) {
    return new NextResponse('Invalid locale', { status: 400 });
  }

  // URL shapes: /[lang]/activity/[type]/[slug]  OR  /[lang]/activity/[type]/[group]/[slug]
  if (!slug || slug.length < 2 || slug.length > 3) {
    return new NextResponse('Bad activity path', { status: 400 });
  }

  let result: { buf: Buffer; filename: string };
  try {
    result = await buildActivityPdf(lang, slug, color, publicBaseUrl, internalBaseUrl);
  } catch (err) {
    const msg = (err as Error).message;
    if (msg === 'Activity not found') return new NextResponse('Activity not found', { status: 404 });
    console.error('[print/activity] PDF render failed', {
      lang,
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
