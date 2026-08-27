import { useEffect } from 'react'
import { useAuth } from 'react-oidc-context'

// Mirrors the SilentAuth pattern used by the Next.js apps (see
// apps/gs-leadertools/src/components/SilentAuth.tsx) and the "sso-checked"
// sessionStorage key already read/written by TopNav.tsx on sign-out — this
// is the other half: on load, silently check for an existing broker session
// so cross-app SSO doesn't require an explicit sign-in click.
const SSO_CHECK_COOLDOWN_MS = 30000

export function useSilentSso() {
  const auth = useAuth()

  useEffect(() => {
    if (auth.isLoading || auth.isAuthenticated || auth.activeNavigator) return
    if (window.location.pathname === '/callback') return

    const checked = sessionStorage.getItem('sso-checked')
    const isRecent = checked !== null && Date.now() - parseInt(checked, 10) < SSO_CHECK_COOLDOWN_MS
    if (isRecent) return

    const timer = setTimeout(() => {
      sessionStorage.setItem('sso-checked', Date.now().toString())
      auth.signinSilent().catch(() => {
        // No existing broker session — user stays signed out.
      })
    }, 500)

    return () => clearTimeout(timer)
  }, [auth.isLoading, auth.isAuthenticated, auth.activeNavigator, auth.signinSilent])
}