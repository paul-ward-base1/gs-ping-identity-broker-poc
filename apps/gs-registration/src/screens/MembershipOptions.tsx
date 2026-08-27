import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TopNav } from '../components/TopNav'
import { Footer } from '../components/Footer'
import { Button, BackButton } from '../components/Button'
import { ProgressBar } from '../components/ProgressBar'
import { useRegistration } from '../context/RegistrationContext'
import './MembershipOptions.css'

interface MembershipProduct {
  id: string
  name: string
  dateRange: string
  price: number
  note?: string
}

const MOCK_PRODUCTS: MembershipProduct[] = [
  {
    id: 'annual-girl',
    name: 'Annual Membership - 2027',
    dateRange: 'October 2026 to September 2027',
    price: 65,
  },
  {
    id: 'annual-adult',
    name: 'Extended Year - 2026 + 2027',
    dateRange: 'April 2026 to September 2027',
    price: 91,
  },
]

const COUNCIL_FEE = 15

export function MembershipOptions() {
  const navigate = useNavigate()
  const { data, meta, update } = useRegistration()
  const [selected, setSelected] = useState<string>(() =>
    data.membershipProduct ? data.membershipProduct.split(',').filter(Boolean)[0] ?? '' : ''
  )
  const [error, setError] = useState('')

  const select = (id: string) => {
    setError('')
    setSelected(id)
  }

  const selectedProduct = MOCK_PRODUCTS.find(p => p.id === selected)
  const grandTotal = selectedProduct ? selectedProduct.price + COUNCIL_FEE : 0

  const handleContinue = () => {
    if (!selected) {
      setError('Please select a membership to continue.')
      return
    }
    update({
      membershipProduct: selected,
      membershipPrice: grandTotal,
      councilName: 'Girl Scouts of XYZ Council',
    })
    navigate(meta.caregiverMembershipRoute === '/membership' ? '/cart' : '/caregiver-membership')
  }

  const activeNote = selectedProduct?.note

  return (
    <div className="screen">
      <TopNav />
      <ProgressBar current={8} total={9} />

      <div className="screen-body">
        <div className="screen-content">
          <BackButton onClick={() => navigate('/register/girls-race-ethnicity')} />

          <div className="heading-group">
            <div className="heading">
              <p className="eyebrow">Question 8 of 9</p>
              <h1 className="screen-title">Choose a membership that is right for your Girl Scout!</h1>
            </div>
            <p className="screen-subtitle">Please select a membership.</p>
          </div>

          <div className="membership-list">
            {MOCK_PRODUCTS.map(product => (
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
                  <span className="membership-date-range">{product.dateRange}</span>
                </div>
                <div className="membership-card-price">
                  <span className="membership-price-currency">$</span>{product.price}
                </div>
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
                  <div className="membership-cost-row">
                    <span className="membership-cost-fee-label">
                      Council Service Fees
                      <InfoIcon />
                    </span>
                    <span><span className="membership-price-currency">$</span>{COUNCIL_FEE}</span>
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

          <Button onClick={handleContinue} icon={<PlusIcon />}>
            Add to cart
          </Button>
        </div>
        <Footer />
      </div>
    </div>
  )
}

function InfoIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="7" cy="7" r="6" stroke="#646669" strokeWidth="1.2" fill="none" />
      <path d="M7 6.5v4" stroke="#646669" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="7" cy="4.5" r="0.75" fill="#646669" />
    </svg>
  )
}


function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 2v12M2 8h12" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}
