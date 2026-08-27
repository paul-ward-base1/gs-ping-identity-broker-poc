import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { TopNav } from '../../components/TopNav'
import { Footer } from '../../components/Footer'
import { TextField } from '../../components/TextField'
import { Button, BackButton, ArrowRightIcon } from '../../components/Button'
import { RadioCard } from '../../components/RadioCard'
import { useRegistration } from '../../context/RegistrationContext'
import './EventCheckout.css'

export function EventCheckout() {
  const navigate = useNavigate()
  const { data, update } = useRegistration()
  const [mode, setMode] = useState<'guest' | 'signin' | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showGuestForm, setShowGuestForm] = useState(false)

  const handleModeSelect = (m: 'guest' | 'signin') => {
    setMode(m)
    if (m === 'guest') setShowGuestForm(true)
    if (m === 'signin') navigate('/register-event/payment') // mock: skip sign in
  }

  const validateGuest = () => {
    const errs: Record<string, string> = {}
    if (!data.caregiverFirstName.trim()) errs.caregiverFirstName = 'First name is required'
    if (!data.caregiverLastName.trim()) errs.caregiverLastName = 'Last name is required'
    if (!data.caregiverEmail.trim()) {
      errs.caregiverEmail = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.caregiverEmail)) {
      errs.caregiverEmail = 'Please enter a valid email address'
    }
    return errs
  }

  const handleGuestSubmit = (e: FormEvent) => {
    e.preventDefault()
    const errs = validateGuest()
    if (Object.keys(errs).length) { setErrors(errs); return }
    navigate('/register-event/payment')
  }

  return (
    <div className="screen">
      <TopNav />

      <div className="screen-body">
        <div className="screen-content">
          <BackButton onClick={() => navigate(`/register-event/event/${data.selectedEventId}`)} />

          {/* Event summary */}
          <div className="event-checkout-summary">
            <div className="event-checkout-event-name">{data.selectedEventName}</div>
            <div className="event-checkout-event-meta">
              {data.selectedEventDate} · {data.selectedEventCity}
            </div>
            <div className="event-checkout-event-price">
              {data.selectedEventPrice === 0 ? 'Free' : `$${data.selectedEventPrice} per person`}
            </div>
          </div>

          <div className="heading-group">
            <div className="heading">
              <h1 className="screen-title">Checkout as...</h1>
            </div>
          </div>

          {!showGuestForm ? (
            <div className="form">
              <div className="fields">
                <RadioCard
                  label="Guest checkout"
                  description="Quick and easy — no account needed."
                  selected={mode === 'guest'}
                  onSelect={() => handleModeSelect('guest')}
                />
                <RadioCard
                  label="Returning customer"
                  description="Sign in to access your saved info and past registrations."
                  selected={mode === 'signin'}
                  onSelect={() => handleModeSelect('signin')}
                />
              </div>
            </div>
          ) : (
            <form onSubmit={handleGuestSubmit} noValidate>
              <div className="form">
                <div className="event-checkout-guest-label">Your contact details</div>
                <div className="fields">
                  <TextField
                    label="First name"
                    value={data.caregiverFirstName}
                    onChange={e => update({ caregiverFirstName: e.target.value })}
                    error={errors.caregiverFirstName}
                    autoComplete="given-name"
                    autoFocus
                  />
                  <TextField
                    label="Last name"
                    value={data.caregiverLastName}
                    onChange={e => update({ caregiverLastName: e.target.value })}
                    error={errors.caregiverLastName}
                    autoComplete="family-name"
                  />
                  <TextField
                    label="Email address"
                    type="email"
                    value={data.caregiverEmail}
                    onChange={e => update({ caregiverEmail: e.target.value })}
                    error={errors.caregiverEmail}
                    autoComplete="email"
                    inputMode="email"
                  />
                </div>
                <Button type="submit" icon={<ArrowRightIcon />}>
                  Continue to payment
                </Button>
                <button
                  type="button"
                  className="event-checkout-back-link"
                  onClick={() => { setShowGuestForm(false); setMode(null) }}
                >
                  ← Change checkout option
                </button>
              </div>
            </form>
          )}
        </div>

        <Footer />
      </div>
    </div>
  )
}
