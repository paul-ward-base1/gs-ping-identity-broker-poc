import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { TopNav } from '../../components/TopNav'
import { Footer } from '../../components/Footer'
import { TextField } from '../../components/TextField'
import { Button, BackButton } from '../../components/Button'
import { useRegistration } from '../../context/RegistrationContext'
import './EventPayment.css'

export function EventPayment() {
  const navigate = useNavigate()
  const { data } = useRegistration()
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [nameOnCard, setNameOnCard] = useState(
    `${data.caregiverFirstName} ${data.caregiverLastName}`.trim()
  )
  const [errors, setErrors] = useState<Record<string, string>>({})

  const formatCard = (v: string) =>
    v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()

  const formatExpiry = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 4)
    if (d.length > 2) return `${d.slice(0, 2)}/${d.slice(2)}`
    return d
  }

  const validate = () => {
    const errs: Record<string, string> = {}
    const digits = cardNumber.replace(/\s/g, '')
    if (!digits || digits.length < 16) errs.cardNumber = 'Valid card number required'
    if (!expiry || expiry.length < 5) errs.expiry = 'Valid expiry required (MM/YY)'
    if (!cvv || cvv.length < 3) errs.cvv = 'CVV required'
    if (!nameOnCard.trim()) errs.nameOnCard = 'Name on card is required'
    return errs
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    navigate('/register-event/confirmation')
  }

  const isFree = data.selectedEventPrice === 0

  return (
    <div className="screen">
      <TopNav />

      <form className="screen-body" onSubmit={handleSubmit} noValidate>
        <div className="screen-content">
          <BackButton onClick={() => navigate('/register-event/checkout')} />

          {/* Order summary */}
          <div className="event-payment-summary">
            <div className="event-payment-summary-title">Order summary</div>
            <div className="event-payment-row">
              <span>{data.selectedEventName}</span>
              <span>{isFree ? 'Free' : `$${data.selectedEventPrice}`}</span>
            </div>
            {!isFree && (
              <div className="event-payment-row event-payment-row--total">
                <span>Total</span>
                <span>${data.selectedEventPrice}</span>
              </div>
            )}
          </div>

          <div className="form">
            {isFree ? (
              <>
                <div className="event-payment-free-notice">
                  <CheckCircleIcon />
                  <p>This event is <strong>free</strong>! Just confirm your spot below.</p>
                </div>
                <Button type="submit">
                  Confirm registration
                </Button>
              </>
            ) : (
              <>
                <div className="event-payment-section-label">Payment</div>
                <div className="fields">
                  <TextField
                    label="Card number"
                    value={cardNumber}
                    onChange={e => setCardNumber(formatCard(e.target.value))}
                    error={errors.cardNumber}
                    inputMode="numeric"
                    autoComplete="cc-number"
                    autoFocus
                  />
                  <div className="event-payment-row-fields">
                    <TextField
                      label="MM/YY"
                      value={expiry}
                      onChange={e => setExpiry(formatExpiry(e.target.value))}
                      error={errors.expiry}
                      inputMode="numeric"
                      autoComplete="cc-exp"
                      maxLength={5}
                    />
                    <TextField
                      label="CVV"
                      value={cvv}
                      onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      error={errors.cvv}
                      inputMode="numeric"
                      autoComplete="cc-csc"
                      maxLength={4}
                    />
                  </div>
                  <TextField
                    label="Name on card"
                    value={nameOnCard}
                    onChange={e => setNameOnCard(e.target.value)}
                    error={errors.nameOnCard}
                    autoComplete="cc-name"
                  />
                </div>

                <div className="event-payment-secure">
                  <LockIcon />
                  <span>Your payment is secure and encrypted</span>
                </div>

                <Button type="submit">
                  Pay ${data.selectedEventPrice}
                </Button>
              </>
            )}
          </div>
        </div>

        <Footer />
      </form>
    </div>
  )
}

function CheckCircleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="9" fill="rgba(0,180,81,0.15)" stroke="#00B451" strokeWidth="1.5" />
      <path d="M6 10L8.5 12.5L14 7" stroke="#00B451" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="2" y="6" width="10" height="7" rx="1.5" stroke="#646669" strokeWidth="1.3" />
      <path d="M4.5 6V4.5a2.5 2.5 0 015 0V6" stroke="#646669" strokeWidth="1.3" />
    </svg>
  )
}
