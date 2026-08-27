import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { TopNav } from '../../components/TopNav'
import { Footer } from '../../components/Footer'
import { TextField } from '../../components/TextField'
import { Button, BackButton, ArrowRightIcon } from '../../components/Button'
import { ProgressBar } from '../../components/ProgressBar'
import { useRegistration } from '../../context/RegistrationContext'

export function TroopGirlsName() {
  const navigate = useNavigate()
  const { data, update } = useRegistration()
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!data.girlFirstName.trim()) errs.girlFirstName = "Girl Scout's first name is required"
    if (!data.girlLastName.trim()) errs.girlLastName = "Girl Scout's last name is required"
    return errs
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    navigate('/join-troop/schooling')
  }

  return (
    <div className="screen">
      <TopNav />
      <ProgressBar current={5} total={9} />

      <form className="screen-body" onSubmit={handleSubmit} noValidate>
        <div className="screen-content">
          <BackButton onClick={() => navigate('/join-troop/caregiver-phone')} />

          <div className="heading">
            <p className="eyebrow">Question 5 of 9</p>
            <h1 className="screen-title">What is the Girl Scout's name?</h1>
          </div>

          <div className="form">
            <div className="fields">
              <TextField
                label="Girl Scout's first name"
                value={data.girlFirstName}
                onChange={e => { update({ girlFirstName: e.target.value }); setErrors(prev => ({ ...prev, girlFirstName: '' })) }}
                error={errors.girlFirstName}
                autoComplete="given-name"
                autoFocus
              />
              <TextField
                label="Girl Scout's last name"
                value={data.girlLastName}
                onChange={e => { update({ girlLastName: e.target.value }); setErrors(prev => ({ ...prev, girlLastName: '' })) }}
                error={errors.girlLastName}
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
