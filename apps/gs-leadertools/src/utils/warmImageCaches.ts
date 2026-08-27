import { loadSearchEngine } from '@/lib/search/engine/searchEngineLoader';
import { SortType, SortOrder } from '@/lib/search/api/search';
import { BADGE_QUERY_TYPE } from '@/lib/search/api/badge';
import { ACTIVITY_QUERY_TYPE } from '@/lib/search/api/activity';
import { locales, type Locale } from '@/lib/locale';
import { buildImagePath } from '@/utils/buildImagePath';
import { getOrProduceTransformedImage } from '@/lib/imageProxyCore';

// Stay below UV_THREADPOOL_SIZE (default 4) to leave headroom for live requests.
const WARM_CONCURRENCY = 3;

const DEFAULT_WIDTHS = [640, 828]; // landing Card widths; override via IMAGE_WARM_WIDTHS
const DEFAULT_QUALITY = 75;
const DEFAULT_COUNT = 8; // above-the-fold items per type per locale

const parseIntList = (raw: string | undefined, fallback: number[]): number[] => {
  if (!raw) return fallback;
  const parsed = raw
    .split(',')
    .map(s => Number.parseInt(s.trim(), 10))
    .filter(n => Number.isFinite(n) && n > 0);
  return parsed.length ? parsed : fallback;
};

const parseCount = (raw: string | undefined, fallback: number): number => {
  const n = raw ? Number.parseInt(raw, 10) : NaN;
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

async function runWithConcurrency(tasks: (() => Promise<void>)[], concurrency: number): Promise<void> {
  let i = 0;
  const worker = async () => {
    while (i < tasks.length) await tasks[i++]();
  };
  await Promise.all(Array.from({ length: concurrency }, worker));
}

const assetPathFromImagePath = (imagePath: string | undefined): string | undefined => {
  const src = buildImagePath(imagePath);
  return src.startsWith('/img/') ? src.slice('/img/'.length) : undefined;
};

// Pre-encodes the landing hot-set into the transform cache so users hit a warm cache on first paint.
export const warmImageCaches = async (): Promise<void> => {
  const engine = await loadSearchEngine.load();
  const widths = parseIntList(process.env.IMAGE_WARM_WIDTHS, DEFAULT_WIDTHS);
  const quality = parseCount(process.env.IMAGE_WARM_QUALITY, DEFAULT_QUALITY);
  const count = parseCount(process.env.IMAGE_WARM_COUNT, DEFAULT_COUNT);

  const baseQuery = {
    page: 0,
    limit: count,
    sort: { type: SortType.TITLE, order: SortOrder.ASCENDING },
  };

  const assetPaths = new Set<string>();
  for (const lang of locales) {
    const locale = lang as Locale;
    const [badgeResult, activityResult] = await Promise.all([
      engine.findBadges({ ...baseQuery, type: BADGE_QUERY_TYPE, lang: locale }).catch(() => ({ results: [] })),
      engine.findActivities({ ...baseQuery, type: ACTIVITY_QUERY_TYPE, lang: locale }).catch(() => ({ results: [] })),
    ]);
    for (const hit of [...badgeResult.results, ...activityResult.results]) {
      const assetPath = assetPathFromImagePath(hit.imagePath);
      if (assetPath) assetPaths.add(assetPath);
    }
  }

  const tasks: (() => Promise<void>)[] = [];
  for (const assetPath of assetPaths) {
    for (const width of widths) {
      tasks.push(() =>
        getOrProduceTransformedImage({ assetPath, width, quality, grayscale: false })
          .then(() => undefined)
          .catch(err => console.warn(`[warm:image] ${assetPath} w${width}`, err instanceof Error ? err.message : err))
      );
    }
  }

  const total = tasks.length;
  console.log(`[warm] Starting image pre-warm: ${total} variants (concurrency ${WARM_CONCURRENCY})`);
  const start = Date.now();
  await runWithConcurrency(tasks, WARM_CONCURRENCY);
  console.log(`[warm] Image pre-warm complete: ${total} variants in ${((Date.now() - start) / 1000).toFixed(1)}s`);
};
