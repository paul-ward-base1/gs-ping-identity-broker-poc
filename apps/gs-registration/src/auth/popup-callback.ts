import { UserManager } from 'oidc-client-ts'
import { oidcSettings } from './oidc-config'

// Entry point for popup-callback.html — the popup window target registered
// as a redirect URI for the "gs-registration" PingOne client. Relays the
// authorization response back to the opener window's signinPopup() call,
// which performs the actual token exchange using its own PKCE state.
new UserManager(oidcSettings).signinPopupCallback().catch(() => {
  // Opener window's signinPopup() call rejects with the same error.
})
