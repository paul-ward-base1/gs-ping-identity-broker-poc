import { getAemContextPath } from '@/lib/aemContext';
import { fetchAemData } from '@/lib/api';

export const fetchBadges = async (lang: string) => {
  const contextPath = getAemContextPath(lang);
  const rawPath = `badges;contextPath=${contextPath}`;
  const encodedPath = encodeURIComponent(rawPath);

  const {
    data: {
      badges: { items },
    },
  } = await fetchAemData(encodedPath);

  return items;
};

export const fetchBadgeDetailById = async (lang: string, badgeId: string) => {
  const contextPath = getAemContextPath(lang);
  const rawPath = `badgeDetailsById;contextPath=${contextPath};badgeId=${badgeId}`;

  const encodedPath = encodeURIComponent(rawPath);

  const {
    data: {
      badges: { items },
    },
  } = await fetchAemData(encodedPath);

  return items[0];
};

export const fetchBadgeDetailByPath = async (badgePath?: string) => {
  const rawPath = `badgeDetailsByPath;path=${badgePath}`;

  const encodedPath = encodeURIComponent(rawPath);

  const {
    data: {
      badges: { items },
    },
  } = await fetchAemData(encodedPath);

  return items[0];
};

export const fetchRelatedBadges = async (lang: string, badgeFamilyPath: string, excludedPath: string) => {
  const contextPath = getAemContextPath(lang);
  const rawPath = `relatedBadges;contextPath=${contextPath};badgeFamilyPath=${badgeFamilyPath};excludedPath=${excludedPath}`;

  const encodedPath = encodeURIComponent(rawPath);

  const {
    data: {
      badgeList: { items },
    },
  } = await fetchAemData(encodedPath);

  return items;
};
