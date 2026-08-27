import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

import { useScrollTracker } from '@/utils/useScrollTracker';
import { useDebouncedCallback } from '@/utils/useDebouncedCallback';
import { pushToDataLayer } from '@/lib/gtm';
import { SearchQuery, SearchResult, SortOrder, SortType } from '@/lib/search/api/search';
import { badgeQueryFactory } from '@/lib/search/query/badgeQueryFactory';
import { badgeSearchUrlFactory } from '@/lib/search/url/badgeSearchUrlFactory';
import { activitySearchUrlFactory } from '@/lib/search/url/activitySearchUrlFactory';
import { activityQueryFactory } from '@/lib/search/query/activityQueryFactory';
import { normalizeActivityPath, normalizeAwardPath, normalizeBadgePath } from '@/lib/aemContext';
import { CardProps } from '@/components/Card/types';
import { FilterType, SearchResultItem, SelectedFilter, SortOption, SortOptionEnum } from './types';
import { useAEMFilters } from '@/components/contexts/locale-context';
import { TagProps } from '@/components/Tag/types';
import { ProgramLevelEnum, ProgramLevelIds } from '@/types/programLevel';
import { Filter } from '@/types/filter';
import { decodeFiltersFromUrl } from '@/utils/urlUtils';
import { DEFAULT_LIMIT } from '@/lib/search/url/constants';
import { TranslateFn } from '@/types/i18n';

const initialSearchResult: SearchResult<CardProps> = {
  hits: 0,
  limit: 0,
  page: 0,
  totalPages: 0,
  results: [],
  total: 0,
};

const filterTypeTrackValues: Record<FilterType, string> = {
  programLevel: 'program',
  theme: 'theme',
  badgeFamily: 'Badge Family',
};

const mapSearchResults = (
  data: SearchResultItem[],
  type: string,
  aemProgramLevels: Filter[],
  translate: TranslateFn
) => {
  if (type === 'badge') {
    return data?.map((badge: SearchResultItem) => {
      if (badge.type === 'award') {
        const hasAllLevels =
          (aemProgramLevels?.length ?? 0) > 0 &&
          aemProgramLevels.every(level => badge?.programLevels?.includes(level.name));
        return {
          id: badge?.path,
          type: 'badge',
          title: badge?.name,
          theme: badge?.theme ?? '',
          link: normalizeAwardPath(badge?.path),
          cardImage: badge?.imagePath,
          programLevels: hasAllLevels
            ? [{ id: ProgramLevelIds.ALL, level: translate('global.programLevel.allProgramLevels.label') }]
            : (badge?.programLevels?.map(el => ({
                id: aemProgramLevels.find(level => level.name === el)?.id ?? ProgramLevelIds.MULTI,
                level: el as ProgramLevelEnum,
              })) ?? []),
        } as CardProps;
      }
      return {
        id: badge?.path,
        type: 'badge',
        title: badge?.name,
        theme: badge?.theme ?? '',
        link: normalizeBadgePath(badge?.path),
        cardImage: badge?.imagePath,
        programLevels: [
          {
            id: aemProgramLevels.find(level => level.name === badge?.programLevel)?.id ?? ProgramLevelIds.MULTI,
            level: badge?.programLevel as ProgramLevelEnum,
          } as TagProps,
        ],
      } as CardProps;
    }) as CardProps[];
  }

  return data.map(item => {
    const hasAllLevels = aemProgramLevels?.length === item?.programLevels?.length;
    return {
      id: item?.path,
      type,
      title: item?.name,
      theme: item?.theme ?? '',
      time: item?.timeRange,
      cardImage: item?.imagePath,
      link: normalizeActivityPath(item?.path),
      programLevels: hasAllLevels
        ? [
            {
              id: ProgramLevelIds.ALL,
              level: translate('global.programLevel.allProgramLevels.label'),
            },
          ]
        : item?.programLevels?.map(el => ({
            id: aemProgramLevels.find(level => level.name === el)?.id ?? ProgramLevelIds.MULTI,
            level: el as ProgramLevelEnum,
          })),
    };
  }) as CardProps[];
};

