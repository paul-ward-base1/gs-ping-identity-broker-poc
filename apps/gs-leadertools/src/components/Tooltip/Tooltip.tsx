import React, { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/utils/classNames';
import './Tooltip.scss';
import { TooltipProps } from './types';

const getBestPosition = (tooltipRect: DOMRect, containerRect: DOMRect) => {
  const spaceTop = containerRect.top;
  const spaceBottom = window.innerHeight - containerRect.bottom;
  const spaceLeft = containerRect.left;
  const spaceRight = window.innerWidth - containerRect.right;

  let vertical: 'top' | 'bottom' | null = null;

  if (spaceTop > tooltipRect.height) {
    vertical = 'top';
  } else if (spaceBottom > tooltipRect.height) {
    vertical = 'bottom';
  }

  let horizontal: 'left' | 'right' | null = null;

  if (spaceLeft > tooltipRect.width) {
    horizontal = 'left';
  } else if (spaceRight > tooltipRect.width) {
    horizontal = 'right';
  }

  return vertical ?? horizontal ?? 'top';
};

const bem = cn('tooltip');

export const Tooltip = ({ text, children }: TooltipProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<'top' | 'bottom' | 'left' | 'right'>('top');
  const [visible, setVisible] = useState(false);

  const showTooltip = () => setVisible(true);
  const hideTooltip = () => setVisible(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.stopPropagation();
    setVisible(prev => !prev);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const tooltip = tooltipRef.current;

    if (container && tooltip) {
      const containerRect = container.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();
      const bestPosition = getBestPosition(tooltipRect, containerRect);
      setPosition(bestPosition);
    }
  }, [visible]);

  // Hide on outside click/tap
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setVisible(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  return (
    <div
      className={bem()}
      role="tooltip"
      ref={containerRef}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onTouchStart={handleTouchStart}
    >
      {children}
      {visible && (
        <div className={bem('text', { position })} ref={tooltipRef}>
          {text}
        </div>
      )}
    </div>
  );
};
