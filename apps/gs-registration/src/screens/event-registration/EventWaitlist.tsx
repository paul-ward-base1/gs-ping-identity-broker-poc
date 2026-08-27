import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { TopNav } from '../../components/TopNav'
import { Footer } from '../../components/Footer'
import { TextField } from '../../components/TextField'
import { Button, BackButton, ArrowRightIcon } from '../../components/Button'
import { useRegistration } from '../../context/RegistrationContext'
import { MOCK_EVENTS } from './mockEvents'
import './EventWaitlist.css'

export function EventWaitlist() {
  const navigate = useNavigate()
  const { data, update } = useRegistration()
  const event = MOCK_EVENTS.find(e => e.id === data.selectedEventId)

  const [firstName, setFirstName] = useState(data.caregiverFirstName)
  const [lastName, setLastName] = useState(data.caregiverLastName)
  const [email, setEmail] = useState(data.caregiverEmail)
  const [phone, setPhone] = useState(data.caregiverPhone)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!firstName.trim()) errs.firstName = 'First name is required'
    if (!lastName.trim()) errs.lastName = 'Last name is required'
    if (!email.trim()) {
      errs.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Please enter a valid email address'
    }
    return errs
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    update({ caregiverFirstName: firstName, caregiverLastName: lastName, caregiverEmail: email, caregiverPhone: phone })
    navigate('/register-event/waitlist/confirmation')
  }

  return (
    <div className="screen">
      <TopNav />

      <form className="screen-body" onSubmit={handleSubmit} noValidate>
        <div className="screen-content">
          <BackButton onClick={() => navigate(`/register-event/event/${data.selectedEventId}`)} />

          <div className="heading-group">
            <div className="heading">
              <p className="eyebrow">Join waitlist</p>
              <h1 className="screen-title">You're almost on the list!</h1>
            </div>
            <p className="screen-subtitle">
              Leave your details and we'll notify you if a spot opens up for{' '}
              <strong>{event?.name || data.selectedEventName}</strong>.
            </p>
          </div>

          {event && (
            <div className="event-waitlist-event-card">
              <div className="event-waitlist-event-name">{event.name}</div>
              <div className="event-waitlist-event-meta">
                {event.date} · {event.city}
              </div>
              <div className="event-waitlist-event-status">
                <WaitlistIcon />
                {event.status === 'full-waitlist' ? 'Fully booked — waitlist open' : `${event.spotsLeft} spot${event.spotsLeft !== 1 ? 's' : ''} left — waitlist filling`}
              </div>
            </div>
          )}

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
              <TextField
                label="Email address"
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })) }}
                error={errors.email}
                autoComplete="email"
                inputMode="email"
              />
              <TextField
                label="Phone (optional)"
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                autoComplete="tel"
                inputMode="tel"
              />
            </div>

            <Button type="submit" icon={<ArrowRightIcon />}>
              Join waitlist
            </Button>
          </div>
        </div>

        <Footer />
      </form>
    </div>
  )
}

function WaitlistIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="7" cy="7" r="6" stroke="#92400e" strokeWidth="1.3" />
      <path d="M7 4V7.5L9 9" stroke="#92400e" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
