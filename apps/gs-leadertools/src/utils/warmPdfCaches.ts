import { loadSearchEngine } from '@/lib/search/engine/searchEngineLoader';
import { SortType, SortOrder } from '@/lib/search/api/search';
import { BADGE_QUERY_TYPE } from '@/lib/search/api/badge';
import { ACTIVITY_QUERY_TYPE } from '@/lib/search/api/activity';
import { locales, type Locale } from '@/lib/locale';
import { normalizeBadgePath, normalizeActivityPath } from '@/lib/aemContext';
import { pdfBadgeCache, pdfActivityCache } from './pdfCache';
import { fetchErrorDetails } from './fetchErrorDetails';

// Stay below UV_THREADPOOL_SIZE (default 4) to leave headroom for live user requests.
const WARM_CONCURRENCY = 3;
const WARM_PAGE_SIZE = 500;

async function runWithConcurrency(tasks: (() => Promise<void>)[], concurrency: number): Promise<void> {
  let i = 0;
  const worker = async () => {
    while (i < tasks.length) await tasks[i++]();
  };
  await Promise.all(Array.from({ length: concurrency }, worker));
}

/**
 * Pre-renders every badge / activity PDF by self-fetching the print routes.
 *
 * `internalBaseUrl` MUST be reachable from inside the container (typically
 * http://127.0.0.1:${PORT}, see getInternalBaseUrl). Pointing this at the
 * public hostname will time out behind AWS hairpin NAT.
 */
export const warmPdfCaches = async (internalBaseUrl: string, publicBaseUrl: string): Promise<void> => {
  const engine = await loadSearchEngine.load();
  const tasks: (() => Promise<void>)[] = [];

  const baseQuery = {
    page: 0,
    limit: WARM_PAGE_SIZE,
    sort: { type: SortType.TITLE, order: SortOrder.ASCENDING },
  };

  for (const lang of locales) {
    const locale = lang as Locale;

    const [badgeResult, activityResult] = await Promise.all([
      engine.findBadges({ ...baseQuery, type: BADGE_QUERY_TYPE, lang: locale }).catch(() => ({ results: [] })),
      engine.findActivities({ ...baseQuery, type: ACTIVITY_QUERY_TYPE, lang: locale }).catch(() => ({ results: [] })),
    ]);

    for (const badge of badgeResult.results) {
      if (!badge.path) continue;
      try {
        const normalized = normalizeBadgePath(badge.path);
        const [, level, slug] = normalized.split('/');
        if (!level || !slug) continue;
        if (pdfBadgeCache.has(`${lang}:${level}:${slug}:${publicBaseUrl}`)) continue;
        const url = `${internalBaseUrl}/api/print/badge/${lang}/${level}/${slug}?origin=${encodeURIComponent(publicBaseUrl)}`;
        tasks.push(() =>
          fetch(url)
            .then(r => {
              if (!r.ok) console.warn(`[warm:badge] ${url} → ${r.status}`);
              return r.body?.cancel();
            })
            .catch(err => console.warn(`[warm:badge] ${url}`, fetchErrorDetails(err)))
        );
      } catch {
        // skip malformed paths
      }
    }

    for (const activity of activityResult.results) {
      if (!activity.path) continue;
      try {
        const normalized = normalizeActivityPath(activity.path);
        const afterActivity = normalized.split('/activity/')[1];
        if (!afterActivity) continue;
        const slugKey = `${lang}:${afterActivity.replace(/\//g, ':')}`;
        if (pdfActivityCache.has(`${slugKey}:${publicBaseUrl}`)) continue;
        const url = `${internalBaseUrl}/api/print/activity/${lang}/${afterActivity}?origin=${encodeURIComponent(publicBaseUrl)}`;
        tasks.push(() =>
          fetch(url)
            .then(r => {
              if (!r.ok) console.warn(`[warm:activity] ${url} → ${r.status}`);
              return r.body?.cancel();
            })
            .catch(err => console.warn(`[warm:activity] ${url}`, fetchErrorDetails(err)))
        );
      } catch {
        // skip malformed paths
      }
    }
  }

  const total = tasks.length;
  console.log(`[warm] Starting PDF pre-warm: ${total} PDFs (concurrency ${WARM_CONCURRENCY})`);
  const start = Date.now();
  await runWithConcurrency(tasks, WARM_CONCURRENCY);
  console.log(`[warm] PDF pre-warm complete: ${total} PDFs in ${((Date.now() - start) / 1000).toFixed(1)}s`);
};
