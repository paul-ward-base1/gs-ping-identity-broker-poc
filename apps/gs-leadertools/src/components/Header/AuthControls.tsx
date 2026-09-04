'use client';

import React, { useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { POPUP_AUTH_MESSAGE_SOURCE, type PopupAuthMessage } from '@/lib/popupAuthMessage';
import './AuthControls.scss';

const POPUP_WIDTH = 700;
const POPUP_HEIGHT = 550;

// window.open() only centers relative to the screen if left/top are given
// explicitly — compute them from the current browser window so the popup
// appears centered over it rather than wherever the OS defaults to.
function centeredPopupFeatures(width: number, height: number): string {
  const left = (window.screenX ?? 0) + Math.max(0, (window.outerWidth - width) / 2);
  const top = (window.screenY ?? 0) + Math.max(0, (window.outerHeight - height) / 2);
  return `width=${width},height=${height},left=${left},top=${top}`;
}

// next-auth v5 has no built-in popup mode: fetch the provider's authorization
// URL via signIn(..., { redirect: false }) and navigate a popup to it
// ourselves. The popup is opened synchronously on the click (before the
// `await`) so browsers don't treat it as an unrequested popup once the async
// signIn() call resolves.
function openGigyaSignInPopup() {
  const popup = window.open('', 'gs-leadertools-signin', centeredPopupFeatures(POPUP_WIDTH, POPUP_HEIGHT));
  void signIn(
    'broker',
    { redirect: false, callbackUrl: `${window.location.origin}/en/auth/popup-complete` },
    { acr_values: 'GigyaOnly' }
  ).then(result => {
    if (!result?.url) return;
    if (popup && !popup.closed) {
      popup.location.href = result.url;
    } else {
      // Popup blocked — fall back to a full-page redirect.
      window.location.href = result.url;
    }
  });
}

export const AuthControls = () => {
  const { data: session, status, update } = useSession();

  useEffect(() => {
    function handlePopupMessage(event: MessageEvent<PopupAuthMessage>) {
      if (event.origin !== window.location.origin) return;
      if (event.data?.source !== POPUP_AUTH_MESSAGE_SOURCE) return;
      if (event.data.status === 'complete') void update();
    }
    window.addEventListener('message', handlePopupMessage);
    return () => window.removeEventListener('message', handlePopupMessage);
  }, [update]);

  if (status === 'loading') return null;

  if (!session?.user) {
    return (
      <div className="gs-auth-controls">
        <button className="gs-auth-controls__sign-in" onClick={openGigyaSignInPopup}>
          Sign In
        </button>
        <button className="gs-auth-controls__sign-in gs-auth-controls__sign-in--admin" onClick={() => signIn('broker', undefined, { acr_values: 'OktaOnly' })}>
          Council Sign In
        </button>
      </div>
    );
  }

  const brokerClaims = (session as unknown as {
    brokerClaims?: {
      name?: string;
      roles?: string[];
      upstreamIdp?: string;
      upstreamClaims?: { councilCode?: string };
      rawIdToken?: { acr?: string };
    };
  })?.brokerClaims;

  const displayName = brokerClaims?.name || session.user.name || 'User';
  const councilCode = brokerClaims?.upstreamClaims?.councilCode;
  const roles = brokerClaims?.roles ?? [];
  const isAdmin = roles.includes('admin');
  const idp = brokerClaims?.upstreamIdp;
  // Linked accounts report identity_provider as "local"; the OktaOnly acr
  // identifies the session's authentication policy (see pingOneSamlLogout).
  const isOktaSession = idp === 'okta-workforce' || brokerClaims?.rawIdToken?.acr === 'OktaOnly';
  const idpLabel = idp === 'gigya-b2c' ? 'CDC' : isOktaSession ? 'Okta' : idp ?? '';

  return (
    <div className="gs-auth-controls">
      <div className="gs-auth-controls__user">
        <span className="gs-auth-controls__name">{displayName}</span>
        {councilCode && <span className="gs-auth-controls__council">Council {councilCode}</span>}
        <span className="gs-auth-controls__role">{roles.join(', ')}{idpLabel ? ` · ${idpLabel}` : ''}</span>
      </div>
      {isAdmin && (
        <a href="/en/leader-dashboard" className="gs-auth-controls__dashboard-link">
          Leader Dashboard
        </a>
      )}
      <a
        href="/api/auth/federated-logout"
        className="gs-auth-controls__sign-out"
        onClick={() => sessionStorage.setItem("sso-checked", Date.now().toString())}
      >
        Sign Out
      </a>
    </div>
  );
};
