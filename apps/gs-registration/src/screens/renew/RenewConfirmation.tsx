import { useNavigate } from 'react-router-dom'
import { TopNav } from '../../components/TopNav'
import { Footer } from '../../components/Footer'
import { Button } from '../../components/Button'
import { useRegistration } from '../../context/RegistrationContext'
import { MOCK_MEMBER, RENEW_PRODUCTS } from './mockMember'
import './RenewConfirmation.css'

function generateOrderNum() {
  return 'RNW-' + Math.floor(100000 + Math.random() * 900000)
}

const ORDER_NUM = generateOrderNum()
const COUNCIL_FEE = 5

export function RenewConfirmation() {
  const navigate = useNavigate()
  const { data, reset } = useRegistration()

  const product = RENEW_PRODUCTS.find(p => p.id === data.renewProduct) ?? RENEW_PRODUCTS[0]
  const selectedMem = MOCK_MEMBER.memberships.find(
    m => data.renewSelectedMemberships.includes(m.id)
  )
  const total = product.price + COUNCIL_FEE

  const handleDone = () => {
    reset()
    navigate('/')
  }

  return (
    <div className="screen">
      <TopNav />

      <div className="screen-body">
        <div className="screen-content">
          {/* Success header */}
          <div className="renew-conf-success">
            <div className="renew-conf-check">
              <CheckIcon />
            </div>
            <h1 className="screen-title">Membership renewed!</h1>
            <p className="screen-subtitle">
              Welcome back to Girl Scouts,{' '}
              {selectedMem?.girlScout.firstName ?? MOCK_MEMBER.firstName}!
            </p>
          </div>

          {/* Purple membership card */}
          <div className="renew-conf-card">
            <div className="renew-conf-card-header">
              <div className="renew-conf-card-logo">
                <TrefoilIcon />
                <span>Girl Scouts</span>
              </div>
              <div className="renew-conf-card-badge">Active</div>
            </div>
            <div className="renew-conf-card-body">
              <div className="renew-conf-card-name">
                {selectedMem
                  ? `${selectedMem.girlScout.firstName} ${selectedMem.girlScout.lastName}`
                  : `${MOCK_MEMBER.firstName} ${MOCK_MEMBER.lastName}`}
              </div>
              <div className="renew-conf-card-type">{product.name}</div>
            </div>
            <div className="renew-conf-card-footer">
              <div className="renew-conf-card-field">
                <span className="renew-conf-card-field-label">Member ID</span>
                <span>{selectedMem?.memberId ?? 'GS-78934521'}</span>
              </div>
              <div className="renew-conf-card-field">
                <span className="renew-conf-card-field-label">Expires</span>
                <span>{product.newExpiry}</span>
              </div>
            </div>
          </div>

          {/* Order summary */}
          <div className="renew-conf-summary">
            <div className="renew-conf-summary-title">Order details</div>
            <div className="renew-conf-row">
              <span>Order number</span>
              <span className="renew-conf-value">{ORDER_NUM}</span>
            </div>
            <div className="renew-conf-row">
              <span>Membership</span>
              <span className="renew-conf-value">{product.name}</span>
            </div>
            <div className="renew-conf-row">
              <span>Valid until</span>
              <span className="renew-conf-value">{product.newExpiry}</span>
            </div>
            <div className="renew-conf-row renew-conf-row--total">
              <span>Amount paid</span>
              <span>${total}</span>
            </div>
          </div>

          {/* Email receipt */}
          <div className="renew-conf-receipt">
            <EmailIcon />
            <p>Receipt sent to <strong>{MOCK_MEMBER.email}</strong></p>
          </div>

          {/* What happens next */}
          <div className="renew-conf-next">
            <div className="renew-conf-next-title">What happens next</div>
            <div className="renew-conf-steps">
              <div className="renew-conf-step">
                <div className="renew-conf-step-num">1</div>
                <div>
                  <div className="renew-conf-step-heading">Check your email</div>
                  <p className="renew-conf-step-desc">Your renewal confirmation and new membership card have been sent.</p>
                </div>
              </div>
              <div className="renew-conf-step">
                <div className="renew-conf-step-num">2</div>
                <div>
                  <div className="renew-conf-step-heading">Troop activities resume</div>
                  <p className="renew-conf-step-desc">Your Girl Scout can now participate in all troop and council activities.</p>
                </div>
              </div>
              <div className="renew-conf-step">
                <div className="renew-conf-step-num">3</div>
                <div>
                  <div className="renew-conf-step-heading">Access your digital card</div>
                  <p className="renew-conf-step-desc">Sign in to your account any time to view your membership card and details.</p>
                </div>
              </div>
            </div>
          </div>

          <Button onClick={handleDone}>
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
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path d="M5 14L11 20L23 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function TrefoilIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M10 2L12.5 8.5H19.5L14 12.5L16.5 19L10 15L3.5 19L6 12.5L0.5 8.5H7.5L10 2Z" fill="rgba(255,255,255,0.9)" />
    </svg>
  )
}

function EmailIcon() {
  return (
    <svg width="18" height="14" viewBox="0 0 18 14" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
      <rect x="1" y="1" width="16" height="12" rx="2" stroke="#005640" strokeWidth="1.5" />
      <path d="M1 3L9 8.5L17 3" stroke="#005640" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
