import { useEffect } from 'react';

// Ref-count concurrent callers so the last one to close removes the class.
let activeCount = 0;

export const useOverlay = (isOpen: boolean) => {
  useEffect(() => {
    if (isOpen) {
      activeCount++;
      document.querySelector('body')?.classList.add('blockScroll');
    }
    return () => {
      if (isOpen) {
        activeCount = Math.max(0, activeCount - 1);
        if (activeCount === 0) {
          document.querySelector('body')?.classList.remove('blockScroll');
        }
      }
    };
  }, [isOpen]);
};
