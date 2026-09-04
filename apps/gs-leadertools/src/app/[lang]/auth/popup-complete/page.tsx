'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { POPUP_AUTH_MESSAGE_SOURCE, type PopupAuthMessage } from '@/lib/popupAuthMessage';

function PopupCompleteContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  useEffect(() => {
    const message: PopupAuthMessage = error
      ? { source: POPUP_AUTH_MESSAGE_SOURCE, status: 'error', error }
      : { source: POPUP_AUTH_MESSAGE_SOURCE, status: 'complete' };
    window.opener?.postMessage(message, window.location.origin);
    window.close();
  }, [error]);

  return <p>{error ? 'Sign-in failed. You can close this window.' : 'Signing you in…'}</p>;
}

// Destination for the sign-in popup opened by AuthControls: relays success
// or failure back to the opener via postMessage and closes itself, instead
// of leaving the popup sitting on a normal app page the user never asked for.
export default function PopupCompletePage() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', fontFamily: 'Poppins, sans-serif' }}>
      <Suspense fallback={null}>
        <PopupCompleteContent />
      </Suspense>
    </div>
  );
}
