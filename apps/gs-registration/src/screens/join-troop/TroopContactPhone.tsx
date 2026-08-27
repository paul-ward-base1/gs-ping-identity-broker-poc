import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { TopNav } from '../../components/TopNav'
import { Footer } from '../../components/Footer'
import { TextField } from '../../components/TextField'
import { Button, BackButton, ArrowRightIcon } from '../../components/Button'
import { useRegistration } from '../../context/RegistrationContext'
import '../../screens/CaregiverPhone.css'

export function TroopContactPhone() {
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
    if (!digits) errs.phone = 'Phone number is required'
    else if (digits.length < 10 || digits.length > 11) errs.phone = 'Please enter a valid 10-digit phone number (including area code)'
    return errs
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    navigate('/join-troop/contact-name')
  }

  return (
    <div className="screen">
      <TopNav />

      <form className="screen-body" onSubmit={handleSubmit} noValidate>
        <div className="screen-content">
          <BackButton onClick={() => navigate('/join-troop/contact-email')} />

          <div className="heading">
            <h1 className="screen-title">What is your phone number?</h1>
          </div>

          <div className="form">
            <div className="fields">
              <TextField
                label="Phone number"
                type="tel"
                value={data.caregiverPhone}
                onChange={e => { update({ caregiverPhone: formatPhone(e.target.value) }); setErrors(prev => ({ ...prev, phone: '' })) }}
                error={errors.phone}
                autoComplete="tel"
                inputMode="tel"
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