export const useLandingPageClient = (lang: string) => {
  const { t } = useTranslation();

  const aemFilters = useAEMFilters();

  const [activityResults, setActivityResults] = useState<SearchResult<CardProps>>(initialSearchResult);
  const [badgeResults, setBadgeResults] = useState<SearchResult<CardProps>>(initialSearchResult);
  const [loading, setLoading] = useState(true);
  const [sidePanelOpened, setSidePanelOpened] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilter[]>([]);
  const [activeTabIndex, setActiveTabIndex] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(false);
  const lastPageViewRef = useRef<{ tab: string; lang: string } | null>(null);

  const tabs = useMemo(
    () => [
      {
        id: 'badge',
        label:
          badgeResults?.total > 1
            ? t('search.button.badge.label.pluralFormat', { number: badgeResults?.total })
            : t('search.button.badge.label.singularFormat', { number: badgeResults?.total }),
        ariaLabel: t('search.button.activity.hintFormat', { number: badgeResults?.total }),
      },
      {
        id: 'activity',
        label:
          activityResults.total > 1
            ? t('search.button.activity.label.pluralFormat', { number: activityResults.total })
            : t('search.button.activity.label.singularFormat', { number: activityResults.total }),
        ariaLabel: t('search.button.activity.hintFormat', { number: activityResults.total }),
      },
    ],
    [badgeResults, activityResults, t]
  );

  const activeResults = useMemo(() => {
    return activeTabIndex === 0 ? badgeResults : activityResults;
  }, [activeTabIndex, badgeResults, activityResults]);

  const totalResults = useMemo(() => {
    return badgeResults?.total + activityResults?.total;
  }, [badgeResults, activityResults]);

  const paginationLabels = useMemo(() => {
    const isBadgeTabActive = activeTabIndex === 0;
    const results = isBadgeTabActive ? badgeResults : activityResults;
    const isSingleResult = results.total === 1;

    return {
      prefixLabel: t('search.pagination.results.prefix'),
      suffixLabel: isSingleResult
        ? t('search.pagination.results.suffix.singularFormat', { count: results.total })
        : t('search.pagination.results.suffix.pluralFormat', { count: results.total }),
      resultsLabel: isSingleResult
        ? t('search.pagination.results.page.singularFormat', { low: results.total })
        : t('search.pagination.results.page.pluralFormat', {
            low: results.page === 0 ? 1 : results.page * results.limit + 1,
            high:
              (results.page + 1) * results.limit > results.total ? results.total : (results.page + 1) * results.hits,
          }),
      ariaLabelNext: t('search.pagination.button.next.hint'),
      ariaLabelPrev: t('search.pagination.button.previous.hint'),
      disabledNext: results.total <= (results.page + 1) * results.limit,
      disabledPrevious: results.page <= 0,
    };
  }, [badgeResults, activityResults, activeTabIndex, t, pageNumber]);

  const [selectedSortOption, setSelectedSortOption] = useState<SortOption | null>(null);

  useScrollTracker({
    contentType: activeTabIndex === 1 ? 'activity' : 'badge',
  });

  const handlePaginationTracking = useCallback(
    (direction: string, activePageNumber: number) => {
      pushToDataLayer({
        event: 'pagination_click',
        direction,
        page_number: activePageNumber,
        content_type: activeTabIndex === 0 ? 'badge' : 'activity',
      });
    },
    [activeTabIndex]
  );

  const writePageToUrl = (page: number) => {
    const params = new URLSearchParams(window.location.search);
    if (page > 0) {
      params.set('page', String(page));
    } else {
      params.delete('page');
    }
    window.history.replaceState({}, '', `?${params.toString()}`);
  };

  const filtersWrapperRef = useRef<HTMLDivElement>(null);

  const goToPage = useCallback(
    (direction: 'next' | 'previous') => {
      const nextPageNumber = pageNumber + (direction === 'next' ? 1 : -1);
      handlePaginationTracking(direction === 'next' ? 'next' : 'prev', nextPageNumber);
      // Flip loading synchronously so the skeleton swap commits before
      // the scroll starts; otherwise the page shrinks mid-animation and
      // the browser clamps scrollY short of the filters.
      setLoading(true);
      setPageNumber(nextPageNumber);
      writePageToUrl(nextPageNumber);
      requestAnimationFrame(() => {
        filtersWrapperRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    },
    [pageNumber, handlePaginationTracking]
  );

  const handleGoToNextPage = useCallback(() => goToPage('next'), [goToPage]);
  const handleGoToPrevPage = useCallback(() => goToPage('previous'), [goToPage]);

  const expectedResultsCount = useMemo(() => {
    const { total, limit } = activeResults;
    if (!total || !limit) return DEFAULT_LIMIT;
    return Math.min(limit, Math.max(1, total - pageNumber * limit));
  }, [activeResults, pageNumber]);

  const trackFilterChange = useCallback(
    (filterType: FilterType, filterValue: string[]) => {
      pushToDataLayer({
        event: 'content_filter',
        content_type: activeTabIndex === 0 ? 'badge' : 'activity',
        filter_type: filterTypeTrackValues[filterType],
        filter_value: filterValue,
      });
    },
    [activeTabIndex]
  );

  const selectFilter = useCallback((prev: SelectedFilter[], type: string, value: Filter) => {
    const existing = prev.find(f => f.type === type);

    if (existing) {
      const valueExists = existing.values.some(el => el.id === value.id);
      const updatedValues = valueExists ? existing.values.filter(v => v.id !== value.id) : [...existing.values, value];

      return updatedValues.length > 0
        ? prev.map(f => (f.type === type ? { ...f, values: updatedValues } : f))
        : prev.filter(f => f.type !== type);
    } else {
      return [...prev, { type, values: [value] }];
    }
  }, []);

  const trackSortChange = useCallback(
    (sortType: string) => {
      pushToDataLayer({
        event: 'content_sort',
        content_type: activeTabIndex === 0 ? 'badge' : 'activity',
        sort_type: sortType,
      });
    },
    [activeTabIndex]
  );

  const allFilters = useMemo(() => {
    return Object.values(aemFilters ?? {}).flat();
  }, [aemFilters]);

  const updateSelectedFilters = useCallback(
    (type: string, value: Filter) => {
      let updatedValues: Filter[] = [];

      const currentFilterValue = allFilters.find(filter => filter.id === value.id);

      setSelectedFilters(prev => {
        const next = selectFilter(prev, type, currentFilterValue);
        updatedValues = next.find(f => f.type === type)?.values ?? [];
        return next;
      });

      setPageNumber(0);
      return updatedValues;
    },
    [allFilters]
  );

  const sortOptions: SortOption[] = useMemo(
    () => [
      {
        id: SortOptionEnum.ALPHABETICAL_ASC,
        label: t('search.sort.type.alphabetical.ascending.label'),
        value: SortOptionEnum.ALPHABETICAL_ASC,
        sort: {
          type: SortType.TITLE,
          order: SortOrder.ASCENDING,
        },
      },
      {
        id: SortOptionEnum.ALPHABETICAL_DESC,
        label: t('search.sort.type.alphabetical.descending.label'),
        value: SortOptionEnum.ALPHABETICAL_DESC,
        sort: {
          type: SortType.TITLE,
          order: SortOrder.DESCENDING,
        },
      },
      {
        id: SortOptionEnum.PROGRAM_LEVEL_ASC,
        label: t('search.sort.type.programLevel.ascending.label'),
        value: SortOptionEnum.PROGRAM_LEVEL_ASC,
        sort: {
          type: SortType.PROGRAM_LEVEL,
          order: SortOrder.ASCENDING,
        },
      },
      {
        id: SortOptionEnum.PROGRAM_LEVEL_DESC,
        label: t('search.sort.type.programLevel.descending.label'),
        value: SortOptionEnum.PROGRAM_LEVEL_DESC,
        sort: {
          type: SortType.PROGRAM_LEVEL,
          order: SortOrder.DESCENDING,
        },
      },
    ],
    [t]
  );

  const totalFiltersCount = useMemo(
    () => selectedFilters.reduce((total, filter) => total + filter.values.length, 0),
    [selectedFilters]
  );

  const handleTabSwitch = useCallback((tabIndex: number) => {
    setActiveTabIndex(tabIndex);
    setPageNumber(0);
  }, []);

  const handleSortChange = useCallback(
    (selectedLabel: string) => {
      const option = sortOptions.find(opt => opt.id === selectedLabel);

      if (option) {
        trackSortChange(option.label);
        setSelectedSortOption(option);
      }
    },
    [sortOptions, trackSortChange]
  );

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    setPageNumber(0);
  }, []);

  const handleRemoveAllFilters = useCallback(() => {
    setSelectedFilters([]);
  }, []);

  const handleSidePanelToggle = useCallback(() => {
    setSidePanelOpened(prev => !prev);
  }, []);

  const removeFilter = (prev: SelectedFilter[], type: string, value: Filter) => {
    return prev
      .map(filter =>
        filter.type === type
          ? {
              ...filter,
              values: filter.values.filter(v => v.id !== value.id),
            }
          : filter
      )
      .filter(filter => filter.values.length > 0);
  };

  const handleRemoveFilter = useCallback(
    (type: string, value: Filter) => () => {
      setSelectedFilters(prev => {
        return removeFilter(prev, type, value);
      });
    },
    []
  );

  const isFilterSelected = useCallback(
    (type: string, option: Filter) => {
      return selectedFilters?.some(f => f.type === type && f.values.some(el => el.id === option.id));
    },
    [selectedFilters]
  );

  const handleMobileFiltersChange = useCallback(
    (type: string, value: Filter) => () => {
      let updatedValues = updateSelectedFilters(type, value);

      const values = updatedValues.map(el => el.id);
      trackFilterChange(type as FilterType, values);
    },
    []
  );

  const handleFiltersChange = useCallback(
    (type: string) => (value: Filter) => {
      let updatedValues = updateSelectedFilters(type, value);

      const values = updatedValues.map(el => el.id);
      trackFilterChange(type as FilterType, values);
    },
    [trackFilterChange, selectFilter]
  );

  const trackSearchEvent = useCallback((searchQuery: string, totalBadges: number, totalActivities: number) => {
    if (totalBadges > 0) {
      pushToDataLayer({
        event: 'view_search_results',
        search_term: searchQuery,
        content_type: 'badge',
      });
    } else {
      pushToDataLayer({
        event: 'no_search_results',
        search_term: searchQuery,
        content_type: 'badge',
      });
    }

    if (totalActivities > 0) {
      pushToDataLayer({
        event: 'view_search_results',
        search_term: searchQuery,
        content_type: 'activity',
      });
    } else {
      pushToDataLayer({
        event: 'no_search_results',
        search_term: searchQuery,
        content_type: 'activity',
      });
    }
  }, []);

  const appendParamsToUrl = useCallback(
    (query: string, filters: SelectedFilter[], sort: SortOption | null, page: number) => {
      const params = new URLSearchParams();

      params.set('tab', activeTabIndex === 0 ? 'badge' : 'activity');

      if (query) {
        params.set('q', query);
      }

      if (sort?.id) {
        params.set('sort', sort.id);
      }

      if (page > 0) {
        params.set('page', String(page));
      }

      filters.forEach(filter => {
        filter.values.forEach(v => {
          params.append(filter.type, v.id);
        });
      });

      const newRoute = `?${params.toString()}`;
      const currentRoute = window.location.search;

      if (newRoute !== currentRoute) {
        window.history.replaceState({}, '', newRoute);
      }
    },
    [activeTabIndex]
  );

  const performSearch = useCallback(
    async (badgeQuery: SearchQuery, activityQuery: SearchQuery) => {
      try {
        setLoading(true);

        const searchQuery = badgeQuery.term ?? activityQuery.term;

        const badgeTotalPages = badgeResults?.totalPages;
        const activityTotalPages = activityResults?.totalPages;

        const shouldFetchBadge = badgeTotalPages ? badgeQuery.page < badgeTotalPages : true;
        const shouldFetchActivity = activityTotalPages ? activityQuery.page < activityTotalPages : true;

        const requests = await Promise.all([
          shouldFetchBadge ? axios.get(badgeSearchUrlFactory.build(badgeQuery)) : null,
          shouldFetchActivity ? axios.get(activitySearchUrlFactory.build(activityQuery)) : null,
        ]);

        const [badgeResponse, activityResponse] = requests;

        if (searchQuery) {
          const badgeTotal = badgeResponse?.data?.total ?? badgeResults.total;
          const activityTotal = activityResponse?.data?.total ?? activityResults.total;
          trackSearchEvent(searchQuery, badgeTotal, activityTotal);
        }

        if (badgeResponse) {
          const mappedBadges = mapSearchResults(
            badgeResponse.data.results,
            'badge',
            aemFilters?.programLevels ?? [],
            t
          );
          const totalBadgePages = Math.ceil(badgeResponse.data.total / (badgeResponse.data.limit ?? 1));

          setBadgeResults({
            ...badgeResponse.data,
            totalPages: totalBadgePages,
            results: mappedBadges,
          });
        }

        if (activityResponse) {
          const mappedActivities = mapSearchResults(
            activityResponse.data.results,
            'activity',
            aemFilters?.programLevels ?? [],
            t
          );
          const totalActivityPages = Math.ceil(activityResponse.data.total / (activityResponse.data.limit ?? 1));

          setActivityResults({
            ...activityResponse.data,
            totalPages: totalActivityPages,
            results: mappedActivities,
          });
        }
      } catch (err: unknown) {
        setError(true);
        console.error('Error performing search:', err);
      } finally {
        setLoading(false);
      }
    },
    [aemFilters, t, badgeResults?.totalPages, activityResults?.totalPages]
  );

  const createQuery = useCallback(() => {
    let filtersToUse = {};
    if (selectedFilters?.length) {
      filtersToUse = selectedFilters.reduce(
        (acc, filter) => {
          acc[filter.type] = filter.values.map(value => value.id);
          return acc;
        },
        {} as Record<string, string[]>
      );
    }

    const badgeQuery = badgeQueryFactory.createFromPartial({
      lang: lang as Readonly<'en' | 'es'>,
      term: searchQuery ?? '',
      filters: filtersToUse,
      page: pageNumber,
      sort: selectedSortOption?.sort,
    });
    const activityQuery = activityQueryFactory.createFromPartial({
      lang: lang as Readonly<'en' | 'es'>,
      term: searchQuery ?? '',
      filters: filtersToUse,
      page: pageNumber,
      sort: selectedSortOption?.sort,
    });

    appendParamsToUrl(searchQuery, selectedFilters, selectedSortOption, pageNumber);
    performSearch(badgeQuery, activityQuery);
  }, [performSearch, selectedFilters, searchQuery, lang, pageNumber, selectedSortOption]);

  const debouncedQuery = useDebouncedCallback(createQuery, 500);
  const isFirstRun = useRef(true);

  useEffect(() => {
    if (loading) return;

    const params = new URLSearchParams(window.location.search);
    const tab = activeTabIndex === 0 ? 'badge' : 'activity';
    params.set('tab', tab);

    const newRoute = `?${params.toString()}`;
    const currentRoute = window.location.search;

    if (newRoute !== currentRoute) {
      window.history.replaceState({}, '', newRoute);
    }
    const last = lastPageViewRef.current;
    const hasChanged = !last || last.tab !== tab || last.lang !== lang;

    if (hasChanged) {
      pushToDataLayer({
        event: 'page_view',
        content_type: tab,
        language_code: lang,
      });

      lastPageViewRef.current = { tab, lang };
    }
  }, [activeTabIndex, loading, lang]);

  useEffect(() => {
    if (!aemFilters || selectedFilters.length > 0) return;

    const searchParams = new URLSearchParams(window.location.search);
    const q = searchParams.get('q') ?? '';
    const t = searchParams.get('tab') ?? '';
    const sortId = searchParams.get('sort') ?? SortOptionEnum.ALPHABETICAL_ASC;
    const page = parseInt(searchParams.get('page') ?? '0', 10);

    const filtersFromUrl = decodeFiltersFromUrl(searchParams, allFilters);
    const sortOption = sortOptions?.find(opt => opt.id === sortId) ?? sortOptions[0];

    setActiveTabIndex(t === 'badge' || !t ? 0 : 1);
    setSearchQuery(q);
    setSelectedFilters(filtersFromUrl);
    setSelectedSortOption(sortOption);
    if (page > 0) setPageNumber(page);
  }, [sortOptions, aemFilters]);

  useEffect(() => {
    if (isFirstRun.current) {
      if (aemFilters && !selectedSortOption) return;
      isFirstRun.current = false;
      createQuery();
      return;
    }
    debouncedQuery();
  }, [searchQuery, selectedFilters, selectedSortOption, pageNumber]);

  return {
    tabs,
    activeResults,
    totalResults,
    activityResults,
    badgeResults,
    handleTabSwitch,
    activeTabIndex,
    searchQuery,
    totalFiltersCount,
    sidePanelOpened,
    selectedFilters,
    handleSearchChange,
    handleFiltersChange,
    handleRemoveAllFilters,
    handleRemoveFilter,
    handleMobileFiltersChange,
    handleSidePanelToggle,
    handleGoToNextPage,
    handleGoToPrevPage,
    filtersWrapperRef,
    loading,
    paginationLabels,
    sortOptions,
    handleSortChange,
    selectedSortOption,
    isFilterSelected,
    error,
    expectedResultsCount,
  };
};
