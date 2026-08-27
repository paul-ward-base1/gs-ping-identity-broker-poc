'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { cn } from '@/utils/classNames';
import { CaretLeftIcon } from '@/components/Icons';
import './Breadcrumb.scss';

const bem = cn('breadcrumb');

const readNumber = (raw: unknown): number | null => {
  if (typeof raw !== 'number' && typeof raw !== 'string') return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
};

const DOUBLE_CLICK_MS = 400;

export const Breadcrumb = () => {
  const router = useRouter();
  const { lang } = useParams<{ lang: string }>();

  const handleBack = () => {
    const now = Date.now();
    const last = readNumber(sessionStorage.getItem('vtk:back-at')) ?? 0;
    if (now - last < DOUBLE_CLICK_MS) return;
    sessionStorage.setItem('vtk:back-at', String(now));

    const state = window.history.state;
    const currentIdx =
      state && typeof state === 'object' && 'vtkIdx' in state
        ? readNumber((state as { vtkIdx: unknown }).vtkIdx)
        : null;
    const entryIdx = readNumber(sessionStorage.getItem('vtk:entry-idx'));

    if (currentIdx !== null && entryIdx !== null && currentIdx > entryIdx) {
      router.back();
    } else {
      router.push(`/${lang}`);
    }
  };

  return (
    <div className={bem()} onClick={handleBack}>
      <CaretLeftIcon className={bem('icon')} />
      <span className={bem('text')}>Back</span>
    </div>
  );
};
