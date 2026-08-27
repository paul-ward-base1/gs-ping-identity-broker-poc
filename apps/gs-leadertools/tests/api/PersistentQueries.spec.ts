import { test, expect } from '@playwright/test';

const QUERY_LIST: Record<string, Record<string, string>> = {
  activityDetails: { path: '' },
  activityPreview: { path: '' },
  activities: { contextPath: '' },
  badgeDetailsById: { contextPath: '', badgeId: '' },
  badgeDetailsByPath: { path: '' },
  badges: { contextPath: '' },
  relatedBadges: { contextPath: '', badgeFamilyPath: '' },
  awardDetails: { path: '' },
  awards: { contextPath: '' },
  filters: { contextPath: '' },
  dictionaries: { contextPath: '' },
};

for (const query in QUERY_LIST) {
  test.describe(query, () => {
    test(`should return error and no data when no parameter is sent`, async ({ request }) => {
      const parameters = encodeURI(`${query};`);
      const url = `${parameters}`;
      const response = await request.get(url);
      expect(response.ok()).toBeTruthy();
      expect((await response.json()).errors).not.toBeNull();
      expect((await response.json()).data).toBeUndefined();
    });

    test(`should return data and no error when parameters are sent`, async ({ request }) => {
      const queryParams = Object.keys(QUERY_LIST[query])
        .map(key => `${key}=${QUERY_LIST[query][key]}`)
        .join(';');
      const parameters = encodeURI(`${query};${queryParams}`);
      const url = `${parameters}`;
      const response = await request.get(url);
      expect(response.ok()).toBeTruthy();
      expect((await response.json()).data).not.toBeUndefined();
      expect((await response.json()).data).not.toBeNull();
      expect((await response.json()).errors).toBeUndefined();
    });
  });
}
