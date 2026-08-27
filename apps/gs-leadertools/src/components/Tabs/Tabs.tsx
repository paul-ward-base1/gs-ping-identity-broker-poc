'use client';

import React, { useCallback, useRef } from 'react';
import { cn } from '@/utils/classNames';
import './Tabs.scss';
import { TabsProps } from './types';

const bem = cn('tabs');

export const Tabs = ({ tabs, onTabChange, activeTabIndex }: TabsProps) => {
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleTabClick = useCallback(
    (index: number) => () => {
      if (onTabChange) {
        onTabChange(index);
      }
    },
    []
  );

  const handleKeyDown = useCallback(
    (index: number) => (e: React.KeyboardEvent) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      const next = e.key === 'ArrowRight' ? (index + 1) % tabs.length : (index - 1 + tabs.length) % tabs.length;
      onTabChange?.(next);
      buttonRefs.current[next]?.focus();
    },
    [tabs.length, onTabChange]
  );

  return (
    <div className={bem()} role="tablist">
      {tabs.map((tab, index) => (
        <button
          key={tab.label}
          ref={el => {
            buttonRefs.current[index] = el;
          }}
          role="tab"
          aria-selected={index === activeTabIndex}
          tabIndex={index === activeTabIndex ? 0 : -1}
          className={bem('tab', { active: index === activeTabIndex })}
          onClick={handleTabClick(index)}
          onKeyDown={handleKeyDown(index)}
        >
          <span className={bem('label')}>{tab.label}</span>
        </button>
      ))}
    </div>
  );
};
