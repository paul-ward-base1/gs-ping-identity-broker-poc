export const OKTA_UPSTREAM_IDP = "okta-workforce";
// PingOne authentication-policy name requested via acr_values for Okta logins.
// The identity_provider claim reflects the IdP authoritative for the user
// record, so it reads "local" for accounts linked to a pre-existing PingOne
// user; the acr claim identifies the session's authentication policy instead.
export const OKTA_ACR_POLICY = "OktaOnly";
export type BrokerLogoutStrategy = "saml" | "oidc";

export function getBrokerLogoutStrategy(
  upstreamIdp: string | undefined,
  samlSloUrl: string | undefined,
  acr?: string,
): BrokerLogoutStrategy {
  if (!samlSloUrl) return "oidc";
  return upstreamIdp === OKTA_UPSTREAM_IDP || acr === OKTA_ACR_POLICY
    ? "saml"
    : "oidc";
}

function asHttpsUrl(value: string | undefined): URL | undefined {
  if (!value) return undefined;

  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url : undefined;
  } catch {
    return undefined;
  }
}

export function getPingOneSamlSloUrl(
  issuer: string | undefined,
  configuredUrl = process.env.PINGONE_SAML_SLO_URL,
): string | undefined {
  const configured = asHttpsUrl(configuredUrl?.trim());
  if (configured) return configured.toString();

  const issuerUrl = asHttpsUrl(issuer?.trim());
  if (!issuerUrl || !issuerUrl.hostname.includes("pingone.")) return undefined;

  const issuerPath = issuerUrl.pathname.replace(/\/+$/, "");
  if (!issuerPath.endsWith("/as")) return undefined;

  issuerUrl.pathname = `${issuerPath.slice(0, -3)}/saml20/startslo`;
  issuerUrl.search = "";
  issuerUrl.hash = "";
  return issuerUrl.toString();
}
