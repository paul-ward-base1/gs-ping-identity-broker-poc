import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { TopNav } from '../../components/TopNav'
import { Footer } from '../../components/Footer'
import { TextField } from '../../components/TextField'
import { Button, BackButton, ArrowRightIcon } from '../../components/Button'
import { useRegistration } from '../../context/RegistrationContext'

export function TroopContactSchool() {
  const navigate = useNavigate()
  const { data, update } = useRegistration()
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!data.school.trim()) errs.school = 'School name is required'
    return errs
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    navigate('/join-troop/contact-comments')
  }

  return (
    <div className="screen">
      <TopNav />

      <form className="screen-body" onSubmit={handleSubmit} noValidate>
        <div className="screen-content">
          <BackButton onClick={() => navigate('/join-troop/girl-residence')} />

          <div className="heading">
            <h1 className="screen-title">What is the name of the Girl Scout's school?</h1>
          </div>

          <div className="form">
            <div className="fields">
              <TextField
                label="School name"
                value={data.school}
                onChange={e => { update({ school: e.target.value }); setErrors(prev => ({ ...prev, school: '' })) }}
                error={errors.school}
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
