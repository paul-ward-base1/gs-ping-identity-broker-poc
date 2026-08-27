import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { TopNav } from '../../components/TopNav'
import { Footer } from '../../components/Footer'
import { TextField } from '../../components/TextField'
import { Button, BackButton, ArrowRightIcon } from '../../components/Button'
import { ProgressBar } from '../../components/ProgressBar'
import { useRegistration } from '../../context/RegistrationContext'
import '../../screens/Schooling.css'

const GRADES = [
  'Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade',
  '5th Grade', '6th Grade', '7th Grade', '8th Grade', '9th Grade',
  '10th Grade', '11th Grade', '12th Grade',
]

const formatDob = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 8)
  if (digits.length <= 2) return digits
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
}

export function TroopSchooling() {
  const navigate = useNavigate()
  const { data, update } = useRegistration()
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!data.grade) errs.grade = 'Grade is required'
    if (!data.girlDob.trim()) {
      errs.girlDob = 'Date of birth is required'
    } else if (!/^\d{2}\/\d{2}\/\d{4}$/.test(data.girlDob)) {
      errs.girlDob = 'Please enter a complete date (mm/dd/yyyy)'
    }
    return errs
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    navigate('/join-troop/race-ethnicity')
  }

  return (
    <div className="screen">
      <TopNav />
      <ProgressBar current={6} total={9} />

      <form className="screen-body" onSubmit={handleSubmit} noValidate>
        <div className="screen-content">
          <BackButton onClick={() => navigate('/join-troop/girls-name')} />

          <div className="heading">
            <p className="eyebrow">Question 6 of 9</p>
            <h1 className="screen-title">What is their grade, date of birth and school they are attending?</h1>
          </div>

          <div className="form">
            <div className="fields">
              <div className={`select-field grade-select ${errors.grade ? 'select-field--error' : ''}`}>
                <select
                  className="select-field-input"
                  value={data.grade}
                  onChange={e => { update({ grade: e.target.value }); setErrors(prev => ({ ...prev, grade: '' })) }}
                  aria-label="Grade"
                >
                  <option value="" disabled>Grade</option>
                  {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
                <GradeInfoIcon />
                <label className={`select-field-label ${data.grade ? 'select-field-label--active' : ''}`}>
                  Grade
                </label>
                <ChevronDownIcon />
                {errors.grade && <p className="select-field-error">{errors.grade}</p>}
              </div>

              <TextField
                label="Date of birth (mm/dd/yyyy)"
                value={data.girlDob}
                onChange={e => { update({ girlDob: formatDob(e.target.value) }); setErrors(prev => ({ ...prev, girlDob: '' })) }}
                error={errors.girlDob}
                inputMode="numeric"
              />
              <TextField
                label="School attending (optional)"
                value={data.school}
                onChange={e => update({ school: e.target.value })}
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

function GradeInfoIcon() {
  return (
    <div className="grade-info-wrap">
      <svg className="grade-info-icon" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <circle cx="7" cy="7" r="7" fill="#1a73e8" />
        <text x="7" y="11" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold" fontFamily="Arial">i</text>
      </svg>
      <div className="grade-tooltip">
        If today is BEFORE August 1, enter the grade they are completing. If today is August 1 or after, enter the grade they will be going into.
      </div>
    </div>
  )
}

function ChevronDownIcon() {
  return (
    <svg className="select-chevron" width="16" height="10" viewBox="0 0 16 10" fill="none">
      <path d="M1 1L8 8L15 1" stroke="#646669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
