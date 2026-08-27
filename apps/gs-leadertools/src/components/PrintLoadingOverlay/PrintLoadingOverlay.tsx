'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/utils/classNames';
import { useOverlay } from '@/utils/useOverlay';
import { Spinner } from '@/components/Spinner';
import './PrintLoadingOverlay.scss';

const bem = cn('print-loading-overlay');

interface PrintLoadingOverlayProps {
  isOpen: boolean;
  /** Visually-hidden status announced to assistive tech while the print is prepared. */
  label?: string;
}

export const PrintLoadingOverlay = ({ isOpen, label = 'Preparing print' }: PrintLoadingOverlayProps) => {
  useOverlay(isOpen);

  useEffect(() => {
    if (!isOpen) return;
    const els = ['main', '.gs-header', '.gs-footer']
      .flatMap(sel => Array.from(document.querySelectorAll<HTMLElement>(sel)))
      .filter((el): el is HTMLElement => el !== null);
    els.forEach(el => el.setAttribute('inert', ''));
    return () => els.forEach(el => el.removeAttribute('inert'));
  }, [isOpen]);

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div className={bem()} role="status" aria-live="polite">
      <Spinner onDark />
      <span className={bem('label')}>{label}</span>
    </div>,
    document.body
  );
};
