import { useState, FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { TopNav } from '../../components/TopNav'
import { Footer } from '../../components/Footer'
import { Button, BackButton, ArrowRightIcon } from '../../components/Button'
import { useRegistration } from '../../context/RegistrationContext'
import { COUNTRIES } from '../../data/countries'
import { US_REGIONS } from '../../data/usRegions'
import { CA_REGIONS } from '../../data/caRegions'
import './TroopGirlResidence.css'

export function TroopGirlResidence() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isFindFlow = searchParams.get('flow') === 'find'
  const { data, update } = useRegistration()
  const [country, setCountry] = useState('')
  const [province, setProvince] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const hasZip = data.girlResidenceZip.trim().length > 0
  const hasIntl = country.length > 0 || province.length > 0 || data.girlResidenceCity.trim().length > 0

  const isUSA = country === 'USA'
  const isCanada = country === 'CA'
  const hasRegionDropdown = isUSA || isCanada
  const regionList = isUSA ? US_REGIONS : CA_REGIONS

  const clearField = (key: string) => setErrors(prev => ({ ...prev, [key]: '' }))

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!hasZip && !hasIntl) {
      errs.zip = 'Please enter a ZIP code or select a country below.'
      return errs
    }
    if (hasZip) {
      if (!/^\d{5}$/.test(data.girlResidenceZip.trim())) errs.zip = 'Enter a valid 5-digit ZIP code'
    }
    if (hasIntl) {
      if (!country) errs.country = 'Country/Region is required'
      if (!province.trim()) errs.state = 'State/Province is required'
      if (!data.girlResidenceCity.trim()) errs.city = 'City is required'
    }
    return errs
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    update({
      girlResidenceZip: data.girlResidenceZip,
      girlResidenceCity: data.girlResidenceCity,
      girlResidenceState: province,
      girlResidenceCountry: country,
    })
    navigate(isFindFlow ? '/join-troop/find-search' : '/join-troop/contact-school')
  }

  const handleCountryChange = (isocode: string) => {
    setCountry(isocode)
    setProvince('')
    setErrors(prev => ({ ...prev, country: '', state: '' }))
  }

  return (
    <div className="screen">
      <TopNav />

      <form className="screen-body" onSubmit={handleSubmit} noValidate>
        <div className="screen-content">
          <BackButton onClick={() => navigate('/join-troop/contact-name')} />

          <div className="heading">
            <h1 className="screen-title">Where does the Girl Scout currently reside?</h1>
          </div>

          <div className="form">
            <div className="fields">

              {/* US section */}
              <p className="residence-section-title">Location</p>
              <p className="residence-section-hint">Within the U.S. and Puerto Rico? Enter your zip code to get started.</p>

              <div>
                <label className="residence-field-label" htmlFor="res-zip">Zip Code</label>
                <input
                  id="res-zip"
                  className={`residence-input ${errors.zip ? 'residence-input--error' : ''}`}
                  type="text"
                  placeholder="Zip Code"
                  value={data.girlResidenceZip}
                  onChange={e => { update({ girlResidenceZip: e.target.value }); clearField('zip') }}
                  inputMode="numeric"
                  maxLength={5}
                  autoFocus
                />
                {errors.zip && <p className="residence-field-error">{errors.zip}</p>}
              </div>

              {/* OR divider */}
              <div className="residence-or-divider">
                <div className="residence-or-line" />
                <span className="residence-or-label">OR</span>
                <div className="residence-or-line" />
              </div>

              {/* International section */}
              <p className="residence-section-hint">Outside the U.S.? Please enter your city and country to get started.</p>

              <div className="residence-international">
                <div>
                  <label className="residence-field-label" htmlFor="res-country">Country/Region</label>
                  <div className="residence-select-wrap">
                    <select
                      id="res-country"
                      className={`residence-select ${!country ? 'residence-select--placeholder' : ''} ${errors.country ? 'residence-select--error' : ''}`}
                      value={country}
                      onChange={e => handleCountryChange(e.target.value)}
                    >
                      <option value="" disabled>Select a Country</option>
                      {COUNTRIES.map(c => (
                        <option key={c.isocode} value={c.isocode}>{c.name}</option>
                      ))}
                    </select>
                    <ChevronDownIcon />
                  </div>
                  {errors.country && <p className="residence-field-error">{errors.country}</p>}
                </div>

                <div>
                  <label className="residence-field-label" htmlFor="res-state">State/Province</label>
                  <div className="residence-select-wrap">
                    {hasRegionDropdown ? (
                      <select
                        id="res-state"
                        className={`residence-select ${!province ? 'residence-select--placeholder' : ''} ${errors.state ? 'residence-select--error' : ''}`}
                        value={province}
                        onChange={e => { setProvince(e.target.value); clearField('state') }}
                      >
                        <option value="" disabled>Select a State</option>
                        {regionList.map(r => (
                          <option key={r.isocode} value={r.isocodeShort}>{r.name}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        id="res-state"
                        className={`residence-input ${errors.state ? 'residence-input--error' : ''}`}
                        type="text"
                        placeholder="State/Province"
                        value={province}
                        onChange={e => { setProvince(e.target.value); clearField('state') }}
                      />
                    )}
                    {hasRegionDropdown && <ChevronDownIcon />}
                  </div>
                  {errors.state && <p className="residence-field-error">{errors.state}</p>}
                </div>

                <div>
                  <label className="residence-field-label" htmlFor="res-city">City</label>
                  <input
                    id="res-city"
                    className={`residence-input ${errors.city ? 'residence-input--error' : ''}`}
                    type="text"
                    placeholder="City"
                    value={data.girlResidenceCity}
                    onChange={e => { update({ girlResidenceCity: e.target.value }); clearField('city') }}
                    autoComplete="address-level2"
                  />
                  {errors.city && <p className="residence-field-error">{errors.city}</p>}
                </div>
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

function ChevronDownIcon() {
  return (
    <svg className="residence-select-chevron" width="16" height="10" viewBox="0 0 16 10" fill="none">
      <path d="M1 1L8 8L15 1" stroke="#646669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
