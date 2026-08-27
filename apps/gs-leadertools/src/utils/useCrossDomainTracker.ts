'use client';

import { useEffect, RefObject } from 'react';
import { clickTracker } from '@/utils/gtmTracker';
import { isExternalLink } from '@/utils/isExternalLink';

export const useCrossDomainTracker = (containerRef: RefObject<HTMLElement | null>) => {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a');
      if (!anchor?.href) return;
      if (anchor.closest('.gs-donor-recognition')) return;
      if (anchor.closest('.gs-button')) return;
      if (anchor.closest('.gs-download-button')) return;
      if (isExternalLink(anchor.href, window.location.hostname)) {
        clickTracker('cross_domain', anchor.href);
      }
    };

    container.addEventListener('click', handleClick);
    return () => container.removeEventListener('click', handleClick);
  }, [containerRef]);
};
