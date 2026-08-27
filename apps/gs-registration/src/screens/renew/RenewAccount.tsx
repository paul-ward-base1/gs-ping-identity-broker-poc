import { useNavigate } from 'react-router-dom'
import { useAuth } from 'react-oidc-context'
import { TopNav } from '../../components/TopNav'
import { Footer } from '../../components/Footer'
import { Button, ArrowRightIcon } from '../../components/Button'
import { MOCK_MEMBER } from './mockMember'
import './RenewAccount.css'

export function RenewAccount() {
  const navigate = useNavigate()
  const auth = useAuth()
  const member = {
    ...MOCK_MEMBER,
    ...(auth.isAuthenticated ? {
      firstName: (auth.user?.profile.given_name as string) ?? MOCK_MEMBER.firstName,
      lastName: (auth.user?.profile.family_name as string) ?? MOCK_MEMBER.lastName,
      email: (auth.user?.profile.email as string) ?? MOCK_MEMBER.email,
    } : {}),
  }

  const hasExpiredOrExpiring = member.memberships.some(
    m => m.status === 'expired' || m.status === 'expiring-soon'
  )

  return (
    <div className="screen">
      <TopNav />

      <div className="screen-body">
        {/* Account header */}
        <div className="renew-account-header">
          <div className="renew-account-avatar">
            {member.firstName[0]}{member.lastName[0]}
          </div>
          <div>
            <p className="renew-account-welcome">Welcome back,</p>
            <h1 className="renew-account-name">{member.firstName} {member.lastName}</h1>
            <p className="renew-account-council">{member.council}</p>
          </div>
        </div>

        <div className="renew-account-content">
          {/* Renewal alert */}
          {hasExpiredOrExpiring && (
            <div className="renew-account-alert">
              <AlertIcon />
              <div>
                <div className="renew-account-alert-title">Renewal needed</div>
                <p className="renew-account-alert-desc">
                  {member.memberships.filter(m => m.status !== 'active').length} membership
                  {member.memberships.filter(m => m.status !== 'active').length !== 1 ? 's' : ''} require renewal.
                </p>
              </div>
            </div>
          )}

          {/* Section label */}
          <div className="renew-account-section-label">Your memberships</div>

          {/* Membership cards */}
          <div className="renew-membership-list">
            {member.memberships.map(mem => (
              <div
                key={mem.id}
                className={`renew-membership-card renew-membership-card--${mem.status}`}
              >
                <div className="renew-membership-card-header">
                  <div className="renew-membership-card-icon">
                    <GirlScoutIcon />
                  </div>
                  <StatusBadge status={mem.status} />
                </div>
                <div className="renew-membership-card-body">
                  <div className="renew-membership-card-name">{mem.type}</div>
                  <div className="renew-membership-card-member">
                    {mem.girlScout.firstName} {mem.girlScout.lastName} · {mem.girlScout.grade}
                  </div>
                  <div className="renew-membership-card-id">ID: {mem.memberId}</div>
                  <div className={`renew-membership-card-expiry renew-membership-card-expiry--${mem.status}`}>
                    {mem.status === 'expired' ? 'Expired' : 'Expires'}: {mem.expiry}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Renew CTA */}
          <Button onClick={() => navigate('/renew/select')} icon={<ArrowRightIcon />}>
            Renew now
          </Button>

          <button
            type="button"
            className="renew-account-secondary"
            onClick={() => navigate('/')}
          >
            Back to home
          </button>
        </div>

        <Footer />
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const labels: Record<string, string> = {
    active: 'Active',
    'expiring-soon': 'Expiring soon',
    expired: 'Expired',
  }
  return (
    <span className={`renew-status-badge renew-status-badge--${status}`}>
      {labels[status] ?? status}
    </span>
  )
}

function GirlScoutIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M10 2L12.5 8.5H19.5L14 12.5L16.5 19L10 15L3.5 19L6 12.5L0.5 8.5H7.5L10 2Z" fill="currentColor" />
    </svg>
  )
}

function AlertIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 6V11M10 14.5V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
