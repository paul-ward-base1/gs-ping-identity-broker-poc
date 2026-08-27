import { resolveDownloadUrl } from '@/utils/resolveDownloadUrl';
import { clickTracker } from '@/utils/gtmTracker';
import { getFileNameFromUrl } from '@/utils/getFileNameFromUrl';

const SAFARI_DOWNLOAD_DELAY_MS = 1000;

/** Triggers an individual browser download for each handout URL (no zip).
 *  Mirrors DownloadButton's URL handling and fires one 'pdf' tracking event
 *  per file, matching the single-download analytics.
 *
 *  Files are staggered with a 1 s delay between each one. Safari only honours
 *  one programmatic anchor.click() per user gesture; sequential scheduling via
 *  setTimeout works because all URLs are same-origin (/api/download proxy). */
export const downloadFiles = (urls: (string | undefined)[]): void => {
  urls.forEach((url, index) => {
    const href = resolveDownloadUrl(url);
    if (!href || !url) return;

    setTimeout(() => {
      const anchor = document.createElement('a');
      anchor.href = href;
      anchor.download = '';
      anchor.rel = 'noopener';
      anchor.style.display = 'none';
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);

      clickTracker('pdf', url, getFileNameFromUrl(url));
    }, index * SAFARI_DOWNLOAD_DELAY_MS);
  });
};
