"use client";

import { useState } from "react";

const claimDescriptions: Record<string, string> = {
  // Standard OIDC
  iss: "Issuer — the Keycloak realm URL that minted this token",
  sub: "Subject — unique user identifier (UUID) in the broker realm",
  aud: "Audience — the client (app) this token was issued for",
  exp: "Expiration — Unix timestamp when this token expires",
  iat: "Issued At — Unix timestamp when this token was created",
  auth_time: "Authentication Time — when the user actually logged in",
  nonce: "Nonce — random value to prevent replay attacks",
  acr: "Authentication Context Class Reference — level of authentication assurance (0=no MFA, 1=MFA)",
  amr: "Authentication Methods Reference — methods used to authenticate (e.g., pwd, mfa, otp)",
  azp: "Authorized Party — the client that requested this token",
  at_hash: "Access Token Hash — binds the ID token to a specific access token",
  jti: "JWT ID — unique identifier for this specific token",

  // Keycloak-specific
  sid: "Session ID — Keycloak's SSO session identifier (shared across apps)",
  typ: "Token Type — 'ID' for ID tokens, 'Bearer' for access tokens",
  scope: "Scopes — the OIDC scopes granted for this session",
  session_state: "Session State — Keycloak session tracking value",
  realm_access: "Realm Access — roles assigned at the Keycloak realm level (includes member, admin, and system roles)",
  resource_access: "Resource Access — roles assigned per-client (app-specific permissions)",
  allowed_origins: "Allowed Origins — CORS origins permitted for this client",

  // User profile
  name: "Full Name — user's display name from their IdP profile",
  given_name: "Given Name — user's first name",
  family_name: "Family Name — user's last name",
  preferred_username: "Preferred Username — typically the user's email or login ID",
  email: "Email — user's email address from their upstream IdP",
  email_verified: "Email Verified — whether the upstream IdP has confirmed this email",

  // Broker / Federation
  identity_provider: "Identity Provider — which upstream IdP authenticated this user (e.g., okta-workforce, gigya-b2c, or absent for local)",
  identity_provider_identity: "IdP Identity — the user's identifier at the upstream IdP",

  // Upstream claims (SAP CDC / Gigya)
  upstream_gsUserType: "GS User Type — SAP CDC user classification (from data.GSUserType)",
  upstream_councilCode: "Council Code — Girl Scout council identifier (from data.GSUSA.COUNCILCODE)",
  upstream_gsGlobalId: "GS Global ID — GSUSA's global user identifier (from data.GSUSA.GSGLOBALID)",
  upstream_isAdultUser: "Is Adult User — whether the user is an adult vs. girl member (from data.GSUSA.IsAdultUser)",
  upstream_teamId: "Team ID — troop/team identifier (from data.GSUSA.TeamID)",
  upstream_houseHoldId: "Household ID — household identifier for family grouping (from data.houseHoldID)",
  upstream_groups: "Upstream Groups — group memberships from the upstream IdP (e.g., Okta groups)",

  // Session data
  user: "User — the next-auth user object (name + email)",
  expires: "Expires — when the next-auth session expires (ISO 8601)",
  brokerClaims: "Broker Claims — normalized claims extracted by the auth package from the broker's tokens",
};

interface TokenInspectorProps {
  idToken?: Record<string, unknown>;
  accessToken?: Record<string, unknown>;
  sessionData?: Record<string, unknown>;
}

function ClaimTooltip({ name }: { name: string }) {
  const desc = claimDescriptions[name];
  if (!desc) return null;
  return (
    <span className="relative group/tip ml-1 cursor-help">
      <span className="inline-block w-3.5 h-3.5 rounded-full bg-gray-700 text-[9px] text-gray-400 text-center leading-[14px] border border-gray-600">?</span>
      <span className="absolute bottom-full left-0 mb-1 hidden group-hover/tip:block w-64 px-3 py-2 text-xs text-gray-100 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-50 font-sans font-normal whitespace-normal">
        {desc}
      </span>
    </span>
  );
}

function ClaimValue({ value }: { value: unknown }) {
  const str = typeof value === "string" ? value : JSON.stringify(value);
  const isCustom =
    typeof value === "object" ||
    (typeof str === "string" && str.startsWith("https://"));
  return (
    <span className={isCustom ? "text-amber-400 font-semibold" : "text-emerald-300"}>
      {str}
    </span>
  );
}

function TokenSection({
  title,
  claims,
  defaultOpen,
}: {
  title: string;
  claims?: Record<string, unknown>;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen ?? false);

  if (!claims) return null;

  return (
    <div className="border border-gray-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-800 hover:bg-gray-750 text-left"
      >
        <span className="font-mono font-semibold text-gray-200">{title}</span>
        <span className="text-gray-400 text-sm">
          {open ? "▼" : "▶"} {Object.keys(claims).length} claims
        </span>
      </button>
      {open && (
        <div className="bg-gray-900 p-4 font-mono text-sm overflow-x-auto">
          <table className="w-full">
            <tbody>
              {Object.entries(claims).map(([key, value]) => (
                <tr key={key} className="border-b border-gray-800 last:border-0">
                  <td className="py-1.5 pr-4 text-gray-400 whitespace-nowrap align-top">
                    {key}
                    <ClaimTooltip name={key} />
                  </td>
                  <td className="py-1.5 align-top break-all">
                    <ClaimValue value={value} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function TokenInspector({ idToken, accessToken, sessionData }: TokenInspectorProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="text-lg font-semibold text-gray-100">Token Inspector</h2>
        <span className="text-xs px-2 py-0.5 bg-gray-700 rounded-full text-gray-300">
          Debug
        </span>
      </div>
      <p className="text-sm text-gray-400">
        Raw token claims from the identity broker. Custom/namespaced claims are
        highlighted in amber. Hover the <span className="inline-block w-3.5 h-3.5 rounded-full bg-gray-700 text-[9px] text-gray-400 text-center leading-[14px] border border-gray-600">?</span> icons for claim descriptions.
      </p>
      <TokenSection title="ID Token Claims" claims={idToken} defaultOpen />
      <TokenSection title="Access Token Claims" claims={accessToken} />
      <TokenSection title="Session Data" claims={sessionData} />
    </div>
  );
}
