import { getAemContextPath } from '@/lib/aemContext';
import { fetchAemData } from '@/lib/api';
import { AwardModel } from '@/types/award';

export const fetchAwards = async (lang: string): Promise<AwardModel[]> => {
  const contextPath = getAemContextPath(lang);
  const rawPath = `awards;contextPath=${contextPath}`;
  const encodedPath = encodeURIComponent(rawPath);

  const {
    data: {
      awards: { items },
    },
  } = await fetchAemData(encodedPath);

  return items;
};

export const fetchAwardDetailByPath = async (awardPath?: string): Promise<AwardModel | undefined> => {
  if (!awardPath) return undefined;
  const rawPath = `awardDetails;path=${awardPath}`;
  const encodedPath = encodeURIComponent(rawPath);

  const {
    data: {
      awards: { items },
    },
  } = await fetchAemData(encodedPath);

  return items?.[0];
};

// No `relatedAwards` persisted query yet — filter the already-fetched awards
// list by `badgeFamily.path`. Caller passes the cached list so this doesn't
// trigger a second `fetchAwards` round-trip per render.
export const filterRelatedAwards = (
  all: AwardModel[],
  badgeFamilyPath: string | undefined,
  excludedPath: string
): AwardModel[] => {
  if (!badgeFamilyPath) return [];
  return all.filter(a => a.badgeFamily?.path === badgeFamilyPath && a.path !== excludedPath);
};
