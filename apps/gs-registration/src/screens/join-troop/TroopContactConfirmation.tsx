import { TopNav } from '../../components/TopNav'
import { Footer } from '../../components/Footer'
import '../Confirmation.css'
import './TroopContactConfirmation.css'

export function TroopContactConfirmation() {
  return (
    <div className="screen">
      <TopNav />

      <div className="screen-body">
        <div className="screen-content">

          {/* Banner */}
          <div className="conf-hero lead-conf-hero">
            <div className="conf-hero-content">
              <h1 className="conf-title">Contact request received</h1>
              <p className="conf-ref-label">Your case number</p>
              <p className="conf-ref-number">12345678</p>
            </div>
            <DecoArc />
          </div>

          {/* Confirmation sent */}
          <p className="conf-email-sent">We have sent you a confirmation email.</p>

          {/* What happens next */}
          <h2 className="conf-next-title">What happens next</h2>

          <ul className="lead-conf-bullets">
            <li>A Girl Scouts staff member will contact you within 3-5 working days.</li>
            <li>Check your email (and spam folder) for details.</li>
            <li>
              In the meantime, you can{' '}
              <a
                href="http://mygs.girlscouts.org"
                target="_blank"
                rel="noopener noreferrer"
                className="lead-conf-link"
              >
                search for Troops in your area
              </a>
              .
            </li>
          </ul>

        </div>
        <Footer />
      </div>
    </div>
  )
}

function DecoArc() {
  return (
    <svg className="conf-hero-deco" width="120" height="120" viewBox="0 0 120 120" fill="none">
      <circle cx="90" cy="90" r="50" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeDasharray="6 6" />
      <circle cx="90" cy="90" r="30" stroke="rgba(255,255,255,0.15)" strokeWidth="2" strokeDasharray="6 6" />
    </svg>
  )
}
