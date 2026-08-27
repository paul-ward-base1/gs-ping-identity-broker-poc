import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import { MyGSNav } from "./components/mygs-nav";
import { MyGSSessionBanner } from "./components/mygs-session-banner";
import Script from "next/script";
import { SilentAuth } from "@ciam-poc/ui";
import "./globals.css";

export const metadata: Metadata = {
  title: "myGS — Girl Scouts Member Portal",
  description: "CIAM Broker PoC — Mock myGS Application",
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
          <MyGSSessionBanner />
          <MyGSNav />
          <main>{children}</main>
          <SilentAuth />
          <Script src="/poc-tools/token-inspector.js" strategy="lazyOnload" />
        </SessionProvider>
      </body>
    </html>
  );
}
