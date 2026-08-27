import { useNavigate } from 'react-router-dom'
import { TopNav } from '../../components/TopNav'
import { Footer } from '../../components/Footer'
import { Button } from '../../components/Button'
import { useRegistration } from '../../context/RegistrationContext'
import './EventWaitlistConfirmation.css'

export function EventWaitlistConfirmation() {
  const navigate = useNavigate()
  const { data, reset } = useRegistration()

  const handleDone = () => {
    reset()
    navigate('/')
  }

  return (
    <div className="screen">
      <TopNav />

      <div className="screen-body">
        <div className="screen-content">
          <div className="waitlist-conf-hero">
            <div className="waitlist-conf-icon">
              <WaitlistCheckIcon />
            </div>
            <h1 className="waitlist-conf-title">
              You've joined the{' '}
              {data.selectedEventName ? (
                <>
                  <span className="waitlist-conf-event-name">{data.selectedEventName}</span>{' '}
                </>
              ) : null}
              waitlist!
            </h1>
            <p className="waitlist-conf-subtitle">
              We'll let you know as soon as a spot opens up.
            </p>
          </div>

          {data.caregiverEmail && (
            <div className="waitlist-conf-email">
              <EmailIcon />
              <p>Notifications will be sent to <strong>{data.caregiverEmail}</strong></p>
            </div>
          )}

          <div className="waitlist-conf-what-next">
            <div className="waitlist-conf-what-label">What happens next</div>
            <div className="waitlist-conf-steps">
              <div className="waitlist-conf-step">
                <div className="waitlist-conf-step-num">1</div>
                <div>
                  <div className="waitlist-conf-step-heading">We'll monitor availability</div>
                  <p className="waitlist-conf-step-desc">
                    Our team watches for cancellations and opens spots by waitlist order.
                  </p>
                </div>
              </div>
              <div className="waitlist-conf-step">
                <div className="waitlist-conf-step-num">2</div>
                <div>
                  <div className="waitlist-conf-step-heading">You'll get an email</div>
                  <p className="waitlist-conf-step-desc">
                    If a spot opens, we'll email you right away. You'll have 48 hours to claim it.
                  </p>
                </div>
              </div>
              <div className="waitlist-conf-step">
                <div className="waitlist-conf-step-num">3</div>
                <div>
                  <div className="waitlist-conf-step-heading">Complete your registration</div>
                  <p className="waitlist-conf-step-desc">
                    Click the link in the email to register and pay — simple and quick.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="waitlist-conf-explore">
            <div className="waitlist-conf-explore-text">
              In the meantime, explore other events near you.
            </div>
            <Button variant="outline" onClick={() => navigate('/register-event/results')}>
              Browse more events
            </Button>
          </div>

          <button type="button" className="waitlist-conf-home-link" onClick={handleDone}>
            Back to home
          </button>
        </div>

        <Footer />
      </div>
    </div>
  )
}

function WaitlistCheckIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path d="M6 16L13 23L26 9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function EmailIcon() {
  return (
    <svg width="18" height="14" viewBox="0 0 18 14" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
      <rect x="1" y="1" width="16" height="12" rx="2" stroke="#92400e" strokeWidth="1.5" />
      <path d="M1 3L9 8.5L17 3" stroke="#92400e" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
