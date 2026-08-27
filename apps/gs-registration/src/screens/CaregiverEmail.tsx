import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { TopNav } from '../components/TopNav'
import { Footer } from '../components/Footer'
import { TextField } from '../components/TextField'
import { Button, BackButton, ArrowRightIcon } from '../components/Button'
import { ProgressBar } from '../components/ProgressBar'
import { useRegistration } from '../context/RegistrationContext'
import './CaregiverPhone.css'

export function CaregiverEmail() {
  const navigate = useNavigate()
  const { data, update } = useRegistration()
  const [confirmEmail, setConfirmEmail] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!data.caregiverEmail.trim()) {
      errs.caregiverEmail = 'Email address is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.caregiverEmail)) {
      errs.caregiverEmail = 'Please enter a valid email address'
    }
    if (!confirmEmail.trim()) {
      errs.confirmEmail = 'Please confirm your email address'
    } else if (data.caregiverEmail.trim() && confirmEmail !== data.caregiverEmail) {
      errs.confirmEmail = 'Email addresses do not match'
    }
    return errs
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    navigate('/register/caregiver-address')
  }

  return (
    <div className="screen">
      <TopNav />
      <ProgressBar current={2} total={9} />

      <form className="screen-body" onSubmit={handleSubmit} noValidate>
        <div className="screen-content">
          <BackButton onClick={() => navigate('/register/caregiver-name')} />

          <div className="heading">
            <p className="eyebrow">Question 2 of 9</p>
            <h1 className="screen-title">What is the caregiver's email?</h1>
          </div>

          <div className="form">
            <div className="fields">
              <TextField
                label="Caregiver's email"
                type="email"
                value={data.caregiverEmail}
                onChange={e => { update({ caregiverEmail: e.target.value }); setErrors(prev => ({ ...prev, caregiverEmail: '' })) }}
                error={errors.caregiverEmail}
                autoComplete="email"
                autoFocus
                inputMode="email"
              />
              <TextField
                label="Confirm Caregiver's email"
                type="email"
                value={confirmEmail}
                onChange={e => { setConfirmEmail(e.target.value); setErrors(prev => ({ ...prev, confirmEmail: '' })) }}
                error={errors.confirmEmail}
                autoComplete="off"
                inputMode="email"
              />
              <div className="sms-consent">
                <div className="sms-consent-row">
                  <input
                    id="email-opt-in"
                    type="checkbox"
                    className="sms-consent-checkbox"
                    checked={data.emailOptIn}
                    onChange={e => update({ emailOptIn: e.target.checked })}
                  />
                  <label htmlFor="email-opt-in" className="sms-consent-label">
                    Can we email you Girl Scout updates?
                  </label>
                </div>
                <p className="sms-consent-detail">
                  By opting in, you are consenting to receive email updates about all the fun of Girl Scouting.
                </p>
                <p className="sms-consent-unsubscribe">
                  You can unsubscribe at any time.
                </p>
              </div>
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
