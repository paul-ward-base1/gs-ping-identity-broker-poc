import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TopNav } from '../../components/TopNav'
import { Footer } from '../../components/Footer'
import { Button, BackButton, ArrowRightIcon } from '../../components/Button'
import { useRegistration } from '../../context/RegistrationContext'
import { MOCK_MEMBER, RENEW_PRODUCTS } from './mockMember'
import './RenewMembership.css'

export function RenewMembership() {
  const navigate = useNavigate()
  const { data, update } = useRegistration()
  const [selected, setSelected] = useState(data.renewProduct || RENEW_PRODUCTS[0].id)

  const selectedMembership = MOCK_MEMBER.memberships.find(
    m => data.renewSelectedMemberships.includes(m.id)
  )

  const handleContinue = () => {
    const product = RENEW_PRODUCTS.find(p => p.id === selected)!
    update({
      renewProduct: product.id,
      renewPrice: product.price,
      renewNewExpiry: product.newExpiry,
    })
    navigate('/renew/cart')
  }

  return (
    <div className="screen">
      <TopNav />

      <div className="screen-body">
        <div className="screen-content">
          <BackButton onClick={() => navigate('/renew/select')} />

          <div className="heading-group">
            <div className="heading">
              <h1 className="screen-title">Which membership would you like?</h1>
            </div>
            {selectedMembership && (
              <div className="renew-member-chip">
                <GirlScoutIcon />
                <span>
                  {selectedMembership.girlScout.firstName} {selectedMembership.girlScout.lastName}
                </span>
                <span className="renew-member-chip-sep">·</span>
                <span>{MOCK_MEMBER.council}</span>
              </div>
            )}
          </div>

          <div className="renew-product-list">
            {RENEW_PRODUCTS.map(product => (
              <button
                key={product.id}
                type="button"
                className={`renew-product-card ${selected === product.id ? 'renew-product-card--selected' : ''}`}
                onClick={() => setSelected(product.id)}
              >
                <div className="renew-product-header">
                  <div className="renew-product-radio">
                    <div className="renew-product-radio-dot" />
                  </div>
                  {product.isRecommended && (
                    <span className="renew-product-badge">Recommended</span>
                  )}
                </div>
                <div className="renew-product-body">
                  <div className="renew-product-name">{product.name}</div>
                  <div className="renew-product-price">
                    ${product.price}
                    <span>/{product.duration}</span>
                  </div>
                  <p className="renew-product-desc">{product.description}</p>
                  <div className="renew-product-expiry">
                    New expiry: <strong>{product.newExpiry}</strong>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <Button onClick={handleContinue} icon={<ArrowRightIcon />}>
            Continue
          </Button>
        </div>

        <Footer />
      </div>
    </div>
  )
}

function GirlScoutIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
      <path d="M10 2L12.5 8.5H19.5L14 12.5L16.5 19L10 15L3.5 19L6 12.5L0.5 8.5H7.5L10 2Z" fill="#005640" />
    </svg>
  )
}
