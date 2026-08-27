import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { TopNav } from '../../components/TopNav'
import { Footer } from '../../components/Footer'
import { TextField } from '../../components/TextField'
import { Button, BackButton, ArrowRightIcon } from '../../components/Button'
import { ProgressBar } from '../../components/ProgressBar'
import { useRegistration } from '../../context/RegistrationContext'
import '../../screens/CaregiverPhone.css'

export function TroopCaregiverPhone() {
  const navigate = useNavigate()
  const { data, update } = useRegistration()
  const [errors, setErrors] = useState<Record<string, string>>({})

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11)
    if (digits.length === 11) {
      return `+${digits.slice(0, 1)} (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`
    }
    if (digits.length <= 3) return digits
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  }

  const validate = () => {
    const errs: Record<string, string> = {}
    const digits = data.caregiverPhone.replace(/\D/g, '')
    if (!digits) errs.caregiverPhone = "Caregiver's phone number is required"
    else if (digits.length < 10 || digits.length > 11) errs.caregiverPhone = 'Please make sure your phone number is 10 digits long (including area code) or 11 digits long (including country code)'
    return errs
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    navigate('/join-troop/girls-name')
  }

  return (
    <div className="screen">
      <TopNav />
      <ProgressBar current={4} total={9} />

      <form className="screen-body" onSubmit={handleSubmit} noValidate>
        <div className="screen-content">
          <BackButton onClick={() => navigate('/join-troop/caregiver-address')} />

          <div className="heading">
            <p className="eyebrow">Question 4 of 9</p>
            <h1 className="screen-title">What is the caregiver's phone number?</h1>
          </div>

          <div className="form">
            <div className="fields">
              <TextField
                label="Caregiver's phone number"
                type="tel"
                value={data.caregiverPhone}
                onChange={e => { update({ caregiverPhone: formatPhone(e.target.value) }); setErrors(prev => ({ ...prev, caregiverPhone: '' })) }}
                error={errors.caregiverPhone}
                autoComplete="tel"
                inputMode="tel"
                autoFocus
              />
              <div className="sms-consent">
                <div className="sms-consent-row">
                  <input
                    id="sms-opt-in"
                    type="checkbox"
                    className="sms-consent-checkbox"
                    checked={data.smsOptIn}
                    onChange={e => update({ smsOptIn: e.target.checked })}
                  />
                  <label htmlFor="sms-opt-in" className="sms-consent-label">
                    Can we call/text you to provide support?
                  </label>
                </div>
                <p className="sms-consent-detail">
                  By opting in, you are consenting to receive calls/texts to provide support along the way!
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
