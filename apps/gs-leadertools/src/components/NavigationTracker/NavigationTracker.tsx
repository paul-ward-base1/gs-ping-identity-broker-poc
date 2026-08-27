'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

let nextIdx = 0;

const readIdx = (state: unknown): number | undefined => {
  if (state && typeof state === 'object' && 'vtkIdx' in state) {
    const value = (state as { vtkIdx: unknown }).vtkIdx;
    if (typeof value === 'number' && Number.isFinite(value)) return value;
  }
  return undefined;
};

export const NavigationTracker = () => {
  const pathname = usePathname();
  const search = useSearchParams().toString();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const state = window.history.state ?? {};
    let idx = readIdx(state);
    if (idx === undefined) {
      idx = nextIdx;
      try {
        window.history.replaceState({ ...state, vtkIdx: idx }, '');
      } catch {}
    }
    nextIdx = Math.max(nextIdx, idx + 1);

    if (sessionStorage.getItem('vtk:entry-idx') === null) {
      sessionStorage.setItem('vtk:entry-idx', String(idx));
    }
  }, [pathname, search]);

  return null;
};
