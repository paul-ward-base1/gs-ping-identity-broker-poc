'use client';

import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';

function SignInRedirect() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/en';

  useEffect(() => {
    if (searchParams.get('error')) {
      sessionStorage.setItem('sso-checked', Date.now().toString());
      window.location.href = callbackUrl.startsWith('/') ? callbackUrl : '/en';
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
