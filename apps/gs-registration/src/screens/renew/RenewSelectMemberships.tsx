import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TopNav } from '../../components/TopNav'
import { Footer } from '../../components/Footer'
import { Button, BackButton, ArrowRightIcon } from '../../components/Button'
import { useRegistration } from '../../context/RegistrationContext'
import { MOCK_MEMBER } from './mockMember'
import './RenewSelectMemberships.css'

export function RenewSelectMemberships() {
  const navigate = useNavigate()
  const { update } = useRegistration()
  const member = MOCK_MEMBER

  const [selected, setSelected] = useState<string[]>(
    // Pre-select expired/expiring memberships
    member.memberships
      .filter(m => m.status !== 'active')
      .map(m => m.id)
  )
  const [error, setError] = useState('')

  const toggle = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
    setError('')
  }

  const handleContinue = () => {
    if (selected.length === 0) { setError('Please select at least one membership to renew'); return }
    update({ renewSelectedMemberships: selected })
    navigate('/renew/membership')
  }

  return (
    <div className="screen">
      <TopNav />

      <div className="screen-body">
        <div className="screen-content">
          <BackButton onClick={() => navigate('/renew/account')} />

          <div className="heading-group">
            <div className="heading">
              <h1 className="screen-title">Which memberships or roles do you want to renew?</h1>
            </div>
            <p className="screen-subtitle">Select all that apply.</p>
          </div>

          {error && <p className="renew-select-error">{error}</p>}

          <div className="renew-select-list">
            {member.memberships.map(mem => {
              const isSelected = selected.includes(mem.id)
              return (
                <button
                  key={mem.id}
                  type="button"
                  className={[
                    'renew-select-card',
                    isSelected ? 'renew-select-card--selected' : '',
                    `renew-select-card--${mem.status}`,
                  ].filter(Boolean).join(' ')}
                  onClick={() => toggle(mem.id)}
                >
                  <div className="renew-select-checkbox">
                    <div className="renew-select-checkbox-box">
                      {isSelected && <CheckIcon />}
                    </div>
                  </div>
                  <div className="renew-select-body">
                    <div className="renew-select-type">{mem.type}</div>
                    <div className="renew-select-member">
                      {mem.girlScout.firstName} {mem.girlScout.lastName} · {mem.girlScout.grade}
                    </div>
                    <div className={`renew-select-expiry renew-select-expiry--${mem.status}`}>
                      {mem.status === 'expired' ? 'Expired' : 'Expires'}: {mem.expiry}
                    </div>
                  </div>
                  <span className={`renew-select-badge renew-select-badge--${mem.status}`}>
                    {mem.status === 'expired' ? 'Expired' : mem.status === 'expiring-soon' ? 'Expiring soon' : 'Active'}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="form">
            <Button onClick={handleContinue} icon={<ArrowRightIcon />}>
              Continue
            </Button>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  )
}

function CheckIcon() {
  return (
    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
