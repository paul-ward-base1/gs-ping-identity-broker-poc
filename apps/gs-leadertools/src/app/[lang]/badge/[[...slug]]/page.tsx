import { isValidElement, type JSX } from 'react';
import { notFound } from 'next/navigation';
import { fetchBadgeDetailByPath, fetchRelatedBadges } from '@/apis/badges';
import { buildAemBadgePath } from '@/lib/aemContext';
import { BadgeModel, RelatedBadgeModel } from '@/types/badge';
import { BadgePageClient } from '@/components/BadgePageClient';
import { PageViewTracker } from '@/components/PageViewTracker';
import { BadgeAuthBanner } from '@/components/BadgeAuthGate';
import { LeaderBadgeTools } from '@/components/LeaderBadgeTools';

type Props = {
  params: Promise<{ id?: string; lang: string; slug?: string[] }>;
};

type BadgeDetailsResult = {
  badgeDetails: BadgeModel;
  badgeRelatedItems: RelatedBadgeModel[];
};

const devEnv = process.env.ENV === 'dev';

const getBadgeDetails = async (
  lang: string,
  badgePath: string,
): Promise<JSX.Element | BadgeDetailsResult> => {
  let badgeDetails: BadgeModel;
  let badgeRelatedItems: RelatedBadgeModel[] = [];

  try {
    badgeDetails = await fetchBadgeDetailByPath(badgePath);

    if (badgeDetails?.badgeFamily?.path) {
      badgeRelatedItems = await fetchRelatedBadges(lang, badgeDetails.badgeFamily.path, badgeDetails?.path ?? '');
    }
  } catch (error) {
    if ((error as Error).message === 'AEM_AUTHOR_UNAUTHENTICATED') {
      return <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
        <h2>Not authenticated</h2>
        <p>Please use <strong>Local Developer Login</strong> in the Universal Editor toolbar to log in to AEM, then reload the page.</p>
      </div>;
    }
    console.error('Error fetching badge details:', error, { lang, badgePath });
    notFound();
  }
  return { badgeDetails, badgeRelatedItems };
};

export default async function BadgePage({ params }: Readonly<Props>) {
  const resolvedParams = await params;

  const { lang, slug = [] } = resolvedParams;

  let badgePath;

  if (slug.length === 2) {
    const [level, badge] = slug;
    badgePath = buildAemBadgePath(lang, level, badge);
  }

  if (slug.length === 1) {
    const [flat] = slug;
    const [level, badge, id] = flat.split('_');
    badgePath = buildAemBadgePath(lang, level, badge, id);

    if (!level || !badge) return notFound();
  }

  let badgeDetails: BadgeModel = {};
  let badgeRelatedItems: RelatedBadgeModel[] = [];

  if (badgePath && lang) {
    const details = await getBadgeDetails(lang, badgePath);
    if (isValidElement(details)) return details;
    const result = details as BadgeDetailsResult;
    badgeDetails = result.badgeDetails;
    badgeRelatedItems = result.badgeRelatedItems;
  }

  if (!badgeDetails) {
    notFound();
  }

  return (
    <>
      <PageViewTracker contentType="badge" lang={lang} />
      <BadgeAuthBanner />
      <BadgePageClient badgeDetails={badgeDetails} badgeRelatedItems={badgeRelatedItems} devEnv={devEnv} />
      <LeaderBadgeTools />
    </>
  );
}
