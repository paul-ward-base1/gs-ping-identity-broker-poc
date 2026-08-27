import { useState, FormEvent } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { TopNav } from '../../components/TopNav'
import { Footer } from '../../components/Footer'
import { TextField } from '../../components/TextField'
import { Button, BackButton, ArrowRightIcon } from '../../components/Button'
import { ProgressBar } from '../../components/ProgressBar'
import { RadioCard } from '../../components/RadioCard'
import './LeadCapture.css'

// ─── No Match / Contact Options ─────────────────────────────────────────────

export function LeadNoMatch() {
  const navigate = useNavigate()
  const [answer, setAnswer] = useState<'yes' | 'no' | null>(null)
  const [error, setError] = useState('')

  const handleContinue = () => {
    if (!answer) { setError('Please select an option'); return }
    if (answer === 'yes') {
      navigate('/join-troop/lead/email')
    } else {
      navigate('/')
    }
  }

  return (
    <div className="screen">
      <TopNav />
      <ProgressBar current={3} total={10} />

      <div className="screen-body">
        <div className="screen-content">
          <BackButton onClick={() => navigate(-1)} />

          <div className="heading-group">
            <div className="heading">
              <p className="eyebrow">No matching troops found</p>
              <h1 className="screen-title">Would you like us to notify you when a troop is available?</h1>
            </div>
            <p className="screen-subtitle">
              Leave your details and a troop leader or council staff member will reach out when a match is found.
            </p>
          </div>

          <div className="form">
            {error && <p className="lead-error">{error}</p>}
            <div className="fields">
              <RadioCard
                label="Yes, notify me"
                description="I'll leave my contact details so you can reach out when a troop is available."
                selected={answer === 'yes'}
                onSelect={() => { setAnswer('yes'); setError('') }}
              />
              <RadioCard
                label="No thanks, I'll check back later"
                selected={answer === 'no'}
                onSelect={() => { setAnswer('no'); setError('') }}
              />
            </div>
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

// ─── Lead Email ──────────────────────────────────────────────────────────────

export function LeadEmail() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!email.trim()) { setError('Email address is required'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Please enter a valid email address'); return }
    navigate('/join-troop/lead/name', { state: { email } })
  }

  return (
    <div className="screen">
      <TopNav />
      <ProgressBar current={4} total={10} />

      <form className="screen-body" onSubmit={handleSubmit} noValidate>
        <div className="screen-content">
          <BackButton onClick={() => navigate('/join-troop/no-match')} />

          <div className="heading-group">
            <div className="heading">
              <p className="eyebrow">Stay in touch</p>
              <h1 className="screen-title">What's your email address?</h1>
            </div>
          </div>

          <div className="form">
            <div className="fields">
              <TextField
                label="Email address"
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError('') }}
                error={error}
                autoComplete="email"
                inputMode="email"
                autoFocus
              />
            </div>
            <Button type="submit" icon={<ArrowRightIcon />}>
              Continue
            </Button>
          </div>
        </div>
        <Footer />
      </form>
    </div>
  )
}

// ─── Lead Name ───────────────────────────────────────────────────────────────

export function LeadName() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state || {}) as Record<string, string>
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!firstName.trim()) errs.firstName = 'First name is required'
    if (!lastName.trim()) errs.lastName = 'Last name is required'
    if (Object.keys(errs).length) { setErrors(errs); return }
    navigate('/join-troop/lead/zip', { state: { ...state, firstName, lastName } })
  }

  return (
    <div className="screen">
      <TopNav />
      <ProgressBar current={5} total={10} />

      <form className="screen-body" onSubmit={handleSubmit} noValidate>
        <div className="screen-content">
          <BackButton onClick={() => navigate('/join-troop/lead/email')} />

          <div className="heading-group">
            <div className="heading">
              <p className="eyebrow">Stay in touch</p>
              <h1 className="screen-title">What's your name?</h1>
            </div>
          </div>

          <div className="form">
            <div className="fields">
              <TextField
                label="First name"
                value={firstName}
                onChange={e => { setFirstName(e.target.value); setErrors(p => ({ ...p, firstName: '' })) }}
                error={errors.firstName}
                autoComplete="given-name"
                autoFocus
              />
              <TextField
                label="Last name"
                value={lastName}
                onChange={e => { setLastName(e.target.value); setErrors(p => ({ ...p, lastName: '' })) }}
                error={errors.lastName}
                autoComplete="family-name"
              />
            </div>
            <Button type="submit" icon={<ArrowRightIcon />}>
              Continue
            </Button>
          </div>
        </div>
        <Footer />
      </form>
    </div>
  )
}

// ─── Lead ZIP ────────────────────────────────────────────────────────────────

