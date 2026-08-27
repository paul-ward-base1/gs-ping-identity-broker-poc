import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TopNav } from '../components/TopNav'
import { Footer } from '../components/Footer'
import { Button, BackButton } from '../components/Button'
import { ProgressBar } from '../components/ProgressBar'
import { useRegistration } from '../context/RegistrationContext'
import './MembershipOptions.css'

interface CaregiverProduct {
  id: string
  name: string
  dateRange: string
  price: number
  note?: string
}

const NO_MEMBERSHIP_ID = 'none'

const CAREGIVER_PRODUCTS: CaregiverProduct[] = [
  {
    id: 'caregiver-annual',
    name: 'Annual Membership - 2027',
    dateRange: 'October 2026 to September 2027',
    price: 30,
    note: 'Becoming an adult member will allow you to register for events with your Girl Scout and volunteer with troop/group activities.',
  },
  {
    id: 'caregiver-extended',
    name: 'Extended Year - 2026 + 2027',
    dateRange: 'April 2026 to September 2027',
    price: 42,
    note: 'Becoming an adult member will allow you to register for events with your Girl Scout and volunteer with troop/group activities.',
  },
  {
    id: NO_MEMBERSHIP_ID,
    name: 'No membership at this time',
    dateRange: '',
    price: 0,
  },
]


export function CaregiverMembership() {
  const navigate = useNavigate()
  const { data, update } = useRegistration()
  const [selected, setSelected] = useState<string>(() =>
    data.caregiverMembershipProduct ? data.caregiverMembershipProduct.split(',').filter(Boolean)[0] ?? '' : ''
  )
  const [error, setError] = useState('')

  const select = (id: string) => {
    setError('')
    setSelected(id)
  }

  const selectedProduct = CAREGIVER_PRODUCTS.find(p => p.id === selected)
  const isPaid = selectedProduct && selectedProduct.id !== NO_MEMBERSHIP_ID
  const grandTotal = isPaid ? selectedProduct.price : 0

  const handleContinue = () => {
    if (!selected) {
      setError('Please select a membership to continue.')
      return
    }
    update({
      caregiverMembershipProduct: selected,
      caregiverMembershipPrice: grandTotal,
    })
    navigate('/cart')
  }

  const activeNote = isPaid ? selectedProduct.note : undefined

  return (
    <div className="screen">
      <TopNav />
      <ProgressBar current={9} total={9} />

      <div className="screen-body">
        <div className="screen-content">
          <BackButton onClick={() => navigate('/membership')} />

          <div className="heading-group">
            <div className="heading">
              <p className="eyebrow">Question 9 of 9</p>
              <h1 className="screen-title">Would you like to add a membership for yourself?</h1>
            </div>
            <p className="screen-subtitle">Please select a membership.</p>
          </div>

          <div className="membership-list">
            {CAREGIVER_PRODUCTS.map(product => (
              <button
                key={product.id}
                type="button"
                className={`membership-card ${selected === product.id ? 'membership-card--selected' : ''}`}
                onClick={() => select(product.id)}
              >
                <div className="membership-card-check">
                  <div className="membership-radio">
                    {selected === product.id && <div className="membership-radio-dot" />}
                  </div>
                </div>
                <div className="membership-card-body">
                  <span className="membership-name">{product.name}</span>
                  {product.dateRange && (
                    <span className="membership-date-range">{product.dateRange}</span>
                  )}
                </div>
                {product.price > 0 && (
                  <div className="membership-card-price">
                    <span className="membership-price-currency">$</span>{product.price}
                  </div>
                )}
              </button>
            ))}

            {activeNote && (
              <p className="membership-note">{activeNote}</p>
            )}

            {selectedProduct && (
              <div className="membership-cost-summary">
                <p className="membership-cost-title">How much will this cost?</p>
                <div className="membership-cost-rows">
                  <div className="membership-cost-row">
                    <span>{selectedProduct.name}</span>
                    <span><span className="membership-price-currency">$</span>{selectedProduct.price}</span>
                  </div>
                </div>
                <div className="membership-cost-divider" />
                <div className="membership-cost-total">
                  <span>Total amount:</span>
                  <span className="membership-total-amount">
                    <span className="membership-price-currency membership-price-currency--large">$</span>{grandTotal}
                  </span>
                </div>
              </div>
            )}

            {error && <p className="membership-error">{error}</p>}
          </div>

          <Button onClick={handleContinue} icon={selected === NO_MEMBERSHIP_ID ? undefined : <PlusIcon />}>
            {selected === NO_MEMBERSHIP_ID ? 'Continue' : 'Add to cart'}
          </Button>
        </div>
        <Footer />
      </div>
    </div>
  )
}



function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 2v12M2 8h12" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}
