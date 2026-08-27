import { notFound } from 'next/navigation';
import { fetchActivity } from '@/apis/activities';
import { ActivityModel } from '@/types/activity';
import { buildCmsActivityPath } from '@/lib/aemContext';
import { ActivityPageClient } from '@/components/ActivityPageClient';
import { PageViewTracker } from '@/components/PageViewTracker';

type Props = {
  params: Promise<{ id?: string; lang: string; slug?: string[] }>;
};

const getActivityDetails = async (path: string) => {
  let actDetails: ActivityModel | null = null;
  try {
    actDetails = await fetchActivity('activityDetails', path);
  } catch (error) {
    console.error('Error fetching activity details:', error, { path });
    notFound();
  }

  return actDetails;
};

export default async function ActivityPage({ params }: Props) {
  const resolvedParams = await params;
  const { lang, slug = [] } = resolvedParams;

  const [type, maybeGroup, maybeSlug] = slug;
  let typeVal = type;
  let group: string | undefined;
  let slugVal: string;

  if (slug.length === 3) {
    group = maybeGroup;
    slugVal = maybeSlug;
  } else {
    slugVal = maybeGroup;
  }

  const activityPath = buildCmsActivityPath(lang, typeVal, slugVal, group);
  const activity = activityPath ? await getActivityDetails(activityPath) : null;

  if (!activity) {
    notFound();
  }

  return (
    <>
      <PageViewTracker contentType="activity" lang={lang} />
      <ActivityPageClient activity={activity} />
    </>
  );
}
