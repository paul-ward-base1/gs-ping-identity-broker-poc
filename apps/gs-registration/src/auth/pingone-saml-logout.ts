export const OKTA_UPSTREAM_IDP = 'okta-workforce'
export type BrokerLogoutStrategy = 'saml' | 'oidc'

export function getBrokerLogoutStrategy(
  upstreamIdp: string | undefined,
  samlSloUrl: string | undefined,
): BrokerLogoutStrategy {
  return upstreamIdp === OKTA_UPSTREAM_IDP && samlSloUrl ? 'saml' : 'oidc'
}

function asHttpsUrl(value: string | undefined): URL | undefined {
  if (!value) return undefined

  try {
    const url = new URL(value)
    return url.protocol === 'https:' ? url : undefined
  } catch {
    return undefined
  }
}

export function getPingOneSamlSloUrl(
  authority: string,
  configuredUrl?: string,
): string | undefined {
  const configured = asHttpsUrl(configuredUrl?.trim())
  if (configured) return configured.toString()

  const authorityUrl = asHttpsUrl(authority.trim())
  if (!authorityUrl || !authorityUrl.hostname.includes('pingone.')) return undefined

  const authorityPath = authorityUrl.pathname.replace(/\/+$/, '')
  if (!authorityPath.endsWith('/as')) return undefined

  authorityUrl.pathname = `${authorityPath.slice(0, -3)}/saml20/startslo`
  authorityUrl.search = ''
  authorityUrl.hash = ''
  return authorityUrl.toString()
}
