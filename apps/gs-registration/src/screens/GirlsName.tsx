import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { TopNav } from '../components/TopNav'
import { Footer } from '../components/Footer'
import { TextField } from '../components/TextField'
import { Button, BackButton, ArrowRightIcon } from '../components/Button'
import { ProgressBar } from '../components/ProgressBar'
import { useRegistration } from '../context/RegistrationContext'
import './GirlsName.css'

export function GirlsName() {
  const navigate = useNavigate()
  const { data, meta, update } = useRegistration()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showModal, setShowModal] = useState(false)

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!data.girlFirstName.trim()) errs.girlFirstName = "Girl Scout's first name is required"
    if (!data.girlLastName.trim()) errs.girlLastName = "Girl Scout's last name is required"
    return errs
  }

  const isExistingPair =
    meta.existingCaregiver &&
    data.girlFirstName.trim().toLowerCase() === 'maggie' &&
    data.girlLastName.trim().toLowerCase() === 'lewis'

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    if (isExistingPair) {
      setShowModal(true)
      return
    }
    navigate('/register/schooling')
  }

  return (
    <div className="screen">
      <TopNav />
      <ProgressBar current={5} total={9} />

      <form className="screen-body" onSubmit={handleSubmit} noValidate>
        <div className="screen-content">
          <BackButton onClick={() => navigate('/register/caregiver-phone')} />

          <div className="heading">
            <p className="eyebrow">Question 5 of 9</p>
            <h1 className="screen-title">What is the Girl Scout's name?</h1>
          </div>

          <div className="form">
            <div className="fields">
              <TextField
                label="Girl Scout's first name"
                value={data.girlFirstName}
                onChange={e => update({ girlFirstName: e.target.value })}
                error={errors.girlFirstName}
                autoComplete="given-name"
                autoFocus
              />
              <TextField
                label="Girl Scout's last name"
                value={data.girlLastName}
                onChange={e => update({ girlLastName: e.target.value })}
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

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2 className="modal-title">Congratulations!!</h2>
            <p className="modal-body">
              Your account has been created. Please check your email to continue the registration process.
            </p>
            <button className="modal-btn" onClick={() => setShowModal(false)}>
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
