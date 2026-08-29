import { WebStorageStateStore, type UserManagerSettings, Log } from 'oidc-client-ts'
import type { AuthProviderProps } from 'react-oidc-context'
import { getPingOneSamlSloUrl } from './pingone-saml-logout'

// OIDC internals can include authorization details. Keep logging disabled by
// default and allow it only through an explicit local-development opt-in.
if (import.meta.env.DEV && import.meta.env.VITE_OIDC_DEBUG === 'true') {
  Log.setLogger(console)
  Log.setLevel(Log.DEBUG)
} else {
  Log.setLevel(Log.NONE)
}

// Matches the "gs-registration" SPA client registered in PingOne
// (environment a6e455f2-da21-4c7d-b40f-8b288a64b010) — PKCE, no client
// secret, redirect/silent-renew URIs registered there.
const authority = 'https://auth.pingone.ca/a6e455f2-da21-4c7d-b40f-8b288a64b010/as'

export const oidcSettings: UserManagerSettings = {
  authority,
  client_id: 'c9193ae2-d29e-4dc5-b0ff-79ac9b9a4e07',
  redirect_uri: `${window.location.origin}/callback`,
  silent_redirect_uri: `${window.location.origin}/silent-renew.html`,
  // PingOne is this app's only OP. Any upstream-IdP logout must be performed
  // by the broker, using the broker's own Gigya connection and token context.
  post_logout_redirect_uri: `${window.location.origin}/post-signoff`,
  response_type: 'code',
  scope: 'openid profile email',
  automaticSilentRenew: true,
  userStore: new WebStorageStateStore({ store: window.sessionStorage }),
}

export const pingOneSamlSloUrl = getPingOneSamlSloUrl(
  authority,
  import.meta.env.VITE_PINGONE_SAML_SLO_URL,
)

export const oidcConfig: AuthProviderProps = {
  ...oidcSettings,
  onSigninCallback: () => {
    window.history.replaceState({}, document.title, window.location.pathname)
  },
}
