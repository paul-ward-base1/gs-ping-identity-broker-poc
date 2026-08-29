export const OKTA_UPSTREAM_IDP = "okta-workforce";
export type BrokerLogoutStrategy = "saml" | "oidc";

export function getBrokerLogoutStrategy(
  upstreamIdp: string | undefined,
  samlSloUrl: string | undefined,
): BrokerLogoutStrategy {
  return upstreamIdp === OKTA_UPSTREAM_IDP && samlSloUrl ? "saml" : "oidc";
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
