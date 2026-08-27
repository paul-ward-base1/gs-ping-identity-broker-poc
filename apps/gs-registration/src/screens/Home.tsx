import { Link } from 'react-router-dom'
import { TopNav } from '../components/TopNav'
import { Footer } from '../components/Footer'
import './Home.css'

interface Journey {
  title: string
  description: string
  meta: string[]
  to: string
  available: boolean
}

const JOURNEYS: Journey[] = [
  {
    title: 'Become a Girl Scout',
    description: 'Register your Girl Scout now and we\'ll help match her with a troop in your area.',
    meta: ['9 questions', 'Troop matched later'],
    to: '/register',
    available: true,
  },
  {
    title: 'Join a Troop',
    description: 'Have an invitation code? Join a specific troop directly via a physical or digital invite.',
    meta: ['Invitation code', 'Find something that works'],
    to: '/join-troop',
    available: true,
  },
  {
    title: 'Register for an Event',
    description: 'Not yet a member? Register for a Girl Scouts event as a non-member attendee.',
    meta: ['No membership required', 'Event discovery'],
    to: '/register-event',
    available: false,
  },
  {
    title: 'Renew Membership',
    description: 'Already a Girl Scout? Renew your annual membership quickly and keep the adventure going.',
    meta: ['Existing members'],
    to: '/renew',
    available: false,
  },
]

export function Home() {
  return (
    <div className="screen">
      <TopNav />

      <div className="screen-body">
        <div className="home-hero">
          <div className="home-hero-overlay" />
          <div className="home-hero-content">
            <p className="home-hero-eyebrow">Girl Scouts Her Way Illustrative Homepage</p>
            <h1 className="home-hero-title">Start your Girl Scout journey today</h1>
          </div>
        </div>

        <div className="home-content">
          <div className="home-section-label">Choose your path</div>

          <div className="journey-list">
            {JOURNEYS.map(journey => (
              <JourneyCard key={journey.to} journey={journey} />
            ))}
          </div>

          <div className="home-info">
            <h3 className="home-info-title">What you'll need</h3>
            <ul className="home-info-list">
              <li>Girl Scout's name and grade</li>
              <li>School name</li>
              <li>Caregiver's name, email, address &amp; phone</li>
              <li>Payment method</li>
            </ul>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  )
}

function JourneyCard({ journey }: { journey: Journey }) {
  const inner = (
    <>
      <div className="journey-card-body">
        <div className="journey-card-top">
          <h2 className="journey-card-title">{journey.title}</h2>
          {!journey.available && (
            <span className="journey-badge journey-badge--coming-soon">Coming soon</span>
          )}
        </div>
        <p className="journey-card-desc">{journey.description}</p>
        <div className="journey-meta">
          {journey.meta.map((m, i) => (
            <span key={i} className="journey-meta-item">{m}</span>
          ))}
        </div>
      </div>
      <div className="journey-card-cta">
        <span className="journey-cta-label">
          {journey.available ? 'Start' : 'Coming soon'}
        </span>
        <ArrowIcon available={journey.available} />
      </div>
    </>
  )

  if (!journey.available) {
    return <div className="journey-card journey-card--disabled">{inner}</div>
  }

  return (
    <Link to={journey.to} className="journey-card">
      {inner}
    </Link>
  )
}

function ArrowIcon({ available }: { available: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="9" stroke={available ? '#005640' : '#adb5bd'} strokeWidth="1.5" />
      <path
        d="M7.5 10H12.5M10.5 7.5L13 10L10.5 12.5"
        stroke={available ? '#005640' : '#adb5bd'}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
