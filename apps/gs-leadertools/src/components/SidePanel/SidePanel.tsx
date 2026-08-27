import React from 'react';

import { Button } from '@/components/Button';
import { cn } from '@/utils/classNames';
import { useOverlay } from '@/utils/useOverlay';
import { useMediaQuery } from '@/utils/useMediaQuery';
import { SidePanelProps } from './types';
import './SidePanel.scss';

const bem = cn('side-panel');

export const SidePanel = (props: SidePanelProps) => {
  const { title = '', onClose, children, isOpen, printButton, programLevel, closeButtonAreaLabel } = props;

  // The panel is hidden at the `desktop` breakpoint (1025px, see _breakpoints.scss),
  // so only lock background scroll while it can actually be shown. Otherwise the
  // lock would persist after maximizing the window with the panel still "open".
  const isDesktop = useMediaQuery('(min-width: 1025px)');
  useOverlay(isOpen && !isDesktop);

  return (
    <div className={bem('container', { open: isOpen })}>
      <div className={bem('data', { open: isOpen, level: programLevel })}>
        <div className={bem('header')}>
          <span className={bem('title')}>{title}</span>
          <Button variant="icon-only" onClick={onClose} icon="close" ariaLabel={closeButtonAreaLabel} />
        </div>
        {!!printButton && (
          <span className={bem('print')}>
            <Button {...printButton} />
          </span>
        )}
        <div className={bem('content', { level: programLevel })}>{children}</div>
      </div>
    </div>
  );
};
