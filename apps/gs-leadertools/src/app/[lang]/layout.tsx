import type { Metadata } from 'next';
import React, { Suspense } from 'react';
import Script from 'next/script';
import { notFound } from 'next/navigation';
import { NavigationTracker } from '@/components/NavigationTracker';
import { getDictionary, type LangProps } from '@/lib/dictionaries';
import { locales } from '@/lib/locale';
import { LocaleProvider } from '@/components/contexts/locale-context';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SessionProvider } from '@/components/SessionProvider';
import { GoogleTagManagerNoScript, GoogleTagManagerScript } from '@/components/GTM';
import { I18nProvider } from '@/components/I18nProvider';
import { SilentAuth } from '@/components/SilentAuth';
import { getFilterModel } from '@/lib/filters';

export default async function RootLayout({
  children,
  params,
}: Readonly<
  {
    children: React.ReactNode;
  } & LangProps
>) {
  const { lang } = await params;

  // Read inside the component so values are resolved at request time, not module-load time
  const isAuthorMode = process.env.AEM_MODE === 'author';
  const aemUrl = process.env.AEM_API?.replace(/\/$/, '');
  const ueServiceUrl = process.env.UE_SERVICE_URL?.replace(/\/$/, '');

  if (!locales.includes(lang)) {
    notFound();
  }

  let dict: Awaited<ReturnType<typeof getDictionary>>;
  let filters: Awaited<ReturnType<typeof getFilterModel>>;

  try {
    dict = await getDictionary(lang);
    filters = await getFilterModel(lang);
  } catch (error) {
    if ((error as Error).message === 'AEM_AUTHOR_UNAUTHENTICATED') {
      return (
        <html lang={lang}>
          <head>
            {isAuthorMode && aemUrl && <meta name="urn:adobe:aue:system:aemconnection" content={`aem65:${aemUrl}`} />}
            {isAuthorMode && ueServiceUrl && <meta name="urn:adobe:aue:config:service" content={ueServiceUrl} />}
            {isAuthorMode && <script src="https://universal-editor-service.adobe.io/cors.js" async />}
          </head>
          <body>
            <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
              <h2>Not authenticated</h2>
              <p>
                Please use <strong>Local Developer Login</strong> in the Universal Editor toolbar to log in to AEM, then
                reload the page.
              </p>
            </div>
          </body>
        </html>
      );
    }
    throw error;
  }

  return (
    <html lang={lang} suppressHydrationWarning>
      <head>
        <Script
          id="aem-api-config"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `window.__AEM_API__ = ${JSON.stringify(process.env.AEM_API ?? '')}; window.__AEM_MODE__ = ${JSON.stringify(process.env.AEM_MODE ?? '')};`,
          }}
        />
        <Script
          id="aem-dam-path-config"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `window.__AEM_DAM_PATH__ = ${JSON.stringify(process.env.AEM_DAM_PATH ?? '')};`,
          }}
        />
        {/* Google Tag Manager (Script) */}
        <GoogleTagManagerScript />
        {/* End Google Tag Manager */}
        <link rel="icon" href="/gs_favicon.svg" type="image/svg+xml" />
        <title />
        {isAuthorMode && aemUrl && <meta name="urn:adobe:aue:system:aemconnection" content={`aem65:${aemUrl}`} />}
        {isAuthorMode && ueServiceUrl && <meta name="urn:adobe:aue:config:service" content={ueServiceUrl} />}
        {isAuthorMode && <script src="https://universal-editor-service.adobe.io/cors.js" async />}
      </head>

      <body suppressHydrationWarning>
        {/* Google Tag Manager (noscript) */}
        <GoogleTagManagerNoScript />
        {/* End Google Tag Manager (noscript) */}

        <SessionProvider>
          <LocaleProvider locale={lang} filters={filters} isAuthorMode={isAuthorMode}>
            <I18nProvider locale={lang} resources={dict}>
              <Suspense fallback={null}>
                <NavigationTracker />
              </Suspense>
              <Header />
              <main>{children}</main>
              <Footer />
              <SilentAuth />
            </I18nProvider>
          </LocaleProvider>
        </SessionProvider>
        <Script src="/poc-tools/token-inspector.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}

// Auth/session state resolves client-side (next-auth's SessionProvider), and
// the only server-side per-request read (the author-mode login-token cookie
// in src/lib/api.ts) only runs when AEM_MODE=author, a separate UE dev
// deployment — so this can be revalidated on the same cadence as the AEM
// data it renders instead of forced dynamic on every request.
export const revalidate = 600;

export const metadata: Metadata = process.env.NOINDEX === 'true' ? { robots: { index: false, follow: false } } : {};
