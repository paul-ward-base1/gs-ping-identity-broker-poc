import { getAemContextPath } from '@/lib/aemContext';
import { fetchAemData } from '@/lib/api';

export const fetchActivities = async (lang: string) => {
  const contextPath = getAemContextPath(lang);
  const rawPath = `activities;contextPath=${contextPath}`;
  const encodedPath = encodeURIComponent(rawPath);

  const {
    data: {
      activities: { items },
    },
  } = await fetchAemData(encodedPath);

  return items;
};

export const fetchActivity = async (activityContext: string, activityPath?: string) => {
  //activityContext should be activityDetails or activityPreview
  const rawPath = `${activityContext};path=${activityPath}`;

  const encodedPath = encodeURIComponent(rawPath);

  const {
    data: {
      activities: { items },
    },
  } = await fetchAemData(encodedPath);

  return items[0];
};
