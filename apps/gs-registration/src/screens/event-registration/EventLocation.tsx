import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { TopNav } from '../../components/TopNav'
import { Footer } from '../../components/Footer'
import { TextField } from '../../components/TextField'
import { Button, BackButton, ArrowRightIcon } from '../../components/Button'
import { ProgressBar } from '../../components/ProgressBar'
import { useRegistration } from '../../context/RegistrationContext'

export function EventLocation() {
  const navigate = useNavigate()
  const { data, update } = useRegistration()
  const [zip, setZip] = useState(data.eventZip)
  const [error, setError] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!zip.trim()) { setError('ZIP code is required'); return }
    if (!/^\d{5}$/.test(zip.trim())) { setError('Enter a valid 5-digit ZIP code'); return }
    update({ eventZip: zip.trim() })
    navigate('/register-event/type')
  }

  return (
    <div className="screen">
      <TopNav />
      <ProgressBar current={1} total={3} />

      <form className="screen-body" onSubmit={handleSubmit} noValidate>
        <div className="screen-content">
          <BackButton onClick={() => navigate('/register-event')} />

          <div className="heading-group">
            <div className="heading">
              <p className="eyebrow">Step 1 of 3 — Location</p>
              <h1 className="screen-title">Where are you looking for events?</h1>
            </div>
            <p className="screen-subtitle">
              We'll show you events from your local Girl Scout council and nearby areas.
            </p>
          </div>

          <div className="form">
            <div className="fields">
              <TextField
                label="ZIP code"
                value={zip}
                onChange={e => { setZip(e.target.value); setError('') }}
                error={error}
                inputMode="numeric"
                maxLength={5}
                autoComplete="postal-code"
                autoFocus
              />
            </div>
            <Button type="submit" icon={<ArrowRightIcon />}>
              Continue
            </Button>
          </div>
        </div>

        <Footer />
      </form>
    </div>
  )
}
