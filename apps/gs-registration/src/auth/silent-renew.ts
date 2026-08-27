import { UserManager } from 'oidc-client-ts'
import { oidcSettings } from './oidc-config'

// Entry point for silent-renew.html — the hidden iframe target registered
// as a redirect URI for the "gs-registration" Keycloak client. Completes
// the prompt=none flow kicked off by useSilentSso/automaticSilentRenew.
new UserManager(oidcSettings).signinSilentCallback().catch(() => {
  // Parent window's signinSilent() call rejects with the same error.
})