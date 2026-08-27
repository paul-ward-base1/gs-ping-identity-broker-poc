const PRINT_IFRAME_ID = '__gs-print-pdf-iframe__';

const removePreviousIframe = () => {
  const existing = document.getElementById(PRINT_IFRAME_ID);
  if (existing?.parentNode) existing.parentNode.removeChild(existing);
};

// iPadOS 13+ reports "MacIntel" as platform — maxTouchPoints is the reliable signal.
export const isMobileOrTablet = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  const nav = navigator as Navigator & { maxTouchPoints?: number };
  if ((nav.maxTouchPoints ?? 0) > 1) return true;
  return /iPad|iPhone|iPod|Android|Mobile/i.test(navigator.userAgent);
};

const parseFilenameFromDisposition = (header: string | null): string | null => {
  if (!header) return null;
  const match = header.match(/filename\*?=(?:UTF-8'')?["']?([^"';\r\n]+)["']?/i);
  return match ? decodeURIComponent(match[1].trim()) : null;
};

const deriveFilename = (url: string): string => {
  const last = url.split('?')[0].split('#')[0].split('/').filter(Boolean).pop() ?? 'document';
  return /\.pdf$/i.test(last) ? last : `${last}.pdf`;
};

// Pre-fetching the blob on page mount is the only way to call navigator.share()
// without losing the transient user-activation context on iOS/WebKit.
// Awaiting a fetch inside a click handler drops the gesture budget (NotAllowedError).
interface CacheEntry {
  promise: Promise<{ blob: Blob; filename: string }>;
  status: 'pending' | 'ready' | 'error';
  result?: { blob: Blob; filename: string };
}

const blobCache = new Map<string, CacheEntry>();

export const warmPdfBlobCache = (url: string | null | undefined, signal?: AbortSignal): void => {
  if (!url || blobCache.has(url)) return;

  const entry: CacheEntry = { promise: null!, status: 'pending' };

  entry.promise = fetch(url, { signal })
    .then(async r => {
      if (!r.ok) throw new Error(`prefetch ${r.status}`);
      const filename = parseFilenameFromDisposition(r.headers.get('content-disposition')) ?? deriveFilename(url);
      const blob = await r.blob();
      entry.status = 'ready';
      entry.result = { blob, filename };
      return { blob, filename };
    })
    .catch(err => {
      entry.status = 'error';
      blobCache.delete(url);
      throw err;
    });

  blobCache.set(url, entry);
};

export const isBlobCached = (url: string | null | undefined): boolean =>
  !!url && blobCache.get(url)?.status === 'ready';

export const clearPdfBlobCache = (url: string | null | undefined): void => {
  if (url) blobCache.delete(url);
};

// Always resolves (never rejects) so useEffect callers don't need a catch.
export const awaitBlobCache = (url: string | null | undefined): Promise<void> => {
  if (!url) return Promise.resolve();
  const entry = blobCache.get(url);
  if (!entry) return Promise.resolve();
  return entry.promise.then(() => {}).catch(() => {});
};

const printViaHiddenIframe = (url: string, onPrepared?: () => void): Promise<void> =>
  new Promise(resolve => {
    removePreviousIframe();
    const iframe = document.createElement('iframe');
    iframe.id = PRINT_IFRAME_ID;
    iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden';
    iframe.src = url;

    iframe.onload = () => {
      onPrepared?.();
      setTimeout(() => {
        const cleanup = () => iframe.parentNode?.removeChild(iframe);
        try {
          // afterprint, not a timer — the preview renders the iframe's doc.
          iframe.contentWindow?.addEventListener('afterprint', cleanup, { once: true });
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch {
          window.open(url, '_blank', 'noopener,noreferrer');
          cleanup();
        }
        window.focus();
        resolve();
      }, 250);
    };

    iframe.onerror = () => {
      onPrepared?.();
      window.open(url, '_blank', 'noopener,noreferrer');
      iframe.parentNode?.removeChild(iframe);
      resolve();
    };

    document.body.appendChild(iframe);
  });

const printViaShareSheet = async (url: string): Promise<boolean> => {
  if (typeof navigator === 'undefined' || typeof navigator.share !== 'function') return false;

  const entry = blobCache.get(url);
  if (!entry?.result) return false;

  const { blob, filename } = entry.result;
  try {
    const file = new File([blob], filename, { type: blob.type || 'application/pdf' });
    // canShare is absent on iOS 14; only gate on it when present.
    if (typeof navigator.canShare === 'function' && !navigator.canShare({ files: [file] })) {
      return false;
    }
    await navigator.share({ files: [file], title: filename });
    return true;
  } catch (err) {
    if ((err as Error)?.name === 'AbortError') return true; // user cancelled share sheet
    return false;
  }
};

interface TriggerPdfPrintOptions {
  onPrepared?: () => void;
}

export const triggerPdfPrint = async (url: string, options?: TriggerPdfPrintOptions): Promise<void> => {
  const { onPrepared } = options ?? {};

  if (!isMobileOrTablet()) {
    await printViaHiddenIframe(url, onPrepared);
    return;
  }

  onPrepared?.();

  if (!isBlobCached(url)) {
    window.open(url, '_blank', 'noopener,noreferrer');
    return;
  }

  const shared = await printViaShareSheet(url);
  if (!shared) {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
};
