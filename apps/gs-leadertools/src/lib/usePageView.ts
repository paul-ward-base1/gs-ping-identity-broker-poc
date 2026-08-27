'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { pushToDataLayer } from './gtm';
import { getPageMetaData } from './pageMetaData';

const cleanData = (data: object) => {
  return Object.fromEntries(
    Object.entries(data).filter(([_, value]) => value != null) // removes null and undefined
  );
};

export const usePageView = (contentType: string, lang?: string) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastPathRef = useRef<string | null>(null);

  useEffect(() => {
    const fullPath = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');

    if (lastPathRef.current === fullPath) return;
    lastPathRef.current = fullPath;

    const pageData = getPageMetaData(pathname, lang);

    pageData.content_type = contentType;

    pushToDataLayer(cleanData(pageData));
  }, [contentType, pathname, searchParams, lang]);
};
