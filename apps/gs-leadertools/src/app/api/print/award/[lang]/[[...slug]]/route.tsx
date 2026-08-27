import React from 'react';
import { Readable } from 'stream';
import { type NextRequest, NextResponse } from 'next/server';
import { renderToStream } from '@react-pdf/renderer';
import type { DocumentProps } from '@react-pdf/renderer';
import QRCode from 'qrcode';
import { fetchAwards, fetchAwardDetailByPath, filterRelatedAwards } from '@/apis/awards';
import type { AwardModel } from '@/types/award';
import { getAemContextPath } from '@/lib/aemContext';
import { getFilterModel } from '@/lib/filters';
import { getDictionary } from '@/lib/dictionaries';
import { locales, type Locale } from '@/lib/locale';
import { createI18nInstance } from '@/i18n';
import { buildImagePath } from '@/utils/buildImagePath';
import { buildAwardPdfData } from '@/components/AwardPageClient/awardPdfData';
import { AwardPdfDocument } from '@/components/PrintPdf/AwardPdfDocument';
import { registerPdfFonts } from '@/components/PrintPdf/fonts';
import { pdfAwardCache, type PdfCacheEntry } from '@/utils/pdfCache';
import { getInternalBaseUrl } from '@/utils/internalBaseUrl';
import { resolvePublicOrigin } from '@/utils/resolvePublicOrigin';
import { fetchErrorDetails } from '@/utils/fetchErrorDetails';

export const runtime = 'nodejs';

const slugify = (value: string | undefined): string =>
  (value ?? 'award')
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

/** Mirrors `resolveAwardPath` in the page route — accepts `/{slug}` or `/{level}/{slug}`. */
const resolveAwardPathFromList = (lang: string, slug: string[], all: AwardModel[]): string | undefined => {
  if (slug.length === 0) return undefined;
  if (slug.length === 2) {
    const prefix = `${getAemContextPath(lang)}/awards/${slug[0]}/${slug[1]}/`;
    return all.find(a => a.path?.startsWith(prefix))?.path;
  }
  return all.find(a => a.path?.split('/').at(-2) === slug[0])?.path;
};

const inflightAward = new Map<string, Promise<{ buf: Buffer; filename: string }>>();

async function buildAwardPdf(
  lang: string,
  slug: string[],
  color: boolean,
  publicBaseUrl: string,
  internalBaseUrl: string
): Promise<{ buf: Buffer; filename: string }> {
  const key = `${lang}:${slug.join('/')}:${color ? 'color' : 'bw'}:${publicBaseUrl}`;
  const hit = pdfAwardCache.get(key);
  if (hit) return hit;

  const inflight = inflightAward.get(key);
  if (inflight) return inflight;

  const promise = (async () => {
    try {
      return await renderAwardPdf(lang, slug, color, publicBaseUrl, internalBaseUrl, key);
    } finally {
      inflightAward.delete(key);
    }
  })();
  inflightAward.set(key, promise);
  return promise;
}

