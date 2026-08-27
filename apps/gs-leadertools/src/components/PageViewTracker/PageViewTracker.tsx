'use client';

import { usePageView } from '@/lib/usePageView';

export const PageViewTracker = ({ contentType, lang }: { contentType: string; lang?: string }) => {
  usePageView(contentType, lang);
  return null;
};
