import { useEffect } from 'react';

export const usePrintShortcut = (handler: () => void) => {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const isPrintShortcut =
        (event.ctrlKey || event.metaKey) && !event.shiftKey && !event.altKey && event.key.toLowerCase() === 'p';
      if (!isPrintShortcut) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      handler();
    };
    window.addEventListener('keydown', onKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', onKeyDown, { capture: true });
  }, [handler]);
};
