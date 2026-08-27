import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TopNav } from '../components/TopNav'
import { Footer } from '../components/Footer'
import { BackButton } from '../components/Button'
import { useRegistration } from '../context/RegistrationContext'
import troopLogo from '../assets/troop-12345.png'
import './Cart.css'

const PRODUCT_MAP: Record<string, { name: string; price: number }> = {
  'annual-girl':       { name: 'Annual Membership - 2027',    price: 65 },
  'annual-adult':      { name: 'Extended Year - 2026 + 2027', price: 91 },
  'caregiver-annual':  { name: 'Annual Membership - 2027',    price: 30 },
  'caregiver-extended':{ name: 'Extended Year - 2026 + 2027', price: 42 },
}

const COUNCIL_FEE = 15

const gradeToLevel = (grade: string): string => {
  if (!grade) return ''
  if (['Kindergarten', '1st Grade'].includes(grade)) return 'DAISY'
  if (['2nd Grade', '3rd Grade'].includes(grade))     return 'BROWNIE'
  if (['4th Grade', '5th Grade'].includes(grade))     return 'JUNIOR'
  if (['6th Grade', '7th Grade', '8th Grade'].includes(grade)) return 'CADETTE'
  if (['9th Grade', '10th Grade'].includes(grade))    return 'SENIOR'
  if (['11th Grade', '12th Grade'].includes(grade))   return 'AMBASSADOR'
  return grade.toUpperCase()
}

const gradeToRange = (grade: string): string => {
  if (!grade) return ''
  if (grade === 'Kindergarten') return 'GRADE K'
  if (['1st Grade'].includes(grade)) return 'GRADES K–1'
  if (['2nd Grade'].includes(grade)) return 'GRADES 2–3'
  if (['3rd Grade'].includes(grade)) return 'GRADE 3'
  if (['4th Grade', '5th Grade'].includes(grade)) return 'GRADES 4–5'
  if (['6th Grade', '7th Grade', '8th Grade'].includes(grade)) return 'GRADES 6–8'
  if (['9th Grade', '10th Grade'].includes(grade)) return 'GRADES 9–10'
  if (['11th Grade', '12th Grade'].includes(grade)) return 'GRADES 11–12'
  return grade.toUpperCase()
}

