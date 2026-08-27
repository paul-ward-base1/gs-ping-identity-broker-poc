import { useCallback, useEffect, useRef, useState } from 'react';
import {
  triggerPdfPrint,
  warmPdfBlobCache,
  isBlobCached,
  awaitBlobCache,
  isMobileOrTablet,
  clearPdfBlobCache,
} from '@/utils/triggerPdfPrint';

const PRINT_PREPARE_TIMEOUT_MS = 10_000;

export const usePrintWithLoading = (pdfUrl: string | null) => {
  const [isPrintLoading, setIsPrintLoading] = useState(false);
  const [printDisabled, setPrintDisabled] = useState(false);
  const loadingRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const dismissOverlay = useCallback(() => {
    setIsPrintLoading(false);
  }, []);

  const reset = useCallback(() => {
    clearTimer();
    loadingRef.current = false;
    setIsPrintLoading(false);
  }, [clearTimer]);

  const handlePrint = useCallback(
    (color = false) => {
      if (!pdfUrl || loadingRef.current) return;

      loadingRef.current = true;
      setIsPrintLoading(true);
      timeoutRef.current = setTimeout(reset, PRINT_PREPARE_TIMEOUT_MS);

      const url = `${pdfUrl}${color ? '?color=true' : ''}`;
      void triggerPdfPrint(url, { onPrepared: dismissOverlay }).finally(reset);
    },
    [pdfUrl, reset, dismissOverlay]
  );

  useEffect(() => {
    if (!pdfUrl || !isMobileOrTablet()) return;
    const urls = [pdfUrl, `${pdfUrl}?color=true`];
    const ac = new AbortController();
    if (urls.some(u => !isBlobCached(u))) {
      // Client-only set: depends on isMobileOrTablet()/blob cache, which must not
      // run during SSR. Moving it to a render-time initializer would compute a
      // different value on the server and mismatch the button's disabled attr.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPrintDisabled(true);
      urls.forEach(u => warmPdfBlobCache(u, ac.signal));
    }
    let cancelled = false;
    Promise.all(urls.map(awaitBlobCache)).then(() => {
      if (!cancelled) setPrintDisabled(false);
    });
    return () => {
      cancelled = true;
      ac.abort();
      urls.forEach(clearPdfBlobCache);
    };
  }, [pdfUrl]);

  useEffect(() => () => clearTimer(), [clearTimer]);

  return { handlePrint, isPrintLoading, printDisabled };
};
