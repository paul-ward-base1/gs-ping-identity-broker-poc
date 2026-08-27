import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { TopNav } from '../components/TopNav'
import { Footer } from '../components/Footer'
import { Button, BackButton, ArrowRightIcon } from '../components/Button'
import { ProgressBar } from '../components/ProgressBar'
import { useRegistration } from '../context/RegistrationContext'
import './CaregiverPhone.css'

const ETHNICITIES = ['Hispanic', 'Non-Hispanic', 'I choose not to share']

const RACES = [
  'American Indian or Alaskan Native',
  'Asian',
  'Black or African American',
  'Hawaiian or Pacific Islander',
  'White',
  'Other Races',
  'I choose not to share',
]

export function GirlsRaceEthnicity() {
  const navigate = useNavigate()
  const { data, update } = useRegistration()
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!data.girlEthnicity) errs.girlEthnicity = 'Ethnicity is required'
    if (!data.girlRace) errs.girlRace = 'Race is required'
    return errs
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    navigate('/membership')
  }

  return (
    <div className="screen">
      <TopNav />
      <ProgressBar current={7} total={9} />

      <form className="screen-body" onSubmit={handleSubmit} noValidate>
        <div className="screen-content">
          <BackButton onClick={() => navigate('/register/schooling')} />

          <div className="heading">
            <p className="eyebrow">Question 7 of 9</p>
            <h1 className="screen-title">What is the Girl Scout's race &amp; ethnicity?</h1>
          </div>

          <div className="form">
            <div className="fields">
              <div className={`select-field ${errors.girlRace ? 'select-field--error' : ''}`}>
                <select
                  className="select-field-input"
                  value={data.girlRace}
                  onChange={e => { update({ girlRace: e.target.value }); setErrors(prev => ({ ...prev, girlRace: '' })) }}
                  aria-label="Race"
                >
                  <option value="" disabled>Race</option>
                  {RACES.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
                <label className={`select-field-label ${data.girlRace ? 'select-field-label--active' : ''}`}>
                  Race
                </label>
                <ChevronDownIcon />
                {errors.girlRace && <p className="select-field-error">{errors.girlRace}</p>}
              </div>

              <div className={`select-field ${errors.girlEthnicity ? 'select-field--error' : ''}`}>
                <select
                  className="select-field-input"
                  value={data.girlEthnicity}
                  onChange={e => { update({ girlEthnicity: e.target.value }); setErrors(prev => ({ ...prev, girlEthnicity: '' })) }}
                  aria-label="Ethnicity"
                >
                  <option value="" disabled>Ethnicity</option>
                  {ETHNICITIES.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
                <label className={`select-field-label ${data.girlEthnicity ? 'select-field-label--active' : ''}`}>
                  Ethnicity
                </label>
                <ChevronDownIcon />
                {errors.girlEthnicity && <p className="select-field-error">{errors.girlEthnicity}</p>}
              </div>

              <p className="sms-consent-detail">
                Girl Scouts respects and welcomes people from all backgrounds and abilities.
                By completing the following information (as defined by the U.S. Census Bureau),
                you ensure support and funding for girls in your community. Hispanic/Latina is
                defined as an ethnicity, not a race, therefore is reported separately. This
                information is used for statistical purposes only.
              </p>
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

function ChevronDownIcon() {
  return (
    <svg className="select-chevron" width="16" height="10" viewBox="0 0 16 10" fill="none">
      <path d="M1 1L8 8L15 1" stroke="#646669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
