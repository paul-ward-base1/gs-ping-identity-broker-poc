'use client';
import { createContext, useContext, useMemo } from 'react';
import { FilterModel } from '@/types/filter';

type LocaleContextType = {
  readonly locale: string;
  readonly filters: FilterModel;
  readonly isAuthorMode: boolean;
};

const LocaleContext = createContext<LocaleContextType | null>(null);

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error('useLocale must be used within a LocaleProvider');
  return context.locale;
}

export function useAEMFilters() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error('useFilters must be used within a LocaleProvider');
  return context.filters;
}

export function useIsAuthorMode() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error('useIsAuthorMode must be used within a LocaleProvider');
  return context.isAuthorMode;
}

type LocaleProviderProps = Readonly<{
  locale: string;
  filters: FilterModel;
  isAuthorMode: boolean;
  children: React.ReactNode;
}>;

export function LocaleProvider({ locale, filters, isAuthorMode, children }: LocaleProviderProps) {
  const value = useMemo(() => ({ locale, filters, isAuthorMode }), [locale, filters, isAuthorMode]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}
