import { cache, isValidElement, type JSX } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { fetchAwards, fetchAwardDetailByPath, filterRelatedAwards } from '@/apis/awards';
import { getAemContextPath } from '@/lib/aemContext';
import { AwardModel } from '@/types/award';
import { AwardPageClient } from '@/components/AwardPageClient';
import { PageViewTracker } from '@/components/PageViewTracker';

type Props = {
  params: Promise<{ lang: string; slug?: string[] }>;
};

type AwardDetailsResult = {
  awardDetails: AwardModel;
  awardRelatedItems: AwardModel[];
  allAwards: AwardModel[];
};

const devEnv = process.env.ENV === 'dev';

const getAwardDetailByPath = cache(fetchAwardDetailByPath);
const getAwards = cache(fetchAwards);

// Let Next's `notFound()` sentinel propagate instead of logging it as an error.
const isNotFoundDigest = (error: unknown): boolean =>
  typeof (error as { digest?: string })?.digest === 'string' &&
  (error as { digest: string }).digest.startsWith('NEXT_NOT_FOUND');

/**
 * Resolve `/{slug}` or `/{level}/{slug}` to the award's AEM DAM path. The
 * leaf CF name often differs from the URL folder (e.g. Senior True North
 * lives at `/awards/senior/senior-true-north/senior-ambassador-true-north-
 * award`), so we always match against the awards list rather than building
 * the path. Returns `undefined` when nothing matches.
 */
const resolveAwardPath = async (lang: string, slug: string[]): Promise<string | undefined> => {
  if (slug.length === 0) return undefined;
  const all = await getAwards(lang);

  if (slug.length === 2) {
    const prefix = `${getAemContextPath(lang)}/awards/${slug[0]}/${slug[1]}/`;
    return all.find(a => a.path?.startsWith(prefix))?.path;
  }
  return all.find(a => a.path?.split('/').at(-2) === slug[0])?.path;
};

const getAwardDetails = async (lang: string, awardPath: string): Promise<JSX.Element | AwardDetailsResult> => {
  let awardDetails: AwardModel | undefined;
  let awardRelatedItems: AwardModel[] = [];
  let allAwards: AwardModel[] = [];

  try {
    awardDetails = await getAwardDetailByPath(awardPath);
    // Reuse the request-scoped cached list — also used to enrich nextAwards.
    allAwards = await getAwards(lang);
    if (awardDetails?.badgeFamily?.path) {
      awardRelatedItems = filterRelatedAwards(allAwards, awardDetails.badgeFamily.path, awardDetails.path ?? '');
    }
  } catch (error) {
    if ((error as Error).message === 'AEM_AUTHOR_UNAUTHENTICATED') {
      return (
        <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
          <h2>Not authenticated</h2>
          <p>
            Please use <strong>Local Developer Login</strong> in the Universal Editor toolbar to log in to AEM, then
            reload the page.
          </p>
        </div>
      );
    }
    if (isNotFoundDigest(error)) throw error;
    console.error('Error fetching award details:', error, { lang, awardPath });
    notFound();
  }

  if (!awardDetails) notFound();

  return { awardDetails, awardRelatedItems, allAwards };
};

export async function generateMetadata({ params }: Readonly<Props>): Promise<Metadata> {
  const { lang, slug = [] } = await params;
  const awardPath = await resolveAwardPath(lang, slug);
  if (!awardPath) return { title: 'Award' };
  try {
    const award = await getAwardDetailByPath(awardPath);
    return { title: award?.badgeName ?? 'Award' };
  } catch {
    return { title: 'Award' };
  }
}

export default async function AwardPage({ params }: Readonly<Props>) {
  const { lang, slug = [] } = await params;

  const awardPath = await resolveAwardPath(lang, slug);
  if (!awardPath) notFound();

  const details = await getAwardDetails(lang, awardPath!);
  if (isValidElement(details)) return details;
  const { awardDetails, awardRelatedItems, allAwards } = details as AwardDetailsResult;

  return (
    <>
      <PageViewTracker contentType="award" lang={lang} />
      <AwardPageClient
        awardDetails={awardDetails}
        awardRelatedItems={awardRelatedItems}
        allAwards={allAwards}
        devEnv={devEnv}
      />
    </>
  );
}
