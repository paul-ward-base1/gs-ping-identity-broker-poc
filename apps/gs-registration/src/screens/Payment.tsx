import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { TopNav } from '../components/TopNav'
import { Footer } from '../components/Footer'
import { BackButton } from '../components/Button'
import { useRegistration } from '../context/RegistrationContext'
import troopLogo from '../assets/troop-12345.png'
import './Payment.css'

const PRODUCT_MAP: Record<string, { name: string; price: number }> = {
  'annual-girl':        { name: 'Annual Membership - 2027',    price: 65 },
  'annual-adult':       { name: 'Extended Year - 2026 + 2027', price: 91 },
  'caregiver-annual':   { name: 'Annual Membership - 2027',    price: 30 },
  'caregiver-extended': { name: 'Extended Year - 2026 + 2027', price: 42 },
}
const COUNCIL_FEE = 15

type PaymentMethod = 'credit-card' | 'financial-aid'

export function Payment() {
  const navigate = useNavigate()
  const { data, meta, update } = useRegistration()

  const [summaryOpen, setSummaryOpen] = useState(false)
  const [useDifferentAddress, setUseDifferentAddress] = useState(false)
  const [altAddress, setAltAddress] = useState({ street1: '', street2: '', city: '', state: '', zip: '' })
  const [girlPaymentMethod, setGirlPaymentMethod] = useState<PaymentMethod | null>(null)
  const [caregiverPaymentMethod, setCaregiverPaymentMethod] = useState<PaymentMethod | null>(null)
  const [cardForm, setCardForm] = useState({ nameOnCard: '', cardNumber: '', expiry: '', cvv: '' })
  const [voucherCode, setVoucherCode] = useState('')
  const [voucherApplied, setVoucherApplied] = useState(false)
  const [voucherError, setVoucherError] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const VOUCHER_DISCOUNT = 5
  const VOUCHER_DESCRIPTIONS: Record<string, string> = {
    'Langtree2026': 'Langtree Elementary recruitment event',
  }
  const voucherDescription = VOUCHER_DESCRIPTIONS[voucherCode] ?? voucherCode

  const handleApplyVoucher = () => {
    if (!voucherCode.trim()) return
    if (VOUCHER_DESCRIPTIONS[voucherCode]) {
      setVoucherApplied(true)
      setVoucherError(false)
    } else {
      setVoucherError(true)
    }
  }
  const handleRemoveVoucher = () => { setVoucherApplied(false); setVoucherCode(''); setVoucherError(false) }

  // Compute order totals — same logic as Cart
  const girlProductIds = data.membershipProduct
    ? data.membershipProduct.split(',').filter(id => PRODUCT_MAP[id])
    : []
  const caregiverProductIds = data.caregiverMembershipProduct
    ? data.caregiverMembershipProduct.split(',').filter(id => PRODUCT_MAP[id])
    : []
  const girlProducts     = girlProductIds.map(id => PRODUCT_MAP[id])
  const caregiverProducts = caregiverProductIds.map(id => PRODUCT_MAP[id])
  const girlTotal      = girlProducts.length > 0
    ? girlProducts.reduce((s, p) => s + p.price, 0) + COUNCIL_FEE : 0
  const caregiverTotal = caregiverProducts.length > 0
    ? caregiverProducts.reduce((s, p) => s + p.price, 0) : 0
  const totalDiscount = voucherApplied
    ? (girlProducts.length > 0 ? 2 : 0) + (caregiverProducts.length > 0 ? 1 : 0)
    : 0
  const cartTotal = girlTotal + caregiverTotal - (totalDiscount * VOUCHER_DISCOUNT)
  const girlNetTotal = girlTotal - (voucherApplied ? 2 * VOUCHER_DISCOUNT : 0)
  const caregiverNetTotal = caregiverTotal - (voucherApplied ? VOUCHER_DISCOUNT : 0)
  const canPay =
    (girlProducts.length === 0 || girlPaymentMethod !== null) &&
    (caregiverProducts.length === 0 || caregiverPaymentMethod !== null)
  const onlyFinancialAid = canPay && girlPaymentMethod !== 'credit-card' && caregiverPaymentMethod !== 'credit-card'
  const creditCardTotal =
    (girlPaymentMethod === 'credit-card' ? girlNetTotal : 0) +
    (caregiverPaymentMethod === 'credit-card' ? caregiverNetTotal : 0)
  const financialAidTotal =
    (girlPaymentMethod === 'financial-aid' ? girlNetTotal : 0) +
    (caregiverPaymentMethod === 'financial-aid' ? caregiverNetTotal : 0)
  const isMixed = canPay && creditCardTotal > 0 && financialAidTotal > 0

  const girlName      = [data.girlFirstName, data.girlLastName].filter(Boolean).join(' ') || 'Girl Scout'
  const caregiverName = [data.caregiverFirstName, data.caregiverLastName].filter(Boolean).join(' ') || 'Caregiver'

  const formatCard = (v: string) =>
    v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()

  const formatExpiry = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 4)
    return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (girlPaymentMethod === 'credit-card' || caregiverPaymentMethod === 'credit-card') {
      if (!cardForm.nameOnCard.trim()) errs.nameOnCard = 'Name on card is required'
      if (cardForm.cardNumber.replace(/\s/g, '').length < 16) errs.cardNumber = 'Enter a valid card number'
      if (cardForm.expiry.length < 5) errs.expiry = 'Enter a valid expiry date'
      if (cardForm.cvv.length < 3) errs.cvv = 'Enter a valid CVV'
    }
    if (Object.keys(errs).length) { setErrors(errs); return }
    update({ girlPaymentMethod: girlPaymentMethod ?? '', caregiverPaymentMethod: caregiverPaymentMethod ?? '' })
    navigate('/confirmation')
  }

  const cityStateZip = [data.city, data.state, data.zip].filter(Boolean).join(', ')

  return (
    <div className="screen">
      <TopNav cartCount={2} />

      <form className="screen-body" onSubmit={handleSubmit} noValidate>
        <div className="screen-content">
          <BackButton onClick={() => navigate('/cart')} />

          {/* ── Order summary (collapsible) ── */}
          <div className="pay-summary pay-summary--top">
            <button
              type="button"
              className="pay-summary-toggle"
              onClick={() => setSummaryOpen(v => !v)}
            >
              <span className="pay-summary-toggle-label">
                Order summary
                <span className={`pay-summary-chevron ${summaryOpen ? 'pay-summary-chevron--open' : ''}`}>
                  <ChevronDownIcon />
                </span>
              </span>
              <span className="pay-summary-toggle-total">
                <span className="pay-total-usd">USD</span>
                <span className="pay-currency pay-currency--lg">$</span>{cartTotal}
              </span>
            </button>

            {summaryOpen && (
              <>
                {/* Discount / voucher code */}
                {voucherApplied ? (
                  <div className="pay-voucher-row">
                    <span className="pay-voucher-applied-label">
                      {voucherCode}
                      <button type="button" className="pay-voucher-dismiss" onClick={handleRemoveVoucher} aria-label="Remove voucher">✕</button>
                    </span>
                    <button type="button" className="pay-voucher-btn pay-voucher-btn--applied" disabled>Applied</button>
                  </div>
                ) : (
                  <>
                    <div className="pay-voucher-row">
                      <input
                        className={`pay-voucher-input${voucherError ? ' pay-voucher-input--error' : ''}`}
                        type="text"
                        placeholder="Discount code"
                        value={voucherCode}
                        onChange={e => { setVoucherCode(e.target.value); setVoucherError(false) }}
                      />
                      <button
                        type="button"
                        className={`pay-voucher-btn${voucherError ? ' pay-voucher-btn--invalid' : ''}`}
                        disabled={!voucherCode.trim()}
                        onClick={handleApplyVoucher}
                      >
                        {voucherError ? 'Invalid' : 'Apply'}
                      </button>
                    </div>
                    {voucherError && (
                      <p className="pay-voucher-error">
                        Your discount code is not valid
                        <button type="button" className="pay-voucher-error-dismiss" onClick={() => { setVoucherCode(''); setVoucherError(false) }}>✕</button>
                      </p>
                    )}
                  </>
                )}

                {/* Girl group */}
                {girlProducts.length > 0 && (
                  <div className="pay-summary-group">
                    <div className="pay-sum-person-header">
                      <div className="pay-sum-person-identity">
                        <p className="pay-sum-person-name">{girlName}</p>
                        {meta.hasTroop && <p className="pay-sum-troop-name">{data.selectedTroopName}</p>}
                      </div>
                      {meta.hasTroop
                        ? <img src={troopLogo} alt="Troop logo" className="pay-troop-logo" />
                        : <PayCouncilBadge />}
                    </div>
                    {girlProducts.map((p, i) => (
                      <div key={i} className="pay-summary-row">
                        <span>{p.name}</span>
                        <span className="pay-summary-price"><span className="pay-currency">$</span>{p.price}</span>
                      </div>
                    ))}
                    {voucherApplied && (
                      <>
                        <div className="pay-summary-row pay-summary-row--discount">
                          <span>Discount applied</span>
                          <span className="pay-summary-price">-<span className="pay-currency">$</span>{VOUCHER_DISCOUNT}</span>
                        </div>
                        <p className="pay-voucher-description">Your <strong>{voucherDescription}</strong> discount has been applied!</p>
                      </>
                    )}
                    <div className="pay-summary-row">
                      <span className="pay-fee-label">Council Service Fees <SummaryInfoIcon /></span>
                      <span className="pay-summary-price"><span className="pay-currency">$</span>{COUNCIL_FEE}</span>
                    </div>
                    {voucherApplied && (
                      <>
                        <div className="pay-summary-row pay-summary-row--discount">
                          <span>Discount applied</span>
                          <span className="pay-summary-price">-<span className="pay-currency">$</span>{VOUCHER_DISCOUNT}</span>
                        </div>
                        <p className="pay-voucher-description">Your <strong>{voucherDescription}</strong> discount has been applied!</p>
                      </>
                    )}
                  </div>
                )}

                {/* Caregiver group */}
                {caregiverProducts.length > 0 && (
                  <div className="pay-summary-group pay-summary-group--divider">
                    <div className="pay-sum-person-header">
                      <div className="pay-sum-person-identity">
                        <p className="pay-sum-person-name">{caregiverName}</p>
                      </div>
                      {meta.hasTroop
                        ? <img src={troopLogo} alt="Troop logo" className="pay-troop-logo" />
                        : <PayCouncilBadge />}
                    </div>
                    {caregiverProducts.map((p, i) => (
                      <div key={i} className="pay-summary-row">
                        <span>{p.name}</span>
                        <span className="pay-summary-price"><span className="pay-currency">$</span>{p.price}</span>
                      </div>
                    ))}
                    {voucherApplied && (
                      <>
                        <div className="pay-summary-row pay-summary-row--discount">
                          <span>Discount applied</span>
                          <span className="pay-summary-price">-<span className="pay-currency">$</span>{VOUCHER_DISCOUNT}</span>
                        </div>
                        <p className="pay-voucher-description">Your <strong>{voucherDescription}</strong> discount has been applied!</p>
                      </>
                    )}
                  </div>
                )}

                {/* Per-person payment options */}
                {(girlProducts.length > 0 || caregiverProducts.length > 0) && (
                  <div className="pay-person-options">
                    {girlProducts.length > 0 && (
                      <div className="pay-person-option-group">
                        <div className="pay-person-option-header">
                          <p className="pay-person-option-label">
                            Please select a payment option for:{' '}
                            <span className="pay-person-option-name">{data.girlFirstName || 'Girl Scout'}</span>
                          </p>
                          <span className="pay-person-option-subtotal">
                            <span className="pay-currency pay-currency--lg">$</span>{girlNetTotal}
                          </span>
                        </div>
                        <div className="pay-methods-group">
                          <div
                            className={`pay-method-card ${girlPaymentMethod === 'credit-card' ? 'pay-method-card--selected' : ''}`}
                            onClick={() => setGirlPaymentMethod('credit-card')}
                          >
                            <div className="pay-method-header">
                              <div className={`pay-radio ${girlPaymentMethod === 'credit-card' ? 'pay-radio--filled' : ''}`}>
                                {girlPaymentMethod === 'credit-card' && <div className="pay-radio-dot" />}
                              </div>
                              <span className="pay-method-label">Credit card</span>
                              <div className="pay-card-brands">
                                <VisaBadge /><McBadge /><AmexBadge /><DiscoverBadge />
                              </div>
                            </div>
                          </div>
                          <div
                            className={`pay-method-card ${girlPaymentMethod === 'financial-aid' ? 'pay-method-card--selected' : ''}`}
                            onClick={() => setGirlPaymentMethod('financial-aid')}
                          >
                            <div className="pay-method-header">
                              <div className={`pay-radio ${girlPaymentMethod === 'financial-aid' ? 'pay-radio--filled' : ''}`}>
                                {girlPaymentMethod === 'financial-aid' && <div className="pay-radio-dot" />}
                              </div>
                              <span className="pay-method-label">Apply for financial aid <HelpIconWithTooltip /></span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {caregiverProducts.length > 0 && (
                      <div className="pay-person-option-group">
                        <div className="pay-person-option-header">
                          <p className="pay-person-option-label">
                            Please select a payment option for:{' '}
                            <span className="pay-person-option-name">{data.caregiverFirstName || 'Caregiver'}</span>
                          </p>
                          <span className="pay-person-option-subtotal">
                            <span className="pay-currency pay-currency--lg">$</span>{caregiverNetTotal}
                          </span>
                        </div>
                        <div className="pay-methods-group">
                          <div
                            className={`pay-method-card ${caregiverPaymentMethod === 'credit-card' ? 'pay-method-card--selected' : ''}`}
                            onClick={() => setCaregiverPaymentMethod('credit-card')}
                          >
                            <div className="pay-method-header">
                              <div className={`pay-radio ${caregiverPaymentMethod === 'credit-card' ? 'pay-radio--filled' : ''}`}>
                                {caregiverPaymentMethod === 'credit-card' && <div className="pay-radio-dot" />}
                              </div>
                              <span className="pay-method-label">Credit card</span>
                              <div className="pay-card-brands">
                                <VisaBadge /><McBadge /><AmexBadge /><DiscoverBadge />
                              </div>
                            </div>
                          </div>
                          <div
                            className={`pay-method-card ${caregiverPaymentMethod === 'financial-aid' ? 'pay-method-card--selected' : ''}`}
                            onClick={() => setCaregiverPaymentMethod('financial-aid')}
                          >
                            <div className="pay-method-header">
                              <div className={`pay-radio ${caregiverPaymentMethod === 'financial-aid' ? 'pay-radio--filled' : ''}`}>
                                {caregiverPaymentMethod === 'financial-aid' && <div className="pay-radio-dot" />}
                              </div>
                              <span className="pay-method-label">Apply for financial aid <HelpIconWithTooltip /></span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="pay-summary-divider" />
                <div className="pay-summary-total-row">
                  <span className="pay-summary-total-label">Total</span>
                  <span className="pay-summary-total-amount">
                    <span className="pay-total-usd">USD</span>
                    <span className="pay-currency pay-currency--lg">$</span>{cartTotal}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* ── Payment details (credit card only, shown when any person selected credit card) ── */}
          {(girlPaymentMethod === 'credit-card' || caregiverPaymentMethod === 'credit-card') && (
            <>
              <div className="pay-details-heading">
                <h2 className="pay-details-title">Payment details</h2>
                <p className="pay-details-subtitle">All transactions are secure and encrypted.</p>
              </div>

              <div className="pay-card-fields pay-card-fields--standalone">
                <div className="pay-field">
                  <input
                    className={`pay-input${errors.nameOnCard ? ' pay-input--error' : ''}`}
                    type="text" placeholder="Name on card" aria-label="Name on card"
                    value={cardForm.nameOnCard} autoComplete="cc-name"
                    onChange={e => { setErrors(p => ({ ...p, nameOnCard: '' })); setCardForm(p => ({ ...p, nameOnCard: e.target.value })) }}
                  />
                  {errors.nameOnCard && <p className="pay-field-error">{errors.nameOnCard}</p>}
                </div>
                <div className="pay-field">
                  <div className="pay-input-icon-wrap">
                    <input
                      className={`pay-input pay-input--with-icon${errors.cardNumber ? ' pay-input--error' : ''}`}
                      type="text" placeholder="Card number" aria-label="Card number"
                      value={cardForm.cardNumber} inputMode="numeric" autoComplete="cc-number"
                      onChange={e => { setErrors(p => ({ ...p, cardNumber: '' })); setCardForm(p => ({ ...p, cardNumber: formatCard(e.target.value) })) }}
                    />
                    <span className="pay-input-icon"><LockIcon /></span>
                  </div>
                  {errors.cardNumber && <p className="pay-field-error">{errors.cardNumber}</p>}
                </div>
                <div className="pay-field">
                  <input
                    className={`pay-input${errors.expiry ? ' pay-input--error' : ''}`}
                    type="text" placeholder="Expiration date" aria-label="Expiration date"
                    value={cardForm.expiry} inputMode="numeric" autoComplete="cc-exp"
                    onChange={e => { setErrors(p => ({ ...p, expiry: '' })); setCardForm(p => ({ ...p, expiry: formatExpiry(e.target.value) })) }}
                  />
                  <p className="pay-field-hint">MM/YY as shown on card</p>
                  {errors.expiry && <p className="pay-field-error">{errors.expiry}</p>}
                </div>
                <div className="pay-field">
                  <input
                    className={`pay-input${errors.cvv ? ' pay-input--error' : ''}`}
                    type="password" placeholder="CVV" aria-label="CVV security code"
                    value={cardForm.cvv} inputMode="numeric" autoComplete="cc-csc"
                    onChange={e => { setErrors(p => ({ ...p, cvv: '' })); setCardForm(p => ({ ...p, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })) }}
                  />
                  <p className="pay-field-hint">3-digit code on back of card (4-digit on front for Amex)</p>
                  {errors.cvv && <p className="pay-field-error">{errors.cvv}</p>}
                </div>
              </div>

              {errors.payment && <p className="pay-error">{errors.payment}</p>}

              {/* ── Billing address ── */}
              <div className={`pay-address-card ${!useDifferentAddress ? 'pay-address-card--selected' : ''}`}>
                <div className={`pay-radio ${!useDifferentAddress ? 'pay-radio--filled' : ''}`}>
                  {!useDifferentAddress && <div className="pay-radio-dot" />}
                </div>
                <div className="pay-address-info">
                  <p className="pay-address-name">{caregiverName}</p>
                  {data.addressLine1 && <p className="pay-address-line">{data.addressLine1}</p>}
                  {data.addressLine2 && <p className="pay-address-line">{data.addressLine2}</p>}
                  {cityStateZip && <p className="pay-address-line">{cityStateZip}</p>}
                </div>
              </div>

              <button
                type="button"
                className="pay-alt-toggle"
                onClick={() => setUseDifferentAddress(v => !v)}
              >
                <span className="pay-alt-toggle-icon">{useDifferentAddress ? '−' : '+'}</span>
                Use a different address
              </button>

              {useDifferentAddress && (
                <div className="pay-alt-form">
                  <div className="pay-field">
                    <input className="pay-input" type="text" placeholder="Street address line 1"
                      value={altAddress.street1}
                      onChange={e => setAltAddress(p => ({ ...p, street1: e.target.value }))} />
                  </div>
                  <div className="pay-field">
                    <input className="pay-input" type="text" placeholder="Street address line 2 (optional)"
                      value={altAddress.street2}
                      onChange={e => setAltAddress(p => ({ ...p, street2: e.target.value }))} />
                  </div>
                  <div className="pay-field">
                    <input className="pay-input" type="text" placeholder="City"
                      value={altAddress.city}
                      onChange={e => setAltAddress(p => ({ ...p, city: e.target.value }))} />
                  </div>
                  <div className="pay-field">
                    <input className="pay-input" type="text" placeholder="State / Province"
                      value={altAddress.state}
                      onChange={e => setAltAddress(p => ({ ...p, state: e.target.value }))} />
                  </div>
                  <div className="pay-field">
                    <input className="pay-input" type="text" placeholder="ZIP code"
                      value={altAddress.zip} inputMode="numeric"
                      onChange={e => setAltAddress(p => ({ ...p, zip: e.target.value.replace(/\D/g, '').slice(0, 5) }))} />
                  </div>
                </div>
              )}
            </>
          )}

          {/* Non-refundable notice */}
          <div className="pay-notice">
            <p>Please note that Membership and Council Service Fees are non-refundable.</p>
          </div>

          {/* Terms text */}
          <p className="pay-terms-text">
            By paying for Membership, you are agreeing to the{' '}
            <span className="pay-terms-link">Girl Scouts Terms of Service</span>
          </p>

          {/* ── Submit ── */}
          {isMixed && (
            <div className="pay-financial-aid-pending">
              Financial aid pending ${financialAidTotal}
            </div>
          )}

          <button type="submit" className={`pay-submit-btn${onlyFinancialAid ? ' pay-submit-btn--financial-aid' : ''}`} disabled={!canPay}>
            {onlyFinancialAid ? 'Apply for financial aid' : `Pay $${isMixed ? creditCardTotal : cartTotal}`}
          </button>

          {/* Footer links */}
          <div className="pay-footer-links">
            <span className="pay-footer-link">Terms and Conditions <ExternalLinkIcon /></span>
            <span className="pay-footer-link">Privacy Policy <ExternalLinkIcon /></span>
          </div>

        </div>

        <Footer />
      </form>
    </div>
  )
}

function PayCouncilBadge() {
  return (
    <div className="pay-council-badge">
      <div className="pay-council-logo">
        <span className="pay-council-gs">girl scouts</span>
        <PayTrefoilIcon />
      </div>
      <span className="pay-council-location">of location</span>
    </div>
  )
}

function PayTrefoilIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="4.5" r="2.8" fill="#00563F" />
      <circle cx="4"  cy="9"   r="2.8" fill="#00563F" />
      <circle cx="10" cy="9"   r="2.8" fill="#00563F" />
      <rect x="6.3" y="5" width="1.4" height="5" rx="0.7" fill="#00563F" />
    </svg>
  )
}

function ChevronDownIcon() {
  return (
    <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
      <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function HelpIconWithTooltip() {
  return (
    <span className="pay-help-wrap">
      <HelpIcon />
      <span className="pay-help-tooltip">
        <strong>Financial Aid</strong>
        <br />
        Payment is held until eligibility is determined. Council members will contact you after review
      </span>
    </span>
  )
}

function HelpIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="9" cy="9" r="9" fill="#2196F3" />
      <text x="9" y="13.5" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold" fontFamily="Arial">?</text>
    </svg>
  )
}

function SummaryInfoIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 4 }}>
      <circle cx="7" cy="7" r="6" stroke="#646669" strokeWidth="1.2" fill="none"/>
      <path d="M7 6.5v4" stroke="#646669" strokeWidth="1.2" strokeLinecap="round"/>
      <circle cx="7" cy="4.5" r="0.75" fill="#646669"/>
    </svg>
  )
}

function ExternalLinkIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 3 }}>
      <path d="M5 2H2a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M8 1h3v3M11 1 6 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function LockIcon() {
  return (
    <svg width="16" height="18" viewBox="0 0 16 18" fill="none">
      <rect x="1" y="8" width="14" height="9" rx="2" stroke="#646669" strokeWidth="1.4" fill="none"/>
      <path d="M4.5 8V5.5a3.5 3.5 0 0 1 7 0V8" stroke="#646669" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
    </svg>
  )
}

function VisaBadge() {
  return (
    <svg width="38" height="24" viewBox="0 0 38 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="38" height="24" rx="4" fill="#1A1F71"/>
      <text x="50%" y="16" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold" fontFamily="Arial">VISA</text>
    </svg>
  )
}

function McBadge() {
  return (
    <svg width="38" height="24" viewBox="0 0 38 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="38" height="24" rx="4" fill="#252525"/>
      <circle cx="15" cy="12" r="7" fill="#EB001B"/>
      <circle cx="23" cy="12" r="7" fill="#F79E1B"/>
      <path d="M19 6.8a7 7 0 0 1 0 10.4A7 7 0 0 1 19 6.8z" fill="#FF5F00"/>
    </svg>
  )
}

function AmexBadge() {
  return (
    <svg width="38" height="24" viewBox="0 0 38 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="38" height="24" rx="4" fill="#007BC1"/>
      <text x="50%" y="16" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold" fontFamily="Arial">AMEX</text>
    </svg>
  )
}

function DiscoverBadge() {
  return (
    <svg width="38" height="24" viewBox="0 0 38 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="38" height="24" rx="4" fill="#fff" stroke="#e0e0e0"/>
      <circle cx="26" cy="12" r="8" fill="#F76F20"/>
      <text x="9" y="16" fill="#231F20" fontSize="7" fontWeight="bold" fontFamily="Arial">DISC</text>
    </svg>
  )
}
