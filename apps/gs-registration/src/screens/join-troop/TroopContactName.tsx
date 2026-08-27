import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { TopNav } from '../../components/TopNav'
import { Footer } from '../../components/Footer'
import { TextField } from '../../components/TextField'
import { Button, BackButton, ArrowRightIcon } from '../../components/Button'
import { useRegistration } from '../../context/RegistrationContext'

export function TroopContactName() {
  const navigate = useNavigate()
  const { data, update } = useRegistration()
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!data.caregiverFirstName.trim()) errs.firstName = 'First name is required'
    if (!data.caregiverLastName.trim()) errs.lastName = 'Last name is required'
    return errs
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    navigate('/join-troop/girl-residence')
  }

  return (
    <div className="screen">
      <TopNav />

      <form className="screen-body" onSubmit={handleSubmit} noValidate>
        <div className="screen-content">
          <BackButton onClick={() => navigate('/join-troop/contact-email')} />

          <div className="heading">
            <h1 className="screen-title">What is your name?</h1>
          </div>

          <div className="form">
            <div className="fields">
              <TextField
                label="First name"
                value={data.caregiverFirstName}
                onChange={e => { update({ caregiverFirstName: e.target.value.slice(0, 40) }); setErrors(prev => ({ ...prev, firstName: '' })) }}
                error={errors.firstName}
                autoComplete="given-name"
                autoFocus
              />
              <TextField
                label="Last name"
                value={data.caregiverLastName}
                onChange={e => { update({ caregiverLastName: e.target.value.slice(0, 80) }); setErrors(prev => ({ ...prev, lastName: '' })) }}
                error={errors.lastName}
                autoComplete="family-name"
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
