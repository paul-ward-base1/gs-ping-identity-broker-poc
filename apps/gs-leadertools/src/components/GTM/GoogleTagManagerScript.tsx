import Script from 'next/script';

// Use `next/script` so the snippet runs on both initial SSR HTML and client
// navigations. A raw `<script>` rendered by a React component triggers a
// hydration warning ("Scripts inside React components are never executed when
// rendering on the client") and won't fire after a client-side route change.
export const GoogleTagManagerScript = () => (
  <Script id="gtm-init" strategy="afterInteractive">
    {`
      (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','GTM-PMXX28MP');
    `}
  </Script>
);
