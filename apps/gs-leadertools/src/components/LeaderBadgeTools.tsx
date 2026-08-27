'use client';

import { useSession } from 'next-auth/react';

interface BrokerClaims {
  roles?: string[];
}

export function LeaderBadgeTools() {
  const { data: session } = useSession();

  const brokerClaims = (session as unknown as { brokerClaims?: BrokerClaims })?.brokerClaims;
  const isAdmin = brokerClaims?.roles?.includes('admin') ?? false;

  if (!isAdmin) return null;

  return (
    <div
      style={{
        background: '#fff8e1',
        border: '1px solid #f9a825',
        borderRadius: '8px',
        padding: '16px',
        marginTop: '24px',
        fontFamily: 'Poppins, sans-serif',
      }}
    >
      <h3 style={{ margin: '0 0 12px', fontSize: '1rem', color: '#e65100' }}>
        Leader Tools
      </h3>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <button
          style={{
            padding: '8px 16px',
            background: '#005640',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer',
          }}
          onClick={() => alert('Assign to Troop — demo placeholder')}
        >
          Assign to Troop
        </button>
        <button
          style={{
            padding: '8px 16px',
            background: '#fff',
            color: '#005640',
            border: '1px solid #005640',
            borderRadius: '4px',
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer',
          }}
          onClick={() => alert('Print Requirements — demo placeholder')}
        >
          Print Requirements
        </button>
      </div>
      <div style={{ marginTop: '16px', padding: '12px', background: '#fffde7', borderRadius: '4px' }}>
        <h4 style={{ margin: '0 0 8px', fontSize: '0.875rem', color: '#333' }}>Leader Notes</h4>
        <p style={{ margin: 0, fontSize: '0.8125rem', color: '#646669' }}>
          This badge pairs well with the Outdoor Journey. Consider scheduling a troop campout
          to complete steps 3-5. Council 623 has pre-approved campsites available through July.
        </p>
      </div>
    </div>
  );
}
