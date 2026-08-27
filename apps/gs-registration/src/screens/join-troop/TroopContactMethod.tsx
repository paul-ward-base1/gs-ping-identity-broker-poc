import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TopNav } from '../../components/TopNav'
import { Footer } from '../../components/Footer'
import { Button, BackButton, ArrowRightIcon } from '../../components/Button'
import { RadioCard } from '../../components/RadioCard'

export function TroopContactMethod() {
  const navigate = useNavigate()
  const [method, setMethod] = useState<'email' | 'phone' | null>(null)
  const [error, setError] = useState('')

  const handleContinue = () => {
    if (!method) { setError('Please select the best way to contact you.'); return }
    navigate('/join-troop/contact-email')
  }

  return (
    <div className="screen">
      <TopNav />

      <div className="screen-body">
        <div className="screen-content">
          <BackButton onClick={() => navigate('/join-troop/know-troop')} />

          <div className="heading">
            <h1 className="screen-title">What's the best way to contact you?</h1>
          </div>

          <div className="form">
            <div className="fields">
              <RadioCard
                label="Email"
                selected={method === 'email'}
                onSelect={() => { setMethod('email'); setError('') }}
              />
              <RadioCard
                label="Phone"
                selected={method === 'phone'}
                onSelect={() => { setMethod('phone'); setError('') }}
              />
            </div>
            {error && <p className="radio-error">{error}</p>}

            <Button onClick={handleContinue} icon={<ArrowRightIcon />}>
              Continue
            </Button>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  )
}
