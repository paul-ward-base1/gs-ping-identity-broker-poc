'use client';

import React from 'react';
import { useSession, signIn } from 'next-auth/react';
import './AuthControls.scss';

export const AuthControls = () => {
  const { data: session, status } = useSession();

  if (status === 'loading') return null;

  if (!session?.user) {
    return (
      <div className="gs-auth-controls">
        <button className="gs-auth-controls__sign-in" onClick={() => signIn('broker', undefined, { acr_values: 'GigyaOnly' })}>
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
