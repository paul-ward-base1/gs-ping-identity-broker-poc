import { useEffect } from 'react'
import { useAuth } from 'react-oidc-context'

// Opens one persistent connection to the shared revocation service instead
// of polling it on a timer. The server verifies the signed PingOne ID token,
// checks it against its opaque sid/sub identifiers immediately, and then
// pushes a "revoked" event the moment /api/auth/revoke-session or a real
// OIDC backchannel-logout token invalidates this session.
export function useSessionRevocation() {
  const auth = useAuth()
  const idToken = auth.user?.id_token

  useEffect(() => {
    if (!auth.isAuthenticated || !idToken) return

    const source = new EventSource(
      `/api/auth/session-events?id_token=${encodeURIComponent(idToken)}`
    )

    source.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as { revoked?: boolean }
        if (data.revoked) void auth.removeUser()
      } catch {
        // Ignore malformed events.
      }
    }

    return () => source.close()
  }, [auth.isAuthenticated, idToken, auth.removeUser])
}
