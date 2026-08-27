"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { TokenInspector } from "./token-inspector";

interface BrokerClaims {
  sub?: string;
  email?: string;
  name?: string;
  roles?: string[];
  upstreamIdp?: string;
  brokerPlatform?: string;
  brokerSessionId?: string;
  rawIdToken?: Record<string, unknown>;
  rawAccessToken?: Record<string, unknown>;
  upstreamClaims?: Record<string, unknown>;
}

export function CollapsibleTokenPanel() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  if (!session?.user) return null;

  const claims = (session as unknown as { brokerClaims?: BrokerClaims })?.brokerClaims;

  const idToken = claims?.rawIdToken ?? {
    sub: claims?.sub,
    email: claims?.email,
    name: claims?.name,
    roles: claims?.roles,
    upstream_idp: claims?.upstreamIdp,
  };

  return (
    <>
      {/* Spacer so the fixed bar doesn't cover page content */}
      <div className="h-10" />

      {/* Fixed bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        {/* Expanded panel */}
        {open && (
          <div className="bg-gray-950 border-t border-gray-700 max-h-[50vh] overflow-y-auto px-4 py-4 shadow-2xl">
            <TokenInspector
              idToken={idToken}
              accessToken={claims?.rawAccessToken}
              sessionData={{
                user: session.user,
                expires: session.expires,
                brokerClaims: claims,
              }}
            />
          </div>
        )}

        {/* Toggle bar */}
        <button
          onClick={() => setOpen(!open)}
          className="w-full bg-gray-900 border-t border-gray-700 px-4 py-2 flex items-center justify-between text-sm text-gray-300 hover:bg-gray-800 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs px-1.5 py-0.5 bg-gray-700 rounded font-mono">
              {claims?.brokerPlatform ?? "mock"}
            </span>
            <span>Token Inspector</span>
            {claims?.rawIdToken && (
              <span className="text-xs text-gray-500">
                ({Object.keys(claims.rawIdToken).length} ID token claims)
              </span>
            )}
          </div>
          <span className="text-gray-500">{open ? "▼ Close" : "▲ Open"}</span>
        </button>
      </div>
    </>
  );
}
