import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from 'react-oidc-context'
import { Button } from '../components/Button'

export function AuthCallback() {
  const auth = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (auth.isLoading || auth.error) return
    navigate('/', { replace: true })
  }, [auth.isLoading, auth.error, navigate])

  if (auth.error) {
    return (
      <div className="app-shell" style={{ padding: 24 }}>
        <h1>Sign-in failed</h1>
        <p>{auth.error.message}</p>
        <Button onClick={() => navigate('/', { replace: true })}>Back to home</Button>
      </div>
    )
  }

  return <div className="app-shell">Signing you in…</div>
}