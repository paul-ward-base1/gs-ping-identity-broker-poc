import { useNavigate } from 'react-router-dom'
import { TopNav } from '../../components/TopNav'
import { Footer } from '../../components/Footer'
import { Button, ArrowRightIcon } from '../../components/Button'
import './EventLanding.css'

export function EventLanding() {
  const navigate = useNavigate()

  return (
    <div className="screen">
      <TopNav />

      <div className="screen-body">
        <div className="event-landing-hero">
          <div className="event-landing-hero-img" aria-hidden="true">
            <EventHeroIllustration />
          </div>
          <div className="event-landing-hero-overlay" />
          <div className="event-landing-hero-content">
            <p className="event-landing-eyebrow">Girl Scouts Events</p>
            <h1 className="event-landing-title">Register for an Event</h1>
          </div>
        </div>

        <div className="event-landing-body">
          <div className="event-landing-intro">
            <h2 className="event-landing-intro-title">Try Girl Scouts — no membership required!</h2>
            <p className="event-landing-intro-desc">
              Registering for an event is a great way to try Girl Scouts before joining. Browse camps,
              workshops, day events, and more near you.
            </p>
          </div>

          <div className="event-landing-features">
            <div className="event-feature">
              <div className="event-feature-icon">🏕️</div>
              <div>
                <div className="event-feature-label">Camps & Outdoors</div>
                <p className="event-feature-desc">Day camps, overnight experiences, and nature adventures</p>
              </div>
            </div>
            <div className="event-feature">
              <div className="event-feature-icon">🔬</div>
              <div>
                <div className="event-feature-label">Workshops & STEM</div>
                <p className="event-feature-desc">Science, coding, arts, and skill-building programs</p>
              </div>
            </div>
            <div className="event-feature">
              <div className="event-feature-icon">🌐</div>
              <div>
                <div className="event-feature-label">Virtual Events</div>
                <p className="event-feature-desc">Participate from anywhere with online programming</p>
              </div>
            </div>
          </div>

          <Button onClick={() => navigate('/register-event/location')} icon={<ArrowRightIcon />}>
            Find an event
          </Button>

          <p className="event-landing-signin">
            Already registered?{' '}
            <button type="button" className="event-landing-link" onClick={() => navigate('/checkout-as')}>
              Sign in to manage your events
            </button>
          </p>
        </div>

        <Footer />
      </div>
    </div>
  )
}

function EventHeroIllustration() {
  return (
    <svg width="402" height="220" viewBox="0 0 402 220" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="402" height="220" fill="url(#event-hero-grad)" />
      <defs>
        <linearGradient id="event-hero-grad" x1="0" y1="0" x2="402" y2="220" gradientUnits="userSpaceOnUse">
          <stop stopColor="#005640" />
          <stop offset="0.5" stopColor="#007a58" />
          <stop offset="1" stopColor="#00B451" />
        </linearGradient>
      </defs>
      {/* Decorative circles */}
      <circle cx="340" cy="40" r="60" fill="rgba(255,255,255,0.06)" />
      <circle cx="380" cy="180" r="40" fill="rgba(255,255,255,0.04)" />
      <circle cx="60" cy="190" r="50" fill="rgba(255,255,255,0.05)" />
      {/* Star/badge motif */}
      <path d="M201 55L208 76H231L213 89L220 110L201 97L182 110L189 89L171 76H194L201 55Z" fill="rgba(255,255,255,0.15)" />
      {/* Trefoil-inspired shapes */}
      <circle cx="140" cy="100" r="20" fill="rgba(255,255,255,0.08)" />
      <circle cx="260" cy="140" r="15" fill="rgba(255,255,255,0.06)" />
    </svg>
  )
}
