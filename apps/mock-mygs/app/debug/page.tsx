"use client";

import { useSession } from "next-auth/react";
import { TokenInspector } from "@ciam-poc/ui";
import type { BrokerClaims } from "@ciam-poc/auth";

export default function DebugPage() {
  const { data: session } = useSession();
  const claims = (session as unknown as { brokerClaims?: BrokerClaims })?.brokerClaims;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Debug — Token Inspector</h1>
      <p className="text-sm text-gray-500 mb-8">
        Raw token payloads from the identity broker. Inspect Keycloak
        token claims, realm roles, and session data.
      </p>

      <div className="bg-gray-950 rounded-lg p-6">
        <TokenInspector
          idToken={claims?.rawIdToken ?? {
            sub: claims?.sub,
            email: claims?.email,
            name: claims?.name,
            roles: claims?.roles,
            upstream_idp: claims?.upstreamIdp,
            _note: "Mock credentials — start Keycloak (docker compose up) and configure .env.local to see full claims.",
          }}
          accessToken={claims?.rawAccessToken}
          sessionData={session ? {
            user: session.user,
            expires: session.expires,
            brokerClaims: claims,
          } : undefined}
        />
      </div>
    </div>
  );
}
