import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TopNav } from '../components/TopNav'
import { Footer } from '../components/Footer'
import { useRegistration } from '../context/RegistrationContext'
import './Confirmation.css'

const referenceNumber = Math.floor(10000000 + Math.random() * 90000000).toString()

export function Confirmation() {
  const { meta } = useRegistration()

  return (
    <div className="screen">
      <TopNav />
      <div className="screen-body">
        <div className="screen-content">
          {meta.existingCaregiver
            ? <ExistingCaregiverConfirmation />
            : <NewMemberConfirmation />}
        </div>
        <Footer />
      </div>
    </div>
  )
}

// ── Variant: existing caregiver (Janet Lewis) ─────────────────────────────────

function ExistingCaregiverConfirmation() {
  const navigate = useNavigate()
  const { meta } = useRegistration()

  return (
    <>
      <ConfirmationHero />
      <p className="conf-email-sent">We have sent you a confirmation email.</p>
      <h2 className="conf-next-title">Next steps</h2>
      <p className="conf-next-desc">
        Login to your account to manage your memberships, event registrations and troop participations all in one place.
      </p>
      <button
        type="button"
        className={`conf-create-btn${meta.existingCaregiverWithFA ? ' conf-create-btn--financial-aid' : ''}`}
        onClick={() => navigate('/')}
      >
        Login to your account!
      </button>
    </>
  )
}

// ── Variant: new member account creation ──────────────────────────────────────

function NewMemberConfirmation() {
  const navigate = useNavigate()
  const { data, meta } = useRegistration()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)
  const [passwordError, setPasswordError] = useState('')

  const passwordRules = [
    { label: 'At least 8 characters',       test: (p: string) => p.length >= 8 },
    { label: 'At least 1 number',            test: (p: string) => /\d/.test(p) },
    { label: 'At least 1 upper case letter', test: (p: string) => /[A-Z]/.test(p) },
    { label: 'At least 1 lower case letter', test: (p: string) => /[a-z]/.test(p) },
    { label: 'At least 1 special character', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
  ]
  const passwordValid = passwordRules.every(r => r.test(password))

  const handleCreateAccount = () => {
    if (!passwordValid) { setPasswordError('Password does not meet the requirements above'); return }
    if (password !== confirmPassword) { setPasswordError('Passwords do not match'); return }
    setPasswordError('')
    navigate('/')
  }

  return (
    <>
      <ConfirmationHero />

      {meta.isMixed && (
        <div className="conf-hero conf-hero--financial-aid conf-hero--secondary">
          <div className="conf-hero-content">
            <h1 className="conf-title conf-title--secondary">
              We've received your request for financial aid and we're on it!
            </h1>
          </div>
        </div>
      )}

      <p className="conf-email-sent">
        We have sent you a confirmation email.
        {(meta.onlyFinancialAid || meta.isMixed) && ' Please allow a few days for us to process your request.'}
      </p>

      <h2 className="conf-next-title">Next steps</h2>
      <p className="conf-next-desc">
        Create a password to complete your account setup. When you log into your account, you'll be able to manage your memberships, event registrations and troop participation all in one place.
      </p>

      <div className="conf-field">
        <span className="conf-field-label">Email address</span>
        <p className="conf-input conf-input--static">{data.caregiverEmail}</p>
      </div>

      <div className="conf-field conf-field--icon">
        <input
          className="conf-input"
          type={showPassword ? 'text' : 'password'}
          placeholder="Password"
          value={password}
          onChange={e => { setPassword(e.target.value); setPasswordError('') }}
          onFocus={() => setPasswordFocused(true)}
          onBlur={() => setPasswordFocused(false)}
          autoComplete="new-password"
        />
        <button type="button" className="conf-eye-btn" onClick={() => setShowPassword(v => !v)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}>
          {showPassword ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>

      {passwordFocused && (
        <ul className="conf-password-rules">
          {passwordRules.map(rule => (
            <li key={rule.label} className={`conf-password-rule ${rule.test(password) ? 'conf-password-rule--met' : ''}`}>
              {rule.test(password) ? <CheckIcon /> : <DotIcon />}
              {rule.label}
            </li>
          ))}
        </ul>
      )}

      <div className="conf-field conf-field--icon">
        <input
          className="conf-input"
          type={showConfirmPassword ? 'text' : 'password'}
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={e => { setConfirmPassword(e.target.value); setPasswordError('') }}
          autoComplete="new-password"
        />
        <button type="button" className="conf-eye-btn" onClick={() => setShowConfirmPassword(v => !v)}
          aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}>
          {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>

      {passwordError && <p className="conf-password-error">{passwordError}</p>}

      <button
        type="button"
        className="conf-create-btn"
        disabled={!password || !confirmPassword}
        onClick={handleCreateAccount}
      >
        Create account
      </button>
    </>
  )
}

// ── Shared hero card ──────────────────────────────────────────────────────────

function ConfirmationHero() {
  const { meta } = useRegistration()
  return (
    <div className={`conf-hero${meta.showFinancialAidBanner ? ' conf-hero--financial-aid' : ''}`}>
      <div className="conf-hero-content">
        <h1 className="conf-title">
          {meta.showFinancialAidBanner
            ? "We received your request for financial aid and we're on it!"
            : 'Membership purchase complete'}
        </h1>
        <p className="conf-ref-label">Your order number</p>
        <p className="conf-ref-number">{referenceNumber}</p>
      </div>
      <div className="conf-hero-deco" aria-hidden="true">
        <DashedArc />
      </div>
    </div>
  )
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function DashedArc() {
  return (
    <svg width="130" height="130" viewBox="0 0 130 130" fill="none">
      <circle cx="65" cy="65" r="58" stroke="rgba(255,255,255,0.35)" strokeWidth="2" strokeDasharray="6 5"/>
      <circle cx="65" cy="65" r="40" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeDasharray="4 4"/>
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="7" cy="7" r="6" fill="#2e7d32" />
      <path d="M4 7l2 2 4-4" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function DotIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="7" cy="7" r="6" stroke="#adb5bd" strokeWidth="1.2" fill="none" />
    </svg>
  )
}

function EyeIcon() {
  return (
    <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
      <path d="M1 7C1 7 4 1 10 1s9 6 9 6-3 6-9 6S1 7 1 7z" stroke="#646669" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
      <circle cx="10" cy="7" r="2.5" stroke="#646669" strokeWidth="1.4" fill="none"/>
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg width="20" height="16" viewBox="0 0 20 16" fill="none">
      <path d="M1 1l18 14M8.5 3.2C9 3.07 9.49 3 10 3c6 0 9 5 9 5a16.6 16.6 0 0 1-2.38 3.08M5.73 4.73A16.6 16.6 0 0 0 1 8s3 5 9 5a9.16 9.16 0 0 0 4.27-1.07" stroke="#646669" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
      <path d="M7.6 8.6a2.5 2.5 0 0 0 3.8 2.8" stroke="#646669" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
    </svg>
  )
}