async function renderAwardPdf(
  lang: string,
  slug: string[],
  color: boolean,
  publicBaseUrl: string,
  internalBaseUrl: string,
  cacheKey: string
): Promise<{ buf: Buffer; filename: string }> {
  const locale = lang as Locale;
  const allAwards = await fetchAwards(lang);
  const awardPath = resolveAwardPathFromList(lang, slug, allAwards);
  if (!awardPath) throw new Error('Award not found');

  const pageUrl = `${publicBaseUrl}/${lang}/award/${slug.join('/')}`;

  const [awardDetails, dict, filters, qrDataUrl] = await Promise.all([
    fetchAwardDetailByPath(awardPath),
    getDictionary(locale),
    getFilterModel(locale),
    QRCode.toDataURL(pageUrl, { margin: 0, width: 132 }),
  ]);
  if (!awardDetails) throw new Error('Award not found');

  const awardRelatedItems = filterRelatedAwards(allAwards, awardDetails.badgeFamily?.path, awardDetails.path ?? '');
  const i18n = await createI18nInstance(lang, dict);
  const t = (key: string, options?: Record<string, unknown>) => i18n.t(key, options) as string;

  const { awardProgramLevel, awardProgramLevelTags, awardSteps, closingQuestion, sideRailBoxItems, handouts } =
    buildAwardPdfData(awardDetails, awardRelatedItems, allAwards, filters, t, process.env.ENV === 'dev');

  const stepsCount = awardSteps.length;
  const stepsText =
    stepsCount > 1
      ? t('awardDetailPage.section.steps.textFormat.plural', {
          count: stepsCount,
          defaultValue: `It takes ${stepsCount} steps to earn this award.`,
        })
      : t('awardDetailPage.section.steps.textFormat.singular', {
          count: stepsCount,
          defaultValue: 'It takes 1 step to earn this award.',
        });

  const awardImageSrc = awardDetails.image?.path
    ? `${internalBaseUrl}${buildImagePath(awardDetails.image.path)}`
    : undefined;

  registerPdfFonts(internalBaseUrl);

  const element = (
    <AwardPdfDocument
      awardDetails={awardDetails}
      awardSteps={awardSteps}
      awardProgramLevel={awardProgramLevel}
      awardProgramLevelTags={awardProgramLevelTags}
      closingQuestion={closingQuestion}
      sideRailBoxItems={sideRailBoxItems}
      handouts={handouts}
      pageUrl={pageUrl}
      qrDataUrl={qrDataUrl}
      awardImageSrc={awardImageSrc}
      baseUrl={internalBaseUrl}
      color={color}
      translations={{
        breadcrumb: 'Girl Scouts® | Awards',
        stepsHeader: t('awardDetailPage.section.steps.header', { defaultValue: 'Steps to earn this award' }),
        stepsText,
        activitiesLabel: t('awardDetailPage.section.steps.activities.header', { defaultValue: 'Activity ideas' }),
        stepCompleteLabel: 'Step complete',
        forMultiLevelGroups: t('awardDetailPage.sideRail.multiProgramLevel.header', {
          defaultValue: 'For multi-level groups',
        }),
        nextAwardLabel: t('awardDetailPage.sideRail.nextAwards.header', { defaultValue: 'Next Award' }),
        handoutsHeader: t('awardDetailPage.section.relatedHandouts.header', { defaultValue: 'Related Handouts' }),
        handoutsCount: (n: number) => `${n} resources`,
        handoutsSubtitle: 'Print or share these materials alongside this award.',
        copyright: `© ${new Date().getFullYear()} Girl Scouts of the United States of America. A 501(c)(3) Organization. All Rights Reserved.`,
      }}
    />
  ) as React.ReactElement<DocumentProps>;

  const stream = await renderToStream(element);
  const buf = await streamToBuffer(stream as unknown as Readable);
  const filename = `${slugify(awardDetails.badgeName)}.pdf`;

  pdfAwardCache.set(cacheKey, { buf, filename } satisfies PdfCacheEntry);
  return { buf, filename };
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ lang: string; slug?: string[] }> }) {
  const { lang, slug = [] } = await params;
  const publicBaseUrl = resolvePublicOrigin(req);
  const internalBaseUrl = getInternalBaseUrl();
  const color = req.nextUrl.searchParams.get('color') === 'true';

  if (!locales.includes(lang as Locale)) {
    return new NextResponse('Invalid locale', { status: 400 });
  }
  if (slug.length === 0 || slug.length > 2) {
    return new NextResponse('Bad award path', { status: 400 });
  }

  let result: { buf: Buffer; filename: string };
  try {
    result = await buildAwardPdf(lang, slug, color, publicBaseUrl, internalBaseUrl);
  } catch (err) {
    const msg = (err as Error).message;
    if (msg === 'Award not found') return new NextResponse('Award not found', { status: 404 });
    console.error('[print/award] PDF render failed', {
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
