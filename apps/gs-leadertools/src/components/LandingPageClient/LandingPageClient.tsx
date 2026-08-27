'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/utils/classNames';
import { ProgramLevelEnum } from '@/types/programLevel';
import { CardList } from '@/components/CardList';
import { Tabs } from '@/components/Tabs';
import { SearchBox } from '@/components/SearchBox';
import { Filter } from '@/components/Filter';
import { FilterChips } from '@/components/FilterChips';
import { Button } from '@/components/Button';
import { SidePanel } from '@/components/SidePanel';
import { Accordion } from '@/components/Accordion';

import { Pagination } from '@/components/Pagination';
import { Dropdown } from '@/components/Dropdown';
import ServerErrorPage from '@/app/[lang]/error';
import { PageBanner } from '@/components/PageBanner';
import { useLandingPageClient } from './useLandingPageClient';
import { type FilterObject, type LandingPageClientProps } from './types';
import { FilterAccordionOptions } from './FilterAccordionOptions';
import './LandingPageClient.scss';

const bem = cn('landing');

export const LandingPageClient = (props: LandingPageClientProps) => {
  const { filters, lang, pageTitle } = props;
  const { t } = useTranslation();
  const {
    loading,
    tabs,
    activityResults,
    badgeResults,
    totalFiltersCount,
    handleTabSwitch,
    activeTabIndex,
    searchQuery,
    sidePanelOpened,
    selectedFilters,
    handleSearchChange,
    handleFiltersChange,
    handleRemoveAllFilters,
    handleRemoveFilter,
    handleSidePanelToggle,
    handleMobileFiltersChange,
    handleGoToNextPage,
    handleGoToPrevPage,
    filtersWrapperRef,
    paginationLabels,
    activeResults,
    totalResults,
    sortOptions,
    handleSortChange,
    selectedSortOption,
    isFilterSelected,
    error,
    expectedResultsCount,
  } = useLandingPageClient(lang);

  if (error) {
    return <ServerErrorPage />;
  }
  return (
    <>
      <PageBanner title={pageTitle} />
      <div className={bem()}>
        <div ref={filtersWrapperRef} className={bem('filters-wrapper')}>
          <div className={bem('filters-mobile')}>
            <SearchBox value={searchQuery} handleSearchChange={handleSearchChange} />

            <Button
              variant="secondary"
              size={'small'}
              label={t('search.filter.button.openBox.label')}
              ariaLabel={t('search.filter.button.hint')}
              icon="filter"
              count={totalFiltersCount}
              onClick={handleSidePanelToggle}
            />
          </div>
          <div className={bem('filters-desktop')}>
            <div className={bem('filters-area')}>
              <div className={bem('filter')}>
                <span className={bem('filter-by-label')}> {t('search.filter.label')} </span>

                {!!filters?.length &&
                  filters.map((filter: FilterObject) => (
                    <Filter
                      key={filter.type}
                      {...filter}
                      optionType="checkbox"
                      optionsPosition="left"
                      selectedOptions={selectedFilters?.find(f => f.type === filter.type)?.values || []}
                      handleValueChange={handleFiltersChange(filter.type)}
                    />
                  ))}
              </div>
              <div className={bem('search')}>
                <SearchBox value={searchQuery} handleSearchChange={handleSearchChange} />
              </div>
            </div>
            {!!selectedFilters.length && (
              <div className={bem('active-filters')}>
                {selectedFilters?.map(selectedFilter => {
                  return selectedFilter.values?.map((value, i) => {
                    return (
                      <FilterChips
                        key={`${selectedFilter.type}-${value.id}-${i}`}
                        label={value.name}
                        onClick={handleRemoveFilter(selectedFilter.type, value)}
                      />
                    );
                  });
                })}
                <Button
                  variant="tertiary"
                  size="small"
                  label={t('search.filter.button.clear.label')}
                  ariaLabel={t('search.filter.button.clear.hint')}
                  onClick={handleRemoveAllFilters}
                />
              </div>
            )}
          </div>
        </div>

        <div className={bem('content')}>
          <div className={bem('cards')}>
            {!loading && totalResults > 0 && !!searchQuery && (
              <div className={bem('search-results')}>
                <span className={bem('search-results-label')}>
                  {t(
                    totalResults > 1
                      ? 'search.result.countText.pluralFormat'
                      : 'search.result.countText.singularFormat',
                    { number: totalResults, term: '' }
                  )}
                </span>
                <span className={bem('search-results-term')}> {searchQuery}</span>
              </div>
            )}

            <div className={bem('sorting')}>
              <Tabs tabs={tabs} onTabChange={handleTabSwitch} activeTabIndex={activeTabIndex} />

              <div className={bem('sort-by')}>
                <span className={bem('sort-by-label')}>{t('search.sort.label')}</span>
                <div className={bem('sort-by-dropdown')}>
                  {!!selectedSortOption && (
                    <Dropdown
                      value={selectedSortOption.value}
                      options={sortOptions}
                      handleValueChange={handleSortChange}
                      optionsPosition="right"
                      optionType="radio"
                      headerAriaLabel={`${t('search.sort.label')} ${selectedSortOption.label}`}
                    />
                  )}
                </div>
              </div>
            </div>

            {!loading && activeResults.total < 1 ? (
              <div className={bem('not-found')}>
                <div className={bem('not-found-title')}>{t('search.result.noResults.header')}</div>
                <div className={bem('not-found-text')}>{t('search.result.noResults.text')}</div>
              </div>
            ) : (
              <CardList
                items={activeTabIndex === 0 ? (badgeResults?.results ?? []) : (activityResults?.results ?? [])}
                loading={loading}
                placeholderCount={expectedResultsCount}
              />
            )}
          </div>
        </div>
        <div className={bem('pagination')}>
          <Pagination
            {...paginationLabels}
            disabledNext={paginationLabels.disabledNext || loading}
            disabledPrevious={paginationLabels.disabledPrevious || loading}
            handleNext={handleGoToNextPage}
            handlePrevious={handleGoToPrevPage}
          />
        </div>
        <SidePanel
          title={t('search.filter.box.header')}
          programLevel={ProgramLevelEnum.MULTI}
          isOpen={sidePanelOpened}
          onClose={handleSidePanelToggle}
          closeButtonAreaLabel={t('global.button.close.hint')}
        >
          <div className={bem('panel-content')}>
            <div className={bem('panel-filters')}>
              {filters?.map((filter: FilterObject) => (
                <Accordion
                  title={filter.label}
                  key={filter.type}
                  count={selectedFilters?.find(f => f.type === filter.type)?.values?.length}
                  variant="default"
                  level={ProgramLevelEnum.MULTI}
                  useChildrenContent
                >
                  <FilterAccordionOptions
                    filter={filter}
                    isFilterSelected={isFilterSelected}
                    handleMobileFiltersChange={handleMobileFiltersChange}
                  />
                </Accordion>
              ))}
            </div>
            <div className={bem('panel-actions')}>
              <Button
                variant="secondary"
                size="small"
                label={t('search.filter.button.clear.label')}
                ariaLabel={t('search.filter.button.clear.hint')}
                onClick={handleRemoveAllFilters}
                fill
              />
              <Button
                variant="primary"
                size="small"
                label={t('search.filter.button.close.hint')}
                ariaLabel={t('search.filter.button.close.hint')}
                onClick={handleSidePanelToggle}
                fill
              />
            </div>
          </div>
        </SidePanel>
      </div>
    </>
  );
};
