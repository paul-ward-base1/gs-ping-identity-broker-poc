import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { TopNav } from '../../components/TopNav'
import { Footer } from '../../components/Footer'
import { TextField } from '../../components/TextField'
import { Button, BackButton, ArrowRightIcon } from '../../components/Button'
import { ProgressBar } from '../../components/ProgressBar'
import { useRegistration } from '../../context/RegistrationContext'
import '../CaregiverName.css'

export function TroopCaregiverName() {
  const navigate = useNavigate()
  const { data, update } = useRegistration()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [agreePrivacy, setAgreePrivacy] = useState(true)
  const [agreeAge, setAgreeAge] = useState(false)

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!data.caregiverFirstName.trim()) errs.caregiverFirstName = "Caregiver's first name is required"
    if (!data.caregiverLastName.trim()) errs.caregiverLastName = "Caregiver's last name is required"
    if (!agreePrivacy || !agreeAge) errs.consent = 'You must agree to both items above to continue.'
    return errs
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    navigate('/join-troop/caregiver-email')
  }

  return (
    <div className="screen">
      <TopNav />
      <ProgressBar current={1} total={9} />

      <form className="screen-body" onSubmit={handleSubmit} noValidate>
        <div className="screen-content">
          <BackButton onClick={() => navigate('/join-troop')} />

          <div className="heading">
            <p className="eyebrow">Question 1 of 9</p>
            <h1 className="screen-title">What is the caregiver's name?</h1>
          </div>

          <div className="form">
            <div className="fields">
              <TextField
                label="Caregiver's first name"
                value={data.caregiverFirstName}
                onChange={e => { update({ caregiverFirstName: e.target.value }); setErrors(prev => ({ ...prev, caregiverFirstName: '' })) }}
                error={errors.caregiverFirstName}
                autoComplete="given-name"
                autoFocus
              />
              <TextField
                label="Caregiver's last name"
                value={data.caregiverLastName}
                onChange={e => { update({ caregiverLastName: e.target.value }); setErrors(prev => ({ ...prev, caregiverLastName: '' })) }}
                error={errors.caregiverLastName}
                autoComplete="family-name"
              />

              <div className="consent-list">
                <label className="consent-item">
                  <input
                    type="checkbox"
                    className="consent-checkbox"
                    checked={agreePrivacy}
                    onChange={e => { setAgreePrivacy(e.target.checked); setErrors(prev => ({ ...prev, consent: '' })) }}
                  />
                  <span className="consent-label">
                    I agree with the{' '}
                    <a
                      href="https://www.girlscouts.org/en/help/help/privacy-policy.html"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="consent-link"
                      onClick={e => e.stopPropagation()}
                    >
                      GSUSA privacy policy
                    </a>
                  </span>
                </label>

                <label className="consent-item">
                  <input
                    type="checkbox"
                    className="consent-checkbox"
                    checked={agreeAge}
                    onChange={e => { setAgreeAge(e.target.checked); setErrors(prev => ({ ...prev, consent: '' })) }}
                  />
                  <span className="consent-label">
                    I confirm that I am 18+ and am authorized by the girl's parent or legal guardian to register her for Girl Scouts and provide the information contained in this registration
                  </span>
                </label>

                {errors.consent && <p className="consent-error">{errors.consent}</p>}
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
