'use client';

import { useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useLocale } from '@/components/contexts/locale-context';
import { type NavigationItemsProps } from '@/components/Header/types';
import { locales } from '@/lib/locale';

const isVisible = (el: HTMLElement): boolean => {
  return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
};

export const useHeader = () => {
  const router = useRouter();
  const currentLocale = useLocale();

  const { t, i18n } = useTranslation();

  const changeLanguage = useCallback(
    (selLang: string) => {
      const currentPath = window.location.pathname;
      const currentSearch = window.location.search;
      const pathWithoutLang = currentPath.split('/').slice(2).join('/');
      router.push(`/${selLang}/${pathWithoutLang}${currentSearch}`);
      router.refresh();
    },
    [router]
  );

  const logoAlt = t('global.header.logo.hint');
  const settingsLabel = t('global.settings.action.label', 'Settings');
  const settingsAriaLabel = t('global.settings.action.hint', 'Settings');
  const languagePickerAriaLabel = t('global.languageSwitch.action.hint');
  const languageSwitcherTitle = t('global.languageSwitch.modal.title', 'Change Language');
  const languageSwitcherCloseLabel = t('global.languageSwitch.modal.close', 'Close');

  const languageItems = locales.map(locale => {
    const label = t(`global.languageSwitch.items.${locale}`, locale === 'en' ? 'English' : 'Español');
    return { id: locale, value: locale, label, ariaLabel: label };
  });

  const navigationItems = useMemo(() => {
    const navigationItems: NavigationItemsProps =
      i18n.getResource(i18n.language, 'translation', 'global.header.navigation.items') ?? {};

    return Object.values(navigationItems)?.map(item => ({
      title: item.title,
      url: item.url,
    }));
  }, []);

  const handleLanguageChange = useCallback(
    (selectedLang: string) => {
      changeLanguage(selectedLang);
    },
    [changeLanguage]
  );

  const handleSkipToMainClick = () => {
    const main = document.querySelector('main');
    if (!main) return;

    const focusable = Array.from(
      main.querySelectorAll<HTMLElement>('a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])')
    ).find(el => !el.hasAttribute('disabled') && el.tabIndex >= 0 && isVisible(el));

    focusable?.focus();
  };

  return {
    handleSkipToMainClick,
    handleLanguageChange,
    lang: currentLocale,
    languageItems,
    navigationItems,
    logoAlt,
    settingsLabel,
    settingsAriaLabel,
    languagePickerAriaLabel,
    languageSwitcherTitle,
    languageSwitcherCloseLabel,
  };
};