export function LeadZip() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state || {}) as Record<string, string>
  const [zip, setZip] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!zip.trim()) { setError('ZIP code is required'); return }
    if (!/^\d{5}$/.test(zip)) { setError('Enter a valid 5-digit ZIP code'); return }
    navigate('/join-troop/lead/school', { state: { ...state, zip } })
  }

  return (
    <div className="screen">
      <TopNav />
      <ProgressBar current={6} total={10} />

      <form className="screen-body" onSubmit={handleSubmit} noValidate>
        <div className="screen-content">
          <BackButton onClick={() => navigate('/join-troop/lead/name')} />

          <div className="heading-group">
            <div className="heading">
              <p className="eyebrow">Stay in touch</p>
              <h1 className="screen-title">What's your ZIP code?</h1>
            </div>
            <p className="screen-subtitle">We'll use this to match you with troops in your area.</p>
          </div>

          <div className="form">
            <div className="fields">
              <TextField
                label="ZIP code"
                value={zip}
                onChange={e => { setZip(e.target.value); setError('') }}
                error={error}
                inputMode="numeric"
                maxLength={5}
                autoComplete="postal-code"
                autoFocus
              />
            </div>
            <Button type="submit" icon={<ArrowRightIcon />}>
              Continue
            </Button>
          </div>
        </div>
        <Footer />
      </form>
    </div>
  )
}

// ─── Lead School ─────────────────────────────────────────────────────────────

export function LeadSchool() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state || {}) as Record<string, string>
  const [school, setSchool] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    navigate('/join-troop/lead/comments', { state: { ...state, school } })
  }

  return (
    <div className="screen">
      <TopNav />
      <ProgressBar current={7} total={10} />

      <form className="screen-body" onSubmit={handleSubmit} noValidate>
        <div className="screen-content">
          <BackButton onClick={() => navigate('/join-troop/lead/zip')} />

          <div className="heading-group">
            <div className="heading">
              <p className="eyebrow">Stay in touch</p>
              <h1 className="screen-title">What school does your Girl Scout attend?</h1>
            </div>
            <p className="screen-subtitle">This is optional but helps us find local troops.</p>
          </div>

          <div className="form">
            <div className="fields">
              <TextField
                label="School name (optional)"
                value={school}
                onChange={e => setSchool(e.target.value)}
                autoFocus
              />
            </div>
            <Button type="submit" icon={<ArrowRightIcon />}>
              Continue
            </Button>
          </div>
        </div>
        <Footer />
      </form>
    </div>
  )
}

// ─── Lead Comments ───────────────────────────────────────────────────────────

export function LeadComments() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state || {}) as Record<string, string>
  const [comments, setComments] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    navigate('/join-troop/lead/confirmation', { state: { ...state, comments } })
  }

  return (
    <div className="screen">
      <TopNav />
      <ProgressBar current={8} total={10} />

      <form className="screen-body" onSubmit={handleSubmit} noValidate>
        <div className="screen-content">
          <BackButton onClick={() => navigate('/join-troop/lead/school')} />

          <div className="heading-group">
            <div className="heading">
              <p className="eyebrow">Stay in touch</p>
              <h1 className="screen-title">Anything else you'd like to share?</h1>
            </div>
            <p className="screen-subtitle">Optional — tell us about your Girl Scout, preferences, or any questions.</p>
          </div>

          <div className="form">
            <div className="fields">
              <div className="lead-textarea-wrap">
                <textarea
                  className="lead-textarea"
                  placeholder="Your message (optional)"
                  value={comments}
                  onChange={e => setComments(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
            <Button type="submit" icon={<ArrowRightIcon />}>
              Submit
            </Button>
          </div>
        </div>
        <Footer />
      </form>
    </div>
  )
}

// ─── Lead Confirmation ───────────────────────────────────────────────────────

export function LeadConfirmation() {
  const navigate = useNavigate()

  return (
    <div className="screen">
      <TopNav />

      <div className="screen-body">
        <div className="screen-content">
          <div className="lead-confirmation-hero">
            <div className="lead-confirmation-icon">
              <CheckIcon />
            </div>
            <h1 className="screen-title">We'll be in touch!</h1>
            <p className="screen-subtitle">
              Your details have been received. A council representative will contact you when a matching troop is found in your area.
            </p>
          </div>

          <div className="lead-confirmation-next">
            <div className="lead-next-step">
              <div className="lead-next-number">1</div>
              <div>
                <div className="lead-next-heading">Check your email</div>
                <p className="lead-next-desc">We've sent a confirmation to your email address.</p>
              </div>
            </div>
            <div className="lead-next-step">
              <div className="lead-next-number">2</div>
              <div>
                <div className="lead-next-heading">We'll search for a match</div>
                <p className="lead-next-desc">Our team will look for an available troop near you.</p>
              </div>
            </div>
            <div className="lead-next-step">
              <div className="lead-next-number">3</div>
              <div>
                <div className="lead-next-heading">You'll hear from us soon</div>
                <p className="lead-next-desc">A council staff member or troop leader will reach out directly.</p>
              </div>
            </div>
          </div>

          <Button onClick={() => navigate('/')}>
            Back to home
          </Button>
        </div>
        <Footer />
      </div>
    </div>
  )
}

function CheckIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path d="M6 16L13 23L26 9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
