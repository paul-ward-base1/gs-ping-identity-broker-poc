'use client';

import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';

function SignInRedirect() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/en';

  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      sessionStorage.setItem('sso-checked', Date.now().toString());
      const target = new URL(callbackUrl.startsWith('/') ? callbackUrl : '/en', window.location.origin);
      // Forwarded so a popup-complete destination can report failure instead
      // of the popup silently reporting success back to its opener.
      target.searchParams.set('error', error);
      window.location.href = target.toString();
      return;
    }
    const hint = searchParams.get('hint');
    signIn('broker', { callbackUrl }, hint ? { kc_idp_hint: hint } : {});
  }, [callbackUrl, searchParams]);

  return <p style={{ color: '#646669' }}>Redirecting to sign in...</p>;
}

export default function SignInPage() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', fontFamily: 'Poppins, sans-serif' }}>
      <Suspense fallback={<p style={{ color: '#646669' }}>Loading...</p>}>
        <SignInRedirect />
      </Suspense>
    </div>
  );
}
