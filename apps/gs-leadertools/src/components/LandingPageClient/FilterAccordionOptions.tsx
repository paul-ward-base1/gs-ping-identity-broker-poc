'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/utils/classNames';
import { Choice } from '@/components/Choice';
import { type Filter as FilterType } from '@/types/filter';
import { type FilterObject } from './types';

const bem = cn('landing');

interface ScrollThumb {
  size: number;
  offset: number;
}

interface FilterAccordionOptionsProps {
  filter: FilterObject;
  isFilterSelected: (type: string, option: FilterType) => boolean | undefined;
  handleMobileFiltersChange: (type: string, value: FilterType) => () => void;
}

// iOS Safari ignores ::-webkit-scrollbar styling entirely, so a custom
// thumb driven by the container's own scroll metrics is used instead of
// relying on native scrollbar theming.
export const FilterAccordionOptions = ({
  filter,
  isFilterSelected,
  handleMobileFiltersChange,
}: FilterAccordionOptionsProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [thumb, setThumb] = useState<ScrollThumb | null>(null);

  const updateThumb = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const { scrollHeight, clientHeight, scrollTop } = el;
    if (scrollHeight <= clientHeight) {
      setThumb(null);
      return;
    }

    const size = (clientHeight / scrollHeight) * 100;
    const offset = (scrollTop / (scrollHeight - clientHeight)) * (100 - size);
    setThumb({ size, offset });
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return undefined;

    updateThumb();
    const observer = new ResizeObserver(updateThumb);
    observer.observe(el);

    return () => observer.disconnect();
  }, [updateThumb]);

  return (
    <div className={bem('filter-options-wrapper')}>
      <div className={bem('filter-options')} ref={scrollRef} onScroll={updateThumb}>
        {filter.options.map(option => (
          <Choice
            id={option.id}
            key={option.id}
            label={option.label}
            value={option.value}
            checked={isFilterSelected(filter.type, option as FilterType)}
            onChange={handleMobileFiltersChange(filter.type, option as FilterType)}
          />
        ))}
      </div>
      {thumb && (
        <div className={bem('filter-scrollbar')} aria-hidden="true">
          <div
            className={bem('filter-scrollbar-thumb')}
            style={{ height: `${thumb.size}%`, top: `${thumb.offset}%` }}
          />
        </div>
      )}
    </div>
  );
};
