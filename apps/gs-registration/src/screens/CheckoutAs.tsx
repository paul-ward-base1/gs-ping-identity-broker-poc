import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TopNav } from '../components/TopNav'
import { Footer } from '../components/Footer'
import { ArrowRightIcon, BackButton } from '../components/Button'
import './CheckoutAs.css'

export function CheckoutAs() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="screen">
      <TopNav cartCount={2} />

      <div className="screen-body">
        <div className="screen-content">
          <BackButton onClick={() => navigate('/cart')} />

          {/* Guest checkout section */}
          <div className="checkout-section">
            <div className="heading">
              <h1 className="screen-title">Guest checkout</h1>
              <p className="screen-subtitle">You can create an account later.</p>
            </div>
            <button className="checkout-primary-btn" onClick={() => navigate('/payment')}>
              Continue as guest <ArrowRightIcon />
            </button>
          </div>

          <div className="checkout-rule" />

          {/* Returning customers section */}
          <div className="checkout-section">
            <div className="heading">
              <h2 className="screen-title">Returning customers</h2>
              <p className="screen-subtitle">Log into your account.</p>
            </div>

            <div className="fields">
              <div className="checkout-field">
                <input
                  className="checkout-input"
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                  inputMode="email"
                />
              </div>
              <div className="checkout-field">
                <input
                  className="checkout-input"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="checkout-password-toggle"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <button className="checkout-forgot">Forgot password?</button>

            <button className="checkout-login-btn" onClick={() => navigate('/payment')}>
              Log in <ArrowRightIcon />
            </button>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  )
}

function EyeIcon() {
  return (
    <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
      <path d="M1 7C1 7 4 1 10 1s9 6 9 6-3 6-9 6S1 7 1 7z" stroke="#646669" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
      <circle cx="10" cy="7" r="2.5" stroke="#646669" strokeWidth="1.4" fill="none"/>
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg width="20" height="16" viewBox="0 0 20 16" fill="none">
      <path d="M1 1l18 14M8.5 3.2C9 3.07 9.49 3 10 3c6 0 9 5 9 5a16.6 16.6 0 0 1-2.38 3.08M5.73 4.73A16.6 16.6 0 0 0 1 8s3 5 9 5a9.16 9.16 0 0 0 4.27-1.07" stroke="#646669" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
      <path d="M7.6 8.6a2.5 2.5 0 0 0 3.8 2.8" stroke="#646669" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
    </svg>
  )
}
