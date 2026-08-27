export const locales = ['en', 'es'] as const;
export type Locale = (typeof locales)[number];

export function getLocale(pathname: string): Locale {
  const [locale] = pathname.split('/').filter(Boolean);
  return locales.includes(locale as Locale) ? (locale as Locale) : 'en';
}

export function pathnameHasLocale(pathname: string) {
  return locales.some(locale => pathname === `/${locale}` || pathname?.startsWith(`/${locale}/`));
}
