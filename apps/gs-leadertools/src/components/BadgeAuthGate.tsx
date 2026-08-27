'use client';

import { useSession } from 'next-auth/react';

interface BrokerClaims {
  name?: string;
  email?: string;
  upstreamIdp?: string;
  roles?: string[];
  upstreamClaims?: {
    councilCode?: string;
    gsUserType?: string;
  };
}

export function BadgeAuthBanner() {
  const { data: session } = useSession();

  if (!session?.user) return null;

  const brokerClaims = (session as unknown as { brokerClaims?: BrokerClaims })?.brokerClaims;
  if (!brokerClaims) return null;

  return (
    <div
      style={{
        background: '#edf7ed',
        border: '1px solid #006b50',
        borderRadius: '8px',
        padding: '12px 16px',
        marginBottom: '16px',
        fontFamily: 'Poppins, sans-serif',
        fontSize: '0.875rem',
      }}
    >
      <strong style={{ color: '#006b50' }}>
        Viewing as {brokerClaims.name}
      </strong>
      {brokerClaims.upstreamClaims?.councilCode && (
        <span style={{ color: '#4d5154', marginLeft: '8px' }}>
          — Council {brokerClaims.upstreamClaims.councilCode}
        </span>
      )}
      {brokerClaims.upstreamIdp && (
        <span style={{ color: '#7a7c7f', marginLeft: '8px' }}>
          (via {brokerClaims.upstreamIdp})
        </span>
      )}
    </div>
  );
}
