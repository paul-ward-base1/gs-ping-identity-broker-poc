import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { TopNav } from '../../components/TopNav'
import { Footer } from '../../components/Footer'
import { TextField } from '../../components/TextField'
import { Button, BackButton, ArrowRightIcon } from '../../components/Button'
import { ProgressBar } from '../../components/ProgressBar'
import { useRegistration } from '../../context/RegistrationContext'
import './TroopEntry.css'

export function TroopEntry() {
  const navigate = useNavigate()
  const { data, update } = useRegistration()
  const [code, setCode] = useState(data.invitationCode)
  const [error, setError] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!code.trim()) {
      setError('Please enter your invitation code')
      return
    }
    // Mock: any 6-digit code is valid
    if (!/^\d{6}$/.test(code.trim())) {
      setError('Invitation codes are 6 digits (e.g. 123456)')
      return
    }
    update({
      invitationCode: code.trim(),
      troopId: '123456',
      troopName: 'Troop 123456',
      troopLeader: 'Sarah Johnson',
      troopCity: 'Austin, TX',
      troopGrade: 'Brownie (Grades 2–3)',
    })
    navigate('/join-troop/enrolment')
  }

  return (
    <div className="screen">
      <TopNav />
      <ProgressBar current={1} total={10} />

      <form className="screen-body" onSubmit={handleSubmit} noValidate>
        <div className="screen-content">
          <BackButton onClick={() => navigate('/start')} />

          <div className="heading-group">
            <div className="heading">
              <p className="eyebrow">Join Troop — Invitation</p>
              <h1 className="screen-title">Enter your invitation code</h1>
            </div>
            <p className="screen-subtitle">
              Your troop leader sent you a 6-digit code — enter it below to join directly.
            </p>
          </div>

          <div className="form">
            <div className="fields">
              <TextField
                label="Invitation code"
                value={code}
                onChange={e => { setCode(e.target.value); setError('') }}
                error={error}
                inputMode="numeric"
                maxLength={6}
                autoFocus
              />
            </div>

            <div className="troop-entry-alt">
              <span>Don't have a code?</span>
              <button
                type="button"
                className="troop-entry-link"
                onClick={() => navigate('/join-troop/know-troop')}
              >
                Find a troop instead
              </button>
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
