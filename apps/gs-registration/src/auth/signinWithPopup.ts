import type { AuthContextProps } from 'react-oidc-context'

// Popups blocked at open time throw this specific message (see oidc-client-ts's
// AbstractChildWindow.navigate); the user closing the popup after it opened
// throws "Popup closed by user" instead and should NOT trigger a redirect —
// that would override a deliberate cancellation.
const POPUP_BLOCKED_MESSAGE = 'Attempted to navigate on a disposed window'

export function signinWithPopupFallback(auth: AuthContextProps, args?: Parameters<AuthContextProps['signinPopup']>[0]) {
  auth.signinPopup({ popupAbortOnClose: true, ...args }).catch(err => {
    if (err instanceof Error && err.message === POPUP_BLOCKED_MESSAGE) {
      console.warn('[auth] Popup blocked, falling back to full-page redirect')
      auth.signinRedirect(args).catch(redirectErr => console.error('[auth] signinRedirect failed:', redirectErr))
      return
    }
    console.warn('[auth] Sign-in popup closed or failed:', err)
  })
}
