import { useEffect } from 'react'

export function PostSignoff() {
  useEffect(() => {
    const markerUrl = new URL(
      'https://cdc-login.gsusa.local/api/auth/mark-gigya-logout',
    )
    markerUrl.searchParams.set('redirect', window.location.origin)
    window.location.replace(markerUrl)
  }, [])

  return <p style={{ padding: '2rem', fontFamily: 'sans-serif' }}>Completing sign out…</p>
}
