import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { TopNav } from '../../components/TopNav'
import { Footer } from '../../components/Footer'
import { TextField } from '../../components/TextField'
import { Button, BackButton, ArrowRightIcon } from '../../components/Button'
import { useRegistration } from '../../context/RegistrationContext'
import '../../screens/CaregiverPhone.css'

export function TroopContactEmail() {
  const navigate = useNavigate()
  const { data, update } = useRegistration()
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!data.caregiverEmail.trim()) {
      errs.caregiverEmail = 'Email address is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.caregiverEmail)) {
      errs.caregiverEmail = 'Please enter a valid email address'
    }
    return errs
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    navigate('/join-troop/contact-phone')
  }

  return (
    <div className="screen">
      <TopNav />

      <form className="screen-body" onSubmit={handleSubmit} noValidate>
        <div className="screen-content">
          <BackButton onClick={() => navigate('/join-troop/contact-method')} />

          <div className="heading">
            <h1 className="screen-title">What is your email address?</h1>
          </div>

          <div className="form">
            <div className="fields">
              <TextField
                label="Your email address"
                type="email"
                value={data.caregiverEmail}
                onChange={e => { update({ caregiverEmail: e.target.value }); setErrors(prev => ({ ...prev, caregiverEmail: '' })) }}
                error={errors.caregiverEmail}
                autoComplete="email"
                autoFocus
                inputMode="email"
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
