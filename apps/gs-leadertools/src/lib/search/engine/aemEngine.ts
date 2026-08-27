import { fetchBadges } from '@/apis/badges';
import { fetchActivities } from '@/apis/activities';
import { fetchAwards } from '@/apis/awards';
import { SearchEngine } from './searchEngine';
import { BadgeQuery, BadgeSearchResult, BadgeHit } from '@/lib/search/api/badge';
import { ActivityQuery, ActivitySearchResult, ActivityHit } from '@/lib/search/api/activity';
import { SortOrder, SortType } from '@/lib/search/api/search';
import { BadgeModel } from '@/types/badge';
import { ActivityModel } from '@/types/activity';
import { AwardModel } from '@/types/award';
import { ProgramLevelIds } from '@/types/programLevel';

// Static numeric ordering for program levels — mirrors the order used by the OpenSearch index.
// Used in AEM mode where programLevel objects carry no order field.
const PROGRAM_LEVEL_ORDER: Record<string, number> = {
  [ProgramLevelIds.DAISY]: 0,
  [ProgramLevelIds.BROWNIE]: 1,
  [ProgramLevelIds.JUNIOR]: 2,
  [ProgramLevelIds.CADETTE]: 3,
  [ProgramLevelIds.SENIOR]: 4,
  [ProgramLevelIds.AMBASSADOR]: 5,
};

// Strip protocol + host from AEM image URLs, leaving just the /content/dam/... path
// so buildImagePath can prepend the correct configured AEM base URL.
const toRelativeImagePath = (url?: string | null): string | undefined => {
  if (!url) return undefined;
  try {
    return new URL(url).pathname;
  } catch {
    return url; // already relative
  }
};

// Mirror the regex patterns used by filters.ts to extract filter IDs from AEM paths.
// Filter queries carry these IDs, so mapped hits must use the same values for matching.
const idPatterns = {
  programLevel: /\/static\/program-levels\/[^/]+\/(.+)/i,
  theme: /\/static\/themes\/(.+)/i,
  badgeFamily: /\/static\/badge-families\/(.+)/i,
};

const extractId = (path: string | undefined, pattern: RegExp): string | undefined =>
  path ? (pattern.exec(path)?.[1] ?? undefined) : undefined;

const mapBadge = (item: BadgeModel): BadgeHit => ({
  path: item.path ?? '',
  name: item.badgeName ?? '',
  imagePath: toRelativeImagePath(item.image?.url) ?? item.image?.path,
  programLevel: extractId(item.programLevel?.path, idPatterns.programLevel) ?? item.programLevel?.id,
  theme: extractId(item.theme?.path, idPatterns.theme),
  family: extractId(item.badgeFamily?.path, idPatterns.badgeFamily),
  type: 'badge',
});

const mapAward = (item: AwardModel): BadgeHit => {
  const levelIds = item.programLevel?.map(p => extractId(p.path, idPatterns.programLevel) ?? p.id) ?? [];
  return {
    path: item.path ?? '',
    name: item.badgeName ?? '',
    imagePath: toRelativeImagePath(item.image?.url) ?? item.image?.path,
    programLevels: levelIds,
    programLevelOrders: levelIds.map(id => PROGRAM_LEVEL_ORDER[id]).filter((o): o is number => o !== undefined),
    theme: extractId(item.theme?.path, idPatterns.theme),
    family: extractId(item.badgeFamily?.path, idPatterns.badgeFamily),
    type: 'award',
  };
};

const mapActivity = (item: ActivityModel): ActivityHit => ({
  path: item.path ?? '',
  name: item.name ?? '',
  timeRange: item.timeRange,
  imagePath: toRelativeImagePath(item.image?.url) ?? item.image?.path,
  programLevels: item.programLevel?.map(p => extractId(p.path, idPatterns.programLevel) ?? p.id) ?? [],
  // themes and badgeFamilies are resolved via badgeConnection in AEM GraphQL
  themes: [
    ...new Set(
      (item.badgeConnection ?? []).map(b => extractId(b.theme?.path, idPatterns.theme)).filter(Boolean) as string[]
    ),
  ],
  badgeFamilies: [
    ...new Set(
      (item.badgeConnection ?? [])
        .map(b => extractId(b.badgeFamily?.path, idPatterns.badgeFamily))
        .filter(Boolean) as string[]
    ),
  ],
});

