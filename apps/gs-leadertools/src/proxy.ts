import { NextRequest, NextResponse } from 'next/server';
import { Locale, locales, pathnameHasLocale } from './lib/locale';

const FALLBACK_LOCALE = 'en';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Return a 200 OK for /health explicitly
  if (pathname === '/health') {
    return NextResponse.json({
      status: 'ok',
      buildDate: process.env.BUILD_DATE ?? 'unknown',
      commit: process.env.GIT_COMMIT ?? 'unknown',
    });
  }

  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/favicon.ico') ||
    /\.(.*)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();

  if (pathnameHasLocale(pathname)) {
    const locale = pathname.split('/')[1] as Locale;

    if (!locales.includes(locale)) {
      const fallbackLocale = request.cookies.get('NEXT_LOCALE')?.value ?? FALLBACK_LOCALE;
      url.pathname = `/${fallbackLocale}/404`;
      return NextResponse.redirect(url);
    }

    const response = NextResponse.next();
    response.cookies.set('NEXT_LOCALE', locale, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=60');
    response.headers.set('Vary', 'RSC, Next-Router-State-Tree, Next-Router-Prefetch');

    return response;
  }

  const fallbackLocale = request.cookies.get('NEXT_LOCALE')?.value ?? FALLBACK_LOCALE;
  url.pathname = `/${fallbackLocale}${pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!_next|api|\\.svg|\\.png|\\.jpg|favicon.ico|.*\\..*).*)'],
};
