import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TopNav } from '../../components/TopNav'
import { Footer } from '../../components/Footer'
import { Button, BackButton, ArrowRightIcon } from '../../components/Button'
import { ProgressBar } from '../../components/ProgressBar'
import { CheckboxCard } from '../../components/CheckboxCard'
import { useRegistration } from '../../context/RegistrationContext'
import { EVENT_TYPES } from './mockEvents'

export function EventType() {
  const navigate = useNavigate()
  const { data, update } = useRegistration()
  const [selected, setSelected] = useState<string[]>(data.eventTypes)
  const [error, setError] = useState('')

  const toggle = (type: string) => {
    setSelected(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    )
    setError('')
  }

  const handleContinue = () => {
    // Allow empty = show all types
    update({ eventTypes: selected })
    navigate('/register-event/grades')
  }

  return (
    <div className="screen">
      <TopNav />
      <ProgressBar current={2} total={3} />

      <div className="screen-body">
        <div className="screen-content">
          <BackButton onClick={() => navigate('/register-event/location')} />

          <div className="heading-group">
            <div className="heading">
              <p className="eyebrow">Step 2 of 3 — Events</p>
              <h1 className="screen-title">What kind of events are you looking for?</h1>
            </div>
            <p className="screen-subtitle">Select all that apply, or skip to see everything.</p>
          </div>

          <div className="form">
            {error && <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-error)' }}>{error}</p>}
            <div className="fields">
              {EVENT_TYPES.map(type => (
                <CheckboxCard
                  key={type}
                  label={type}
                  selected={selected.includes(type)}
                  onToggle={() => toggle(type)}
                />
              ))}
            </div>

            <Button onClick={handleContinue} icon={<ArrowRightIcon />}>
              {selected.length === 0 ? 'Show all events' : 'Continue'}
            </Button>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  )
}
