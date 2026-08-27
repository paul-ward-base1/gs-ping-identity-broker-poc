import { useEffect, useRef, useCallback, RefObject } from 'react';
import { scrollTracker, ScrollEventType, ScrollEventData, ScrollContentType, ScrollDirection, ScrollThreshold } from '@/utils/gtmTracker';
import { ProgramLevelEnum } from '@/types/programLevel';

const SCROLL_THRESHOLDS = [25, 50, 75, 90] as const;

interface UseScrollTrackerProps {
  contentType: ScrollContentType;
  programLevel?: string;
  theme?: string;
  enabled?: boolean;
}

export const useScrollTracker = ({ contentType, programLevel, theme, enabled = true }: UseScrollTrackerProps) => {
  const triggeredVerticalThresholds = useRef<Set<number>>(new Set());
  const triggeredHorizontalThresholds = useRef<Set<number>>(new Set());
  const isTrackingEnabled = useRef(enabled);
  const ticking = useRef(false);

  const calculateScrollPercentage = useCallback((direction: 'vertical' | 'horizontal') => {
    if (direction === 'vertical') {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      return scrollHeight <= 0 ? 0 : Math.round((scrollTop / scrollHeight) * 100);
    } else {
      const scrollLeft = window.scrollX || document.documentElement.scrollLeft;
      const scrollWidth = document.documentElement.scrollWidth - window.innerWidth;
      return scrollWidth <= 0 ? 0 : Math.round((scrollLeft / scrollWidth) * 100);
    }
  }, []);

  // Helper function to track scroll events
  const trackScrollEvent = useCallback(
    (threshold: ScrollThreshold, direction: ScrollDirection, triggeredSet: RefObject<Set<number>>) => {
      if (!triggeredSet.current.has(threshold)) {
        triggeredSet.current.add(threshold);

        const eventType: ScrollEventType = `scroll_${threshold}` as ScrollEventType;
        const eventData: ScrollEventData = {
          scrollDirection: direction,
          scrollThreshold: threshold,
          content_type: contentType,
          program_level: programLevel as ProgramLevelEnum,
          theme: theme ?? '',
        };

        scrollTracker(eventType, eventData);
      }
    },
    [contentType, programLevel, theme]
  );

  const checkScrollThresholds = useCallback(
    (direction: ScrollDirection, triggeredSet: RefObject<Set<number>>) => {
      const scrollPercentage = calculateScrollPercentage(direction);
      SCROLL_THRESHOLDS.forEach(threshold => {
        if (scrollPercentage >= threshold) {
          trackScrollEvent(threshold, direction, triggeredSet);
        }
      });
    },
    [calculateScrollPercentage, trackScrollEvent]
  );

  const handleScroll = useCallback(() => {
    if (!isTrackingEnabled.current) return;

    checkScrollThresholds('vertical', triggeredVerticalThresholds);
    checkScrollThresholds('horizontal', triggeredHorizontalThresholds);
  }, [checkScrollThresholds]);

  const throttledHandleScroll = useCallback(() => {
    if (!ticking.current) {
      requestAnimationFrame(() => {
        handleScroll();
        ticking.current = false;
      });
      ticking.current = true;
    }
  }, [handleScroll]);

  const resetTracker = useCallback(() => {
    triggeredVerticalThresholds.current.clear();
    triggeredHorizontalThresholds.current.clear();
  }, []);

  useEffect(() => {
    isTrackingEnabled.current = enabled;
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('scroll', throttledHandleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
    };
  }, [throttledHandleScroll, enabled]);

  return { resetTracker };
};