const applySort = <T extends BadgeHit | ActivityHit>(items: T[], sort: BadgeQuery['sort']): T[] => {
  if (!sort) return items;

  return [...items].sort((a, b) => {
    if (sort.type === SortType.TITLE) {
      const cmp = a.name.localeCompare(b.name);
      return sort.order === SortOrder.ASCENDING ? cmp : -cmp;
    }
    if (sort.type === SortType.PROGRAM_LEVEL) {
      const aOrders = (a as BadgeHit).programLevelOrders;
      const bOrders = (b as BadgeHit).programLevelOrders;
      if (aOrders !== undefined || bOrders !== undefined) {
        const sentinel = sort.order === SortOrder.ASCENDING ? Infinity : -Infinity;
        const toOrder = (hit: BadgeHit): number => {
          if (hit.programLevelOrders?.length) {
            return sort.order === SortOrder.ASCENDING
              ? Math.min(...hit.programLevelOrders)
              : Math.max(...hit.programLevelOrders);
          }
          if (hit.programLevel) {
            const n = PROGRAM_LEVEL_ORDER[hit.programLevel];
            if (n !== undefined) return n;
          }
          return sentinel;
        };
        const aOrder = toOrder(a as BadgeHit);
        const bOrder = toOrder(b as BadgeHit);
        if (aOrder !== bOrder) return sort.order === SortOrder.ASCENDING ? aOrder - bOrder : bOrder - aOrder;
        const cmp = a.name.localeCompare(b.name);
        return sort.order === SortOrder.ASCENDING ? cmp : -cmp;
      }
      const aLevel = (a as BadgeHit).programLevel ?? (a as BadgeHit | ActivityHit).programLevels?.[0] ?? '';
      const bLevel = (b as BadgeHit).programLevel ?? (b as BadgeHit | ActivityHit).programLevels?.[0] ?? '';
      const cmp = aLevel.localeCompare(bLevel);
      return sort.order === SortOrder.ASCENDING ? cmp : -cmp;
    }
    return 0;
  });
};

const paginate = <T>(items: T[], page: number, limit: number) => {
  const start = page * limit;
  return items.slice(start, start + limit);
};

const Engine = new (class implements SearchEngine {
  findBadges = async (query: BadgeQuery): Promise<BadgeSearchResult> => {
    const items: BadgeHit[] = (await fetchBadges(query.lang)).map(mapBadge);

    let filtered = items;

    if (query.filters?.programLevel?.length) {
      filtered = filtered.filter(b => b.programLevel && query.filters!.programLevel!.includes(b.programLevel));
    }
    if (query.filters?.theme?.length) {
      filtered = filtered.filter(b => b.theme && query.filters!.theme!.includes(b.theme));
    }
    if (query.filters?.badgeFamily?.length) {
      filtered = filtered.filter(b => b.family && query.filters!.badgeFamily!.includes(b.family));
    }

    const sorted = applySort(filtered, query.sort);
    const page = paginate(sorted, query.page, query.limit);

    return {
      results: page,
      total: filtered.length,
      hits: page.length,
      page: query.page,
      limit: query.limit,
    };
  };

  findBadgesAndAwards = async (query: BadgeQuery): Promise<BadgeSearchResult> => {
    const [badgeItems, awardItems] = await Promise.all([
      fetchBadges(query.lang).then(items => items.map(mapBadge)),
      fetchAwards(query.lang).then(items => items.map(mapAward)),
    ]);

    let filtered: BadgeHit[] = [...badgeItems, ...awardItems];

    if (query.filters?.programLevel?.length) {
      filtered = filtered.filter(item =>
        item.type === 'award'
          ? item.programLevels?.some(p => query.filters!.programLevel!.includes(p))
          : item.programLevel && query.filters!.programLevel!.includes(item.programLevel)
      );
    }
    if (query.filters?.theme?.length) {
      filtered = filtered.filter(item => item.theme && query.filters!.theme!.includes(item.theme));
    }
    if (query.filters?.badgeFamily?.length) {
      filtered = filtered.filter(item => item.family && query.filters!.badgeFamily!.includes(item.family));
    }

    const sorted = applySort(filtered, query.sort);
    const page = paginate(sorted, query.page, query.limit);

    return {
      results: page,
      total: filtered.length,
      hits: page.length,
      page: query.page,
      limit: query.limit,
    };
  };

  findActivities = async (query: ActivityQuery): Promise<ActivitySearchResult> => {
    const items: ActivityHit[] = (await fetchActivities(query.lang)).map(mapActivity);

    let filtered = items;

    if (query.filters?.programLevel?.length) {
      filtered = filtered.filter(a => a.programLevels?.some(p => query.filters!.programLevel!.includes(p)));
    }
    if (query.filters?.theme?.length) {
      filtered = filtered.filter(a => a.themes?.some(t => query.filters!.theme!.includes(t)));
    }
    if (query.filters?.badgeFamily?.length) {
      filtered = filtered.filter(a => a.badgeFamilies?.some(f => query.filters!.badgeFamily!.includes(f)));
    }

    const sorted = applySort(filtered, query.sort);
    const page = paginate(sorted, query.page, query.limit);

    return {
      results: page,
      total: filtered.length,
      hits: page.length,
      page: query.page,
      limit: query.limit,
    };
  };
})();

/**
 * AEM GraphQL implementation of SearchEngine.
 * Used in Universal Editor mode (SEARCH_TYPE=aem) to serve listing
 * data directly from AEM author without requiring OpenSearch.
 */
export default Engine as SearchEngine;
