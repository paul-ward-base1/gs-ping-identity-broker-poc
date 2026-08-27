'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/utils/classNames';
import { Button } from '@/components/Button';
import { SideRailBox } from '@/components/SideRailBox/SideRailBox';
import { PrintMenu } from '@/components/PrintMenu';
import { SideRailItemsProps, SideRailProps } from './types';
import './SideRail.scss';

const bem = cn('side-rail');

export const SideRail = ({
  items,
  badgeProgramLevel,
  handlePrintClick,
  printButtonProps,
  printDisabled,
  hidePrint,
  onPrintColor,
  printColorOptionLabels,
}: SideRailProps) => {
  const [hasScrollbar, setHasScrollbar] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const checkScroll = useCallback(() => {
    const el = contentRef.current;
    if (!el) return;

    setHasScrollbar(el.scrollHeight > el.clientHeight);
  }, [contentRef.current]);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [contentRef.current]);

  return (
    <div className={bem({ level: badgeProgramLevel })}>
      {!hidePrint && (
        <div className={bem('print')} data-testid="print-button">
          {onPrintColor ? (
            <PrintMenu
              triggerLabel={printButtonProps?.label}
              triggerAriaLabel={printButtonProps?.hint}
              disabled={printDisabled}
              onPrint={onPrintColor}
              blackWhiteLabel={printColorOptionLabels?.blackWhite ?? 'Black and White'}
              colorLabel={printColorOptionLabels?.color ?? 'Color'}
            />
          ) : (
            <Button
              variant="tertiary"
              size="small"
              label={printButtonProps?.label}
              ariaLabel={printButtonProps?.hint}
              icon={'printer'}
              onClick={() => handlePrintClick?.()}
              disabled={printDisabled}
              ctaType="print"
            />
          )}
        </div>
      )}
      <div ref={contentRef} className={bem('content', { scroll: hasScrollbar, level: badgeProgramLevel })}>
        {!!items?.length &&
          items?.map((el: SideRailItemsProps) => (
            <SideRailBox
              key={el.id}
              icon={el.icon}
              title={el.title}
              count={el.count}
              items={el.items}
              type={el.type}
              level={badgeProgramLevel}
            />
          ))}
      </div>
    </div>
  );
};
