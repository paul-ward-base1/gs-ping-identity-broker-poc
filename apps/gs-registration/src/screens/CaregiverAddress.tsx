import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { TopNav } from '../components/TopNav'
import { Footer } from '../components/Footer'
import { TextField } from '../components/TextField'
import { Button, BackButton, ArrowRightIcon } from '../components/Button'
import { ProgressBar } from '../components/ProgressBar'
import { useRegistration } from '../context/RegistrationContext'
import { COUNTRIES } from '../data/countries'
import { US_REGIONS } from '../data/usRegions'
import { CA_REGIONS } from '../data/caRegions'
import './CaregiverAddress.css'

export function CaregiverAddress() {
  const navigate = useNavigate()
  const { data, update } = useRegistration()
  const [errors, setErrors] = useState<Record<string, string>>({})

  const isUSA = data.country === 'USA'
  const isCanada = data.country === 'CA'
  const hasRegionDropdown = isUSA || isCanada
  const regionList = isUSA ? US_REGIONS : CA_REGIONS

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!data.country) errs.country = 'Country/Region is required'
    if (!data.addressLine1.trim()) errs.addressLine1 = 'Street address is required'
    if (!data.city.trim()) errs.city = 'City is required'
    if (!data.state.trim()) errs.state = 'State is required'
    if (!data.zip.trim()) errs.zip = 'ZIP code is required'
    else if (isUSA && !/^\d{5}$/.test(data.zip)) errs.zip = 'Enter a valid 5-digit ZIP code'
    else if (isCanada && !/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/.test(data.zip)) errs.zip = 'Enter a valid Canadian postal code (e.g. A1A 1A1)'
    return errs
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    navigate('/register/caregiver-phone')
  }

  const handleCountryChange = (isocode: string) => {
    update({ country: isocode, state: '' })
    setErrors(prev => ({ ...prev, country: '', state: '' }))
  }

  return (
    <div className="screen">
      <TopNav />
      <ProgressBar current={3} total={9} />

      <form className="screen-body" onSubmit={handleSubmit} noValidate>
        <div className="screen-content">
          <BackButton onClick={() => navigate('/register/caregiver-email')} />

          <div className="heading-group">
            <div className="heading">
              <p className="eyebrow">Question 3 of 9</p>
              <h1 className="screen-title">What is the caregiver's address?</h1>
            </div>
            <p className="screen-subtitle">
              {data.country === 'USA' || !data.country
                ? 'Start typing to find and select your address.'
                : 'Please enter your residential address.'}
            </p>
          </div>

          <div className="form">
            <div className="fields">
              <div className={`select-field ${errors.country ? 'select-field--error' : ''}`}>
                <select
                  className="select-field-input"
                  value={data.country}
                  onChange={e => handleCountryChange(e.target.value)}
                  aria-label="Country/Region"
                >
                  <option value="" disabled>Country/Region</option>
                  {COUNTRIES.map(c => (
                    <option key={c.isocode} value={c.isocode}>{c.name}</option>
                  ))}
                </select>
                <label className={`select-field-label ${data.country ? 'select-field-label--active' : ''}`}>
                  Country/Region
                </label>
                <ChevronDownIcon />
                {errors.country && <p className="select-field-error">{errors.country}</p>}
              </div>

              <TextField
                label="Address line 1"
                value={data.addressLine1}
                onChange={e => { update({ addressLine1: e.target.value }); setErrors(prev => ({ ...prev, addressLine1: '' })) }}
                error={errors.addressLine1}
                autoComplete="address-line1"
                autoFocus
              />
              <TextField
                label="Address line 2 (optional)"
                value={data.addressLine2}
                onChange={e => update({ addressLine2: e.target.value })}
                autoComplete="address-line2"
              />
              <TextField
                label="City"
                value={data.city}
                onChange={e => { update({ city: e.target.value }); setErrors(prev => ({ ...prev, city: '' })) }}
                error={errors.city}
                autoComplete="address-level2"
              />

              {hasRegionDropdown ? (
                <div className={`select-field ${errors.state ? 'select-field--error' : ''}`}>
                  <select
                    className="select-field-input"
                    value={data.state}
                    onChange={e => { update({ state: e.target.value }); setErrors(prev => ({ ...prev, state: '' })) }}
                    aria-label={isUSA ? 'State' : 'Province'}
                  >
                    <option value="" disabled>{isUSA ? 'State' : 'Province'}</option>
                    {regionList.map(r => (
                      <option key={r.isocode} value={r.isocodeShort}>{r.name}</option>
                    ))}
                  </select>
                  <label className={`select-field-label ${data.state ? 'select-field-label--active' : ''}`}>
                    {isUSA ? 'State' : 'Province'}
                  </label>
                  <ChevronDownIcon />
                  {errors.state && <p className="select-field-error">{errors.state}</p>}
                </div>
              ) : (
                <TextField
                  label="State / Province / Region"
                  value={data.state}
                  onChange={e => { update({ state: e.target.value }); setErrors(prev => ({ ...prev, state: '' })) }}
                  error={errors.state}
                  autoComplete="address-level1"
                />
              )}

              <TextField
                label="ZIP code"
                value={data.zip}
                onChange={e => { update({ zip: e.target.value }); setErrors(prev => ({ ...prev, zip: '' })) }}
                error={errors.zip}
                inputMode="numeric"
                maxLength={isUSA ? 5 : isCanada ? 7 : undefined}
                autoComplete="postal-code"
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

function ChevronDownIcon() {
  return (
    <svg className="select-chevron" width="16" height="10" viewBox="0 0 16 10" fill="none">
      <path d="M1 1L8 8L15 1" stroke="#646669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
