import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TopNav } from '../../components/TopNav'
import { Footer } from '../../components/Footer'
import { Button, BackButton, ArrowRightIcon } from '../../components/Button'
import { useRegistration } from '../../context/RegistrationContext'
import '../MembershipOptions.css'
import './TroopResults.css'
import './TroopFindSearch.css'

interface TroopResult {
  id: string
  name: string
  location: string
  gradeRange: string
  association: string
}

const MOCK_TROOPS: TroopResult[] = [
  {
    id: 'troop-12345',
    name: 'Troop 12345',
    location: 'Edison, NJ 08820',
    gradeRange: '1st to 3rd',
    association: 'Langtree Elementary',
  },
  {
    id: 'troop-95123',
    name: 'Troop 95123',
    location: 'Hamilton, 08619',
    gradeRange: '3rd',
    association: 'Langtree Elementary',
  },
]

export function TroopResults() {
  const navigate = useNavigate()
  const { update } = useRegistration()
  const [selected, setSelected] = useState<string | null>(null)
  const [error, setError] = useState('')

  const handleContinue = () => {
    if (!selected) { setError('Please select a troop or click on the Join without a Troop button or the Get help finding a Troop button to continue.'); return }
    const troop = MOCK_TROOPS.find(t => t.id === selected)
    if (troop) update({ selectedTroopName: troop.name })
    navigate('/join-troop/caregiver-name')
  }

  return (
    <div className="screen">
      <TopNav />

      <div className="screen-body">
        <div className="screen-content">
          <BackButton onClick={() => navigate('/join-troop/find-search')} />

          <div className="heading">
            <h1 className="screen-title">Choose a Troop</h1>
            <p className="screen-subtitle">We found {MOCK_TROOPS.length} troops that match your search.</p>
          </div>

          <div className="form">
            <div className="membership-list">
              {MOCK_TROOPS.map((troop, i) => (
                <button
                  key={troop.id}
                  type="button"
                  className={`membership-card ${selected === troop.id ? 'membership-card--selected' : ''}`}
                  onClick={() => { setSelected(troop.id); setError('') }}
                >
                  <div className="membership-card-check">
                    <div className="membership-radio">
                      {selected === troop.id && <div className="membership-radio-dot" />}
                    </div>
                  </div>
                  <div className="membership-card-body">
                    <div className="troop-result-name-row">
                      <span className="membership-name">{troop.name}</span>
                      <span className="troop-result-index">{i + 1} of {MOCK_TROOPS.length}</span>
                    </div>
                    <span className="troop-result-detail">{troop.location}</span>
                    <span className="troop-result-detail">Grade Range — {troop.gradeRange}</span>
                    <span className="troop-result-detail">Association — {troop.association}</span>
                  </div>
                </button>
              ))}
            </div>

            {error && <p className="membership-error">{error}</p>}

            <div className="troop-search-alt-btns">
              <button
                type="button"
                className="troop-search-alt-btn"
                onClick={() => navigate('/join-troop/know-troop?preselect=without')}
              >
                Join without a Troop
              </button>
              <button
                type="button"
                className="troop-search-alt-btn"
                onClick={() => navigate('/join-troop/know-troop?preselect=help')}
              >
                Get help finding a Troop
              </button>
            </div>

            <div className="troop-search-continue">
              <Button onClick={handleContinue} icon={<ArrowRightIcon />}>
                Continue
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  )
}
