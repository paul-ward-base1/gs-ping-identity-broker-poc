import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { TopNav } from '../../components/TopNav'
import { Footer } from '../../components/Footer'
import { TextField } from '../../components/TextField'
import { Button, BackButton } from '../../components/Button'
import { useRegistration } from '../../context/RegistrationContext'
import { MOCK_MEMBER, RENEW_PRODUCTS } from './mockMember'
import './RenewPayment.css'

const COUNCIL_FEE = 5

export function RenewPayment() {
  const navigate = useNavigate()
  const { data } = useRegistration()

  const product = RENEW_PRODUCTS.find(p => p.id === data.renewProduct) ?? RENEW_PRODUCTS[0]
  const total = product.price + COUNCIL_FEE

  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [nameOnCard, setNameOnCard] = useState(`${MOCK_MEMBER.firstName} ${MOCK_MEMBER.lastName}`)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [summaryExpanded, setSummaryExpanded] = useState(false)

  const formatCard = (v: string) =>
    v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
  const formatExpiry = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 4)
    return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d
  }

  const validate = () => {
    const errs: Record<string, string> = {}
    if (cardNumber.replace(/\s/g, '').length < 16) errs.cardNumber = 'Valid card number required'
    if (expiry.length < 5) errs.expiry = 'Valid expiry required'
    if (cvv.length < 3) errs.cvv = 'CVV required'
    if (!nameOnCard.trim()) errs.nameOnCard = 'Name on card is required'
    return errs
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    navigate('/renew/confirmation')
  }

  const selectedMem = MOCK_MEMBER.memberships.find(
    m => data.renewSelectedMemberships.includes(m.id)
  )

  return (
    <div className="screen">
      <TopNav />

      <form className="screen-body" onSubmit={handleSubmit} noValidate>
        <div className="screen-content">
          <BackButton onClick={() => navigate('/renew/cart')} />

          {/* Collapsible order summary */}
          <button
            type="button"
            className="renew-payment-summary-toggle"
            onClick={() => setSummaryExpanded(s => !s)}
          >
            <div className="renew-payment-summary-left">
              <CartIcon />
              <span>Order summary</span>
            </div>
            <div className="renew-payment-summary-right">
              <span className="renew-payment-total-preview">${total}</span>
              <ChevronIcon expanded={summaryExpanded} />
            </div>
          </button>

          {summaryExpanded && (
            <div className="renew-payment-summary-body">
              <div className="renew-payment-summary-row">
                <span>{product.name}</span>
                <span>${product.price}</span>
              </div>
              {selectedMem && (
                <div className="renew-payment-summary-row renew-payment-summary-row--sub">
                  <span>{selectedMem.girlScout.firstName} {selectedMem.girlScout.lastName}</span>
                </div>
              )}
              <div className="renew-payment-summary-row">
                <span>Council fee</span>
                <span>${COUNCIL_FEE}</span>
              </div>
              <div className="renew-payment-summary-row renew-payment-summary-row--total">
                <span>Total</span>
                <span>${total}</span>
              </div>
            </div>
          )}

          {/* Personal details (pre-filled) */}
          <div className="renew-payment-section">
            <div className="renew-payment-section-label">Account details</div>
            <div className="renew-payment-prefilled">
              <div className="renew-payment-prefilled-row">
                <span className="renew-payment-prefilled-label">Name</span>
                <span>{MOCK_MEMBER.firstName} {MOCK_MEMBER.lastName}</span>
              </div>
              <div className="renew-payment-prefilled-row">
                <span className="renew-payment-prefilled-label">Email</span>
                <span>{MOCK_MEMBER.email}</span>
              </div>
            </div>
          </div>

          {/* Billing address */}
          <div className="renew-payment-section">
            <div className="renew-payment-section-label">Billing address</div>
            <div className="fields">
              <TextField label="ZIP code" defaultValue="78701" />
            </div>
          </div>

          {/* Payment */}
          <div className="renew-payment-section">
            <div className="renew-payment-section-label">Payment</div>
            <div className="fields">
              <TextField
                label="Card number"
                value={cardNumber}
                onChange={e => setCardNumber(formatCard(e.target.value))}
                error={errors.cardNumber}
                inputMode="numeric"
                autoComplete="cc-number"
              />
              <div className="renew-payment-card-row">
                <TextField
                  label="MM/YY"
                  value={expiry}
                  onChange={e => setExpiry(formatExpiry(e.target.value))}
                  error={errors.expiry}
                  inputMode="numeric"
                  maxLength={5}
                  autoComplete="cc-exp"
                />
                <TextField
                  label="CVV"
                  value={cvv}
                  onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  error={errors.cvv}
                  inputMode="numeric"
                  maxLength={4}
                  autoComplete="cc-csc"
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
          </div>

          <div className="renew-payment-secure">
            <LockIcon />
            <span>Your payment is secure and encrypted</span>
          </div>

          <Button type="submit">
            Pay ${total}
          </Button>
        </div>

        <Footer />
      </form>
    </div>
  )
}

function CartIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M1 1H3L5 10H13L15 4H4" stroke="#646669" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="6" cy="13" r="1" fill="#646669" />
      <circle cx="12" cy="13" r="1" fill="#646669" />
    </svg>
  )
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg width="12" height="8" viewBox="0 0 12 8" fill="none" style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
      <path d="M1 1L6 7L11 1" stroke="#646669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
