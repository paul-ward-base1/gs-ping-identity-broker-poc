import { useEffect } from 'react'
import { useAuth } from 'react-oidc-context'

// Polls the shared revocation service with the signed PingOne ID token. The
// server verifies the token before looking up its opaque sid/sub identifiers.
const POLL_INTERVAL_MS = 3000

export function useSessionRevocation() {
  const auth = useAuth()
  const idToken = auth.user?.id_token

  useEffect(() => {
    if (!auth.isAuthenticated || !idToken) return

    const interval = setInterval(() => {
      fetch('/api/auth/session-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_token: idToken }),
      })
        .then((res) => res.json())
        .then((data: { revoked?: boolean }) => {
          if (data.revoked) {
            void auth.removeUser()
          }
        })
        .catch(() => {
          // Transient network error — try again on the next tick.
        })
    }, POLL_INTERVAL_MS)

    return () => clearInterval(interval)
  }, [auth.isAuthenticated, idToken, auth.removeUser])
}
