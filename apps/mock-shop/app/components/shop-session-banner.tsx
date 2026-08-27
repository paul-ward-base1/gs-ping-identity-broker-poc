"use client";

import { useSession } from "next-auth/react";
import { SessionBanner } from "@ciam-poc/ui";

export function ShopSessionBanner() {
  const { data: session } = useSession();
  const claims = (session as unknown as {
    brokerClaims?: {
      roles?: string[];
      upstreamIdp?: string;
      brokerPlatform?: string;
      brokerSessionId?: string;
      upstreamClaims?: {
        amr?: string[];
        gsUserType?: string;
        councilCode?: string;
      };
    };
  })?.brokerClaims;

  if (!session?.user) return null;

  return (
    <SessionBanner
      user={session.user}
      roles={claims?.roles ?? []}
      upstreamIdp={claims?.upstreamIdp ?? "unknown"}
      brokerPlatform={claims?.brokerPlatform ?? "mock"}
      sessionId={claims?.brokerSessionId}
      amr={claims?.upstreamClaims?.amr}
      gsUserType={claims?.upstreamClaims?.gsUserType}
      councilCode={claims?.upstreamClaims?.councilCode}
    />
  );
}