export function Cart() {
  const navigate = useNavigate()
  const { data, meta, update } = useRegistration()
  const [pendingRemove, setPendingRemove] = useState<null | (() => void)>(null)

  const confirmRemove = (action: () => void) => setPendingRemove(() => action)
  const handleConfirmRemove = () => { pendingRemove?.(); setPendingRemove(null) }
  const handleCancelRemove = () => setPendingRemove(null)

  // Parse selected product IDs
  const girlProductIds = data.membershipProduct
    ? data.membershipProduct.split(',').filter(id => PRODUCT_MAP[id])
    : []
  const caregiverProductIds = data.caregiverMembershipProduct
    ? data.caregiverMembershipProduct.split(',').filter(id => PRODUCT_MAP[id])
    : []

  const girlProducts  = girlProductIds.map(id => PRODUCT_MAP[id])
  const caregiverProducts = caregiverProductIds.map(id => PRODUCT_MAP[id])

  const girlSubtotal      = girlProducts.reduce((s, p) => s + p.price, 0)
  const caregiverSubtotal = caregiverProducts.reduce((s, p) => s + p.price, 0)

  const girlTotal      = girlProducts.length > 0 ? girlSubtotal + COUNCIL_FEE : 0
  const caregiverTotal = caregiverProducts.length > 0 ? caregiverSubtotal : 0
  const cartTotal      = girlTotal + caregiverTotal

  const cartGroupCount = (girlProducts.length > 0 ? 1 : 0) + (caregiverProducts.length > 0 ? 1 : 0)
  const canCheckout = girlProducts.length > 0 || caregiverProducts.length > 0

  const girlName      = [data.girlFirstName, data.girlLastName].filter(Boolean).join(' ') || 'Girl Scout'
  const caregiverName = [data.caregiverFirstName, data.caregiverLastName].filter(Boolean).join(' ') || 'Caregiver'

  const { caregiverMembershipRoute } = meta

  return (
    <div className="screen">
      <TopNav cartCount={cartGroupCount} />

      <div className="screen-body">

        {/* Cart total banner */}
        <div className="cart-banner">
          <p className="cart-banner-label">Your cart total</p>
          <p className="cart-banner-total">
            <span className="cart-banner-currency">$</span>{cartTotal}
          </p>
          <button className="cart-banner-btn" onClick={() => navigate('/payment')} disabled={!canCheckout}>
            Proceed to checkout &nbsp;→
          </button>
          <p className="cart-banner-note">
            If the cost of membership is a barrier for your family, full and partial{' '}
            <span className="cart-banner-link">financial assistance</span> is available as a
            payment option at checkout.
          </p>
        </div>

        <div className="cart-content">
          <BackButton onClick={() => navigate(caregiverMembershipRoute)} />

          {/* Heading row */}
          <div className="cart-heading-row">
            <h1 className="screen-title cart-title">Shopping cart</h1>
            <p className="cart-item-count">
              {cartGroupCount} {cartGroupCount === 1 ? 'item' : 'items'} in your cart.
            </p>
            <button className="cart-remove-all" onClick={() => update({ membershipProduct: '', membershipPrice: 0, caregiverMembershipProduct: '', caregiverMembershipPrice: 0 })}>Remove all</button>
          </div>

          {/* Girl group */}
          {girlProducts.length > 0 && (
            <GirlCartGroup
              name={girlName}
              level={gradeToLevel(data.grade)}
              gradeRange={gradeToRange(data.grade)}
              products={girlProducts}
              onEdit={() => navigate('/membership')}
              onRemove={() => confirmRemove(() => update({ membershipProduct: '', membershipPrice: 0 }))}
              onNameClick={() => navigate('/register/girls-name')}
            />
          )}

          {/* Caregiver group */}
          {caregiverProducts.length > 0 && (
            <CaregiverCartGroup
              name={caregiverName}
              products={caregiverProducts}
              onEdit={() => navigate(caregiverMembershipRoute)}
              onRemove={() => confirmRemove(() => update({ caregiverMembershipProduct: '', caregiverMembershipPrice: 0 }))}
              onNameClick={() => navigate('/register/caregiver-name')}
            />
          )}

          {/* Bottom CTA */}
          <button className="cart-checkout-btn" onClick={() => navigate('/payment')} disabled={!canCheckout}>
            Proceed to checkout &nbsp;→
          </button>
        </div>

        <Footer />
      </div>

      {pendingRemove && (
        <div className="cart-modal-overlay">
          <div className="cart-modal">
            <p className="cart-modal-message">Are you sure you want to remove this item from your cart?</p>
            <div className="cart-modal-actions">
              <button className="cart-modal-confirm" onClick={handleConfirmRemove}>Yes I am sure</button>
              <button className="cart-modal-cancel" onClick={handleCancelRemove}>No</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface GirlCartGroupProps {
  name: string
  level: string
  gradeRange: string
  products: { name: string; price: number }[]
  onEdit: () => void
  onRemove: () => void
  onNameClick?: () => void
}

function GirlCartGroup({ name, products, onEdit, onRemove, onNameClick }: GirlCartGroupProps) {
  const { data, meta } = useRegistration()
  return (
    <div className="cart-group cart-group--girl">
      <div className="cart-group-header">
        <div className="cart-group-identity">
          <p className="cart-group-name">
            {onNameClick
              ? <button type="button" className="cart-group-name-link" onClick={onNameClick}>{name}</button>
              : name}
          </p>
          {meta.hasTroop && <p className="cart-group-troop">{data.selectedTroopName}</p>}
        </div>
        {meta.hasTroop
          ? <img src={troopLogo} alt="Troop logo" className="cart-troop-logo" />
          : <CouncilBadge />}
      </div>
      <div className="cart-group-items">
        {products.map((p, i) => (
          <div key={i} className="cart-line-item">
            <span>{p.name}</span>
            <span className="cart-line-price"><span className="cart-price-currency">$</span>{p.price}</span>
          </div>
        ))}
        <div className="cart-line-item">
          <span className="cart-fee-label">Council Service Fees <InfoIcon /></span>
          <span className="cart-line-price"><span className="cart-price-currency">$</span>{COUNCIL_FEE}</span>
        </div>
      </div>
      <div className="cart-group-footer">
        <button className="cart-remove-link" onClick={onRemove}>Remove from cart</button>
        <button className="cart-edit-btn" onClick={onEdit}>Edit</button>
      </div>
    </div>
  )
}

interface CaregiverCartGroupProps {
  name: string
  products: { name: string; price: number }[]
  onEdit: () => void
  onRemove: () => void
  onNameClick?: () => void
}

function CaregiverCartGroup({ name, products, onEdit, onRemove, onNameClick }: CaregiverCartGroupProps) {
  const { meta } = useRegistration()
  return (
    <div className="cart-group">
      <div className="cart-group-header">
        <div className="cart-group-identity">
          <p className="cart-group-name">
            {onNameClick
              ? <button type="button" className="cart-group-name-link" onClick={onNameClick}>{name}</button>
              : name}
          </p>
        </div>
        {meta.hasTroop
          ? <img src={troopLogo} alt="Troop logo" className="cart-troop-logo" />
          : <CouncilBadge />}
      </div>
      <div className="cart-group-items">
        {products.map((p, i) => (
          <div key={i} className="cart-line-item">
            <span>{p.name}</span>
            <span className="cart-line-price"><span className="cart-price-currency">$</span>{p.price}</span>
          </div>
        ))}
      </div>
      <div className="cart-group-footer">
        <button className="cart-remove-link" onClick={onRemove}>Remove from cart</button>
        <button className="cart-edit-btn" onClick={onEdit}>Edit</button>
      </div>
    </div>
  )
}

function CouncilBadge() {
  return (
    <div className="cart-council-badge">
      <div className="cart-council-logo">
        <span className="cart-council-gs">girl scouts</span>
        <TrefoilIcon />
      </div>
      <span className="cart-council-location">of location</span>
    </div>
  )
}

function TrefoilIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="4.5" r="2.8" fill="#00563F" />
      <circle cx="4"  cy="9"   r="2.8" fill="#00563F" />
      <circle cx="10" cy="9"   r="2.8" fill="#00563F" />
      <rect x="6.3" y="5" width="1.4" height="5" rx="0.7" fill="#00563F" />
    </svg>
  )
}

function InfoIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 4 }}>
      <circle cx="7" cy="7" r="6" stroke="#646669" strokeWidth="1.2" fill="none" />
      <path d="M7 6.5v4" stroke="#646669" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="7" cy="4.5" r="0.75" fill="#646669" />
    </svg>
  )
}
