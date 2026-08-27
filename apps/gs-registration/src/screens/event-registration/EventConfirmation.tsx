import { useNavigate } from 'react-router-dom'
import { TopNav } from '../../components/TopNav'
import { Footer } from '../../components/Footer'
import { Button } from '../../components/Button'
import { useRegistration } from '../../context/RegistrationContext'
import './EventConfirmation.css'

function generateOrderNum() {
  return 'EVT-' + Math.floor(100000 + Math.random() * 900000)
}

const ORDER_NUM = generateOrderNum()

export function EventConfirmation() {
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
          <div className="event-conf-hero">
            <div className="event-conf-icon">
              <TicketCheckIcon />
            </div>
            <h1 className="screen-title">Event purchase complete!</h1>
            <p className="screen-subtitle">
              You're registered for{' '}
              <strong>{data.selectedEventName || 'your event'}</strong>.
            </p>
          </div>

          <div className="event-conf-summary">
            <div className="event-conf-summary-title">Registration details</div>
            <div className="event-conf-row">
              <span>Order number</span>
              <span className="event-conf-value">{ORDER_NUM}</span>
            </div>
            <div className="event-conf-row">
              <span>Event</span>
              <span className="event-conf-value">{data.selectedEventName}</span>
            </div>
            {data.selectedEventDate && (
              <div className="event-conf-row">
                <span>Date</span>
                <span className="event-conf-value">{data.selectedEventDate}</span>
              </div>
            )}
            {data.selectedEventVenue && (
              <div className="event-conf-row">
                <span>Location</span>
                <span className="event-conf-value">{data.selectedEventVenue}{data.selectedEventCity ? ` · ${data.selectedEventCity}` : ''}</span>
              </div>
            )}
            <div className="event-conf-row event-conf-row--total">
              <span>Amount paid</span>
              <span>{data.selectedEventPrice === 0 ? 'Free' : `$${data.selectedEventPrice}`}</span>
            </div>
          </div>

          {data.caregiverEmail && (
            <div className="event-conf-receipt">
              <EmailIcon />
              <p>A confirmation has been sent to <strong>{data.caregiverEmail}</strong></p>
            </div>
          )}

          <div className="event-conf-next">
            <div className="event-conf-next-title">Next steps</div>
            <div className="event-conf-next-list">
              <div className="event-conf-next-step">
                <div className="event-conf-next-num">1</div>
                <div>
                  <div className="event-conf-next-heading">Check your email</div>
                  <p className="event-conf-next-desc">Your confirmation and event details are on their way.</p>
                </div>
              </div>
              <div className="event-conf-next-step">
                <div className="event-conf-next-num">2</div>
                <div>
                  <div className="event-conf-next-heading">Save the date</div>
                  <p className="event-conf-next-desc">Add {data.selectedEventDate || 'the event'} to your calendar.</p>
                </div>
              </div>
              <div className="event-conf-next-step">
                <div className="event-conf-next-num">3</div>
                <div>
                  <div className="event-conf-next-heading">Consider joining Girl Scouts</div>
                  <p className="event-conf-next-desc">Loved the event? Register your daughter as a full member and unlock all year-round activities.</p>
                </div>
              </div>
            </div>
          </div>

          <Button variant="outline" onClick={handleDone}>
            Back to home
          </Button>
        </div>

        <Footer />
      </div>
    </div>
  )
}

function TicketCheckIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path d="M6 10L6 22C6 23.1 6.9 24 8 24H24C25.1 24 26 23.1 26 22V10C26 8.9 25.1 8 24 8H8C6.9 8 6 8.9 6 10Z" stroke="white" strokeWidth="1.8" />
      <path d="M21 8V24M11 8V24" stroke="white" strokeWidth="1.5" strokeDasharray="2 2" />
      <path d="M12 16L14.5 18.5L20 13" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
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
