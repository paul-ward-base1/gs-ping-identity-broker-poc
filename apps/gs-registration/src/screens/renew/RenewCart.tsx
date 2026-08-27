import { useNavigate } from 'react-router-dom'
import { TopNav } from '../../components/TopNav'
import { Footer } from '../../components/Footer'
import { Button, BackButton, ArrowRightIcon } from '../../components/Button'
import { useRegistration } from '../../context/RegistrationContext'
import { MOCK_MEMBER, RENEW_PRODUCTS } from './mockMember'
import './RenewCart.css'

const COUNCIL_FEE = 5

export function RenewCart() {
  const navigate = useNavigate()
  const { data } = useRegistration()

  const product = RENEW_PRODUCTS.find(p => p.id === data.renewProduct) ?? RENEW_PRODUCTS[0]
  const selectedMem = MOCK_MEMBER.memberships.find(m => data.renewSelectedMemberships.includes(m.id))
  const subtotal = product.price + COUNCIL_FEE

  return (
    <div className="screen">
      <TopNav />

      <div className="screen-body">
        <div className="screen-content">
          <BackButton onClick={() => navigate('/renew/membership')} />

          <div className="heading-group">
            <div className="heading">
              <h1 className="screen-title">Shopping cart</h1>
            </div>
          </div>

          <div className="renew-cart-items">
            {/* Main line item */}
            <div className="renew-cart-item">
              <div className="renew-cart-item-icon">
                <MembershipIcon />
              </div>
              <div className="renew-cart-item-body">
                <div className="renew-cart-item-name">{product.name}</div>
                {selectedMem && (
                  <div className="renew-cart-item-member">
                    {selectedMem.girlScout.firstName} {selectedMem.girlScout.lastName}
                  </div>
                )}
                <div className="renew-cart-item-duration">{product.duration} · Renews to {product.newExpiry}</div>
              </div>
              <div className="renew-cart-item-price">${product.price}</div>
            </div>

            {/* Council fee */}
            <div className="renew-cart-item renew-cart-item--fee">
              <div className="renew-cart-item-body">
                <div className="renew-cart-item-name">Council support fee</div>
                <div className="renew-cart-item-duration">{MOCK_MEMBER.council}</div>
              </div>
              <div className="renew-cart-item-price">${COUNCIL_FEE}</div>
            </div>
          </div>

          {/* Order total */}
          <div className="renew-cart-summary">
            <div className="renew-cart-row">
              <span>Subtotal</span>
              <span>${product.price}</span>
            </div>
            <div className="renew-cart-row">
              <span>Council fee</span>
              <span>${COUNCIL_FEE}</span>
            </div>
            <div className="renew-cart-row renew-cart-row--total">
              <span>Total</span>
              <span>${subtotal}</span>
            </div>
          </div>

          <Button onClick={() => navigate('/renew/payment')} icon={<ArrowRightIcon />}>
            Proceed to payment
          </Button>
        </div>

        <Footer />
      </div>
    </div>
  )
}

function MembershipIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="5" width="20" height="14" rx="2" stroke="#5C1F8B" strokeWidth="1.5" />
      <path d="M2 9H22" stroke="#5C1F8B" strokeWidth="1.5" />
      <path d="M6 14H10M14 14H18" stroke="#5C1F8B" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
