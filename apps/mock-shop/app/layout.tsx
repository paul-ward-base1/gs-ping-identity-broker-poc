import type { Metadata } from "next";
import Script from "next/script";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import { ShopNav } from "./components/shop-nav";
import { ShopSessionBanner } from "./components/shop-session-banner";
import { SilentAuth } from "@ciam-poc/ui";
import "./globals.css";

export const metadata: Metadata = {
  title: "GS Shop — Girl Scouts",
  description: "CIAM Broker PoC — Mock Shop Application",
  icons: { icon: "/favicon.svg" },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <SessionProvider session={session}>
          <ShopSessionBanner />
          <ShopNav />
          <main>{children}</main>
          <SilentAuth />
          <Script src="/poc-tools/token-inspector.js" strategy="lazyOnload" />
        </SessionProvider>
      </body>
    </html>
  );
}
