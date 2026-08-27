import { useNavigate, useParams } from 'react-router-dom'
import { TopNav } from '../../components/TopNav'
import { Footer } from '../../components/Footer'
import { Button, BackButton, ArrowRightIcon } from '../../components/Button'
import { useRegistration } from '../../context/RegistrationContext'
import { MOCK_EVENTS } from './mockEvents'
import './EventDetail.css'

export function EventDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { update } = useRegistration()

  const event = MOCK_EVENTS.find(e => e.id === id)

  if (!event) {
    return (
      <div className="screen">
        <TopNav />
        <div className="screen-body">
          <div className="screen-content">
            <BackButton onClick={() => navigate('/register-event/results')} />
            <p style={{ color: 'var(--color-text-muted)', marginTop: 'var(--space-xl)' }}>Event not found.</p>
          </div>
        </div>
      </div>
    )
  }

  const handleRegister = () => {
    update({
      selectedEventId: event.id,
      selectedEventName: event.name,
      selectedEventDate: event.date,
      selectedEventVenue: event.venue,
      selectedEventCity: event.city,
      selectedEventPrice: event.price,
      selectedEventCouncil: event.council,
    })
    navigate('/register-event/checkout')
  }

  const handleWaitlist = () => {
    update({
      selectedEventId: event.id,
      selectedEventName: event.name,
      selectedEventDate: event.date,
      selectedEventVenue: event.venue,
      selectedEventCity: event.city,
      selectedEventPrice: event.price,
      selectedEventCouncil: event.council,
    })
    navigate('/register-event/waitlist')
  }

  const isFullWaitlist = event.status === 'full-waitlist'
  const isPartialWaitlist = event.status === 'partial-waitlist'

  return (
    <div className="screen">
      <TopNav />

      <div className="screen-body">
        {/* Hero band */}
        <div className="event-detail-hero">
          <div className="event-detail-hero-type">{event.type}</div>
          <h1 className="event-detail-title">{event.name}</h1>
          <p className="event-detail-council">{event.council}</p>
        </div>

        <div className="event-detail-content">
          <BackButton onClick={() => navigate('/register-event/results')} />

          {/* Availability banner */}
          {isFullWaitlist && (
            <div className="event-availability-banner event-availability-banner--full">
              <AlertIcon />
              <span>This event is fully booked — you can join the waitlist.</span>
            </div>
          )}
          {isPartialWaitlist && (
            <div className="event-availability-banner event-availability-banner--partial">
              <ClockIcon />
              <span>Only {event.spotsLeft} spot{event.spotsLeft !== 1 ? 's' : ''} remaining — register soon!</span>
            </div>
          )}

          {/* Key details */}
          <div className="event-detail-facts">
            <DetailRow icon={<CalendarIcon />} label="Date" value={event.date} />
            <DetailRow icon={<ClockIcon />} label="Time" value={event.time} />
            <DetailRow icon={<LocationIcon />} label="Location" value={`${event.venue}${event.city ? ` · ${event.city}` : ''}`} />
            <DetailRow
              icon={<TagIcon />}
              label="Price"
              value={event.price === 0 ? 'Free' : `$${event.price} per person`}
              highlight={event.price === 0}
            />
          </div>

          {/* Program levels */}
          <div className="event-detail-section">
            <div className="event-detail-section-label">Program levels</div>
            <div className="event-detail-grades">
              {event.grades.map(g => (
                <span key={g} className="event-detail-grade">{g}</span>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="event-detail-section">
            <div className="event-detail-section-label">About this event</div>
            <p className="event-detail-desc">{event.description}</p>
          </div>

          {/* Highlights */}
          {event.highlights.length > 0 && (
            <div className="event-detail-section">
              <div className="event-detail-section-label">What's included</div>
              <ul className="event-detail-list">
                {event.highlights.map(h => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            </div>
          )}

          {/* What to bring */}
          {event.whatToBring.length > 0 && (
            <div className="event-detail-section">
              <div className="event-detail-section-label">What to bring</div>
              <ul className="event-detail-list">
                {event.whatToBring.map(w => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Tags */}
          <div className="event-detail-tags">
            {event.tags.map(t => (
              <span key={t} className="event-detail-tag">{t}</span>
            ))}
          </div>

          {/* CTA */}
          <div className="event-detail-cta">
            {isFullWaitlist ? (
              <Button onClick={handleWaitlist} icon={<ArrowRightIcon />}>
                Join Waitlist
              </Button>
            ) : (
              <Button onClick={handleRegister} icon={<ArrowRightIcon />}>
                Register{event.price > 0 ? ` — $${event.price}` : ' — Free'}
              </Button>
            )}
            {isPartialWaitlist && (
              <button type="button" className="event-waitlist-secondary" onClick={handleWaitlist}>
                Or join the waitlist
              </button>
            )}
          </div>
        </div>

        <Footer />
      </div>
    </div>
  )
}

function DetailRow({ icon, label, value, highlight }: {
  icon: React.ReactNode
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className="event-detail-fact">
      <div className="event-detail-fact-icon">{icon}</div>
      <div className="event-detail-fact-body">
        <span className="event-detail-fact-label">{label}</span>
        <span className={`event-detail-fact-value ${highlight ? 'event-detail-fact-value--green' : ''}`}>{value}</span>
      </div>
    </div>
  )
}

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="3" width="14" height="12" rx="2" stroke="#646669" strokeWidth="1.5" />
      <path d="M5 1V5M11 1V5M1 7H15" stroke="#646669" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7" stroke="#646669" strokeWidth="1.5" />
      <path d="M8 4.5V8L10.5 10.5" stroke="#646669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function LocationIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 1C5.79 1 4 2.79 4 5c0 3.75 4 10 4 10s4-6.25 4-10c0-2.21-1.79-4-4-4Z" stroke="#646669" strokeWidth="1.5" />
      <circle cx="8" cy="5" r="1.5" stroke="#646669" strokeWidth="1.5" />
    </svg>
  )
}

function TagIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 2H7.5L14 8.5L8.5 14L2 7.5V2Z" stroke="#646669" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="5" cy="5" r="1" fill="#646669" />
    </svg>
  )
}

function AlertIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 5V9M8 11.5V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
