'use client';

import { useSession } from 'next-auth/react';
import './leader-dashboard.scss';

type UserRole = 'member' | 'admin';

interface BrokerClaims {
  roles?: UserRole[];
  name?: string;
  upstreamIdp?: string;
  upstreamClaims?: { councilCode?: string };
}

const MOCK_TROOPS = [
  { id: 'T-4521', name: 'Troop 4521', leader: 'Sarah Chen', members: 12, level: 'Brownie', nextMeeting: 'June 18' },
  { id: 'T-4522', name: 'Troop 4522', leader: 'Maria Lopez', members: 8, level: 'Junior', nextMeeting: 'June 20' },
  { id: 'T-7890', name: 'Troop 7890', leader: 'Kim Nguyen', members: 15, level: 'Cadette', nextMeeting: 'June 17' },
];

const MOCK_EVENTS = [
  { name: 'Cookie Kickoff Rally', date: 'June 22', troops: 3, registered: 28 },
  { name: 'Outdoor Skills Workshop', date: 'July 10', troops: 2, registered: 16 },
  { name: 'STEM Badge Day', date: 'July 15', troops: 5, registered: 42 },
];

export default function LeaderDashboardPage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div className="leader-dashboard"><p>Loading...</p></div>;
  }

  const brokerClaims = (session as unknown as { brokerClaims?: BrokerClaims })?.brokerClaims;
  const roles = brokerClaims?.roles ?? [];
  const isAdmin = roles.includes('admin');

  if (!session?.user || !isAdmin) {
    return (
      <div className="leader-dashboard">
        <div className="access-denied">
          <h1>Access Denied</h1>
          <p>The Leader Dashboard is available to council users only.</p>
          <p className="access-denied__role">
            Your current role: <strong>{roles.join(', ') || 'none'}</strong>
          </p>
          <p className="access-denied__hint">
            Sign in with a council account (Okta Workforce) to access this page.
          </p>
        </div>
      </div>
    );
  }

  const councilCode = brokerClaims?.upstreamClaims?.councilCode;

  return (
    <div className="leader-dashboard">
      <div className="leader-dashboard__header">
        <h1>Leader Dashboard</h1>
        {councilCode && <span className="leader-dashboard__council">Council {councilCode}</span>}
      </div>

      <section className="leader-dashboard__section">
        <h2>My Troops</h2>
        <table className="leader-dashboard__table">
          <thead>
            <tr>
              <th>Troop</th>
              <th>Leader</th>
              <th>Members</th>
              <th>Level</th>
              <th>Next Meeting</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_TROOPS.map(t => (
              <tr key={t.id}>
                <td>{t.name}</td>
                <td>{t.leader}</td>
                <td>{t.members}</td>
                <td>{t.level}</td>
                <td>{t.nextMeeting}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="leader-dashboard__section">
        <h2>Upcoming Events</h2>
        <table className="leader-dashboard__table">
          <thead>
            <tr>
              <th>Event</th>
              <th>Date</th>
              <th>Troops</th>
              <th>Registered</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_EVENTS.map(e => (
              <tr key={e.name}>
                <td>{e.name}</td>
                <td>{e.date}</td>
                <td>{e.troops}</td>
                <td>{e.registered}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
