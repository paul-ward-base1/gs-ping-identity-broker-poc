import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { TopNav } from '../../components/TopNav'
import { Footer } from '../../components/Footer'
import { TextField } from '../../components/TextField'
import { Button, BackButton, ArrowRightIcon } from '../../components/Button'
import { RadioCard } from '../../components/RadioCard'
import './RenewNoAccount.css'

type Step = 'lookup' | 'verify'
type LookupMethod = 'email' | 'member-id'

// Mock found member for demo
const MOCK_FOUND = {
  name: 'Emma Smith',
  memberId: 'GS-78934521',
  expiry: 'December 31, 2025',
  council: 'Girl Scouts of Central Texas',
}

export function RenewNoAccount() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('lookup')
  const [method, setMethod] = useState<LookupMethod>('email')
  const [email, setEmail] = useState('')
  const [memberId, setMemberId] = useState('')
  const [dob, setDob] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [found, setFound] = useState(false)

  const handleLookup = (e: FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (method === 'email' && !email.trim()) errs.email = 'Email is required'
    if (method === 'member-id' && !memberId.trim()) errs.memberId = 'Member ID is required'
    if (Object.keys(errs).length) { setErrors(errs); return }
    // Mock: always find the demo member
    setFound(true)
    setStep('verify')
  }

  const handleVerify = (e: FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!dob.trim()) errs.dob = 'Date of birth is required'
    if (Object.keys(errs).length) { setErrors(errs); return }
    // Proceed to renewal flow
    navigate('/renew/select')
  }

  if (step === 'lookup') {
    return (
      <div className="screen">
        <TopNav />
        <div className="screen-body">
          <div className="screen-content">
            <BackButton onClick={() => navigate('/renew')} />

            <div className="heading-group">
              <div className="heading">
                <p className="eyebrow">No account? No problem</p>
                <h1 className="screen-title">Find your membership</h1>
              </div>
              <p className="screen-subtitle">
                Look up your membership by email address or member ID to renew without an online account.
              </p>
            </div>

            <form onSubmit={handleLookup} noValidate>
              <div className="form">
                <div className="fields">
                  <RadioCard
                    label="Look up by email"
                    description="Use the email address associated with your Girl Scout membership."
                    selected={method === 'email'}
                    onSelect={() => { setMethod('email'); setErrors({}) }}
                  />
                  <RadioCard
                    label="Look up by member ID"
                    description="Your member ID appears on your membership card (e.g. GS-78934521)."
                    selected={method === 'member-id'}
                    onSelect={() => { setMethod('member-id'); setErrors({}) }}
                  />
                </div>

                <div className="fields">
                  {method === 'email' ? (
                    <TextField
                      label="Email address"
                      type="email"
                      value={email}
                      onChange={e => { setEmail(e.target.value); setErrors({}) }}
                      error={errors.email}
                      autoComplete="email"
                      inputMode="email"
                      autoFocus
                    />
                  ) : (
                    <TextField
                      label="Member ID"
                      value={memberId}
                      onChange={e => { setMemberId(e.target.value); setErrors({}) }}
                      error={errors.memberId}
                      placeholder="GS-XXXXXXXX"
                      autoFocus
                    />
                  )}
                </div>

                <Button type="submit" icon={<ArrowRightIcon />}>
                  Find membership
                </Button>
              </div>
            </form>
          </div>

          <Footer />
        </div>
      </div>
    )
  }

  // Step: verify identity
  return (
    <div className="screen">
      <TopNav />
      <div className="screen-body">
        <div className="screen-content">
          <BackButton onClick={() => { setStep('lookup'); setFound(false) }} />

          <div className="heading-group">
            <div className="heading">
              <p className="eyebrow">Confirm your identity</p>
              <h1 className="screen-title">Is this you?</h1>
            </div>
            <p className="screen-subtitle">
              Please confirm the details below before renewing.
            </p>
          </div>

          {found && (
            <div className="renew-noact-found-card">
              <div className="renew-noact-found-name">{MOCK_FOUND.name}</div>
              <div className="renew-noact-found-row">
                <span className="renew-noact-found-label">Member ID</span>
                <span>{MOCK_FOUND.memberId}</span>
              </div>
              <div className="renew-noact-found-row">
                <span className="renew-noact-found-label">Membership</span>
                <span>Girl Scout Annual</span>
              </div>
              <div className="renew-noact-found-row">
                <span className="renew-noact-found-label">Expires</span>
                <span className="renew-noact-expired">{MOCK_FOUND.expiry}</span>
              </div>
              <div className="renew-noact-found-row">
                <span className="renew-noact-found-label">Council</span>
                <span>{MOCK_FOUND.council}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleVerify} noValidate>
            <div className="form">
              <TextField
                label="Date of birth (MM/DD/YYYY)"
                value={dob}
                onChange={e => { setDob(e.target.value); setErrors({}) }}
                error={errors.dob}
                placeholder="MM/DD/YYYY"
                inputMode="numeric"
                autoFocus
                helperText="We use this to verify your identity."
              />

              <Button type="submit" icon={<ArrowRightIcon />}>
                Confirm &amp; continue
              </Button>

              <button
                type="button"
                className="renew-noact-not-me"
                onClick={() => { setStep('lookup'); setFound(false) }}
              >
                That's not me — search again
              </button>
            </div>
          </form>
        </div>

        <Footer />
      </div>
    </div>
  )
}
