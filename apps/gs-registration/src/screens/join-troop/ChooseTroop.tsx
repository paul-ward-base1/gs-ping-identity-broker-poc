import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { TopNav } from '../../components/TopNav'
import { Footer } from '../../components/Footer'
import { Button, BackButton, ArrowRightIcon } from '../../components/Button'
import { ProgressBar } from '../../components/ProgressBar'
import { useRegistration } from '../../context/RegistrationContext'
import './ChooseTroop.css'

interface TroopResult {
  id: string
  name: string
  leader: string
  city: string
  grade: string
  spotsAvailable: number
}

// Mock search results
const MOCK_RESULTS: TroopResult[] = [
  {
    id: '123456',
    name: 'Troop 123456',
    leader: 'Sarah Johnson',
    city: 'Austin, TX',
    grade: 'Brownie (Grades 2–3)',
    spotsAvailable: 4,
  },
  {
    id: '789012',
    name: 'Troop 789012',
    leader: 'Maria Garcia',
    city: 'Austin, TX',
    grade: 'Junior (Grades 4–5)',
    spotsAvailable: 2,
  },
  {
    id: '345678',
    name: 'Troop 345678',
    leader: 'Jennifer Lee',
    city: 'Round Rock, TX',
    grade: 'Brownie (Grades 2–3)',
    spotsAvailable: 6,
  },
]

export function ChooseTroop() {
  const navigate = useNavigate()
  const location = useLocation()
  const { update } = useRegistration()
  const [selected, setSelected] = useState<string | null>(null)
  const query = (location.state as { query?: string })?.query || ''

  const handleContinue = () => {
    if (!selected) return
    const troop = MOCK_RESULTS.find(t => t.id === selected)!
    update({
      troopId: troop.id,
      troopName: troop.name,
      troopLeader: troop.leader,
      troopCity: troop.city,
      troopGrade: troop.grade,
    })
    navigate('/join-troop/girls-name')
  }

  return (
    <div className="screen">
      <TopNav />
      <ProgressBar current={4} total={10} />

      <div className="screen-body">
        <div className="screen-content">
          <BackButton onClick={() => navigate('/join-troop/find-troop')} />

          <div className="heading-group">
            <div className="heading">
              <p className="eyebrow">Question 4 of 10</p>
              <h1 className="screen-title">Choose your Troop</h1>
            </div>
            {query && (
              <p className="screen-subtitle">Results for "{query}"</p>
            )}
          </div>

          <div className="troop-results">
            {MOCK_RESULTS.map(troop => (
              <button
                key={troop.id}
                type="button"
                className={`troop-result-card ${selected === troop.id ? 'troop-result-card--selected' : ''}`}
                onClick={() => setSelected(troop.id)}
              >
                <div className="troop-result-radio">
                  <div className="troop-result-dot" />
                </div>
                <div className="troop-result-body">
                  <div className="troop-result-name">{troop.name}</div>
                  <div className="troop-result-meta">
                    <span>{troop.grade}</span>
                    <span className="troop-result-sep">·</span>
                    <span>{troop.city}</span>
                  </div>
                  <div className="troop-result-footer">
                    <span className="troop-result-leader">Leader: {troop.leader}</span>
                    <span className={`troop-result-spots ${troop.spotsAvailable <= 2 ? 'troop-result-spots--low' : ''}`}>
                      {troop.spotsAvailable} spot{troop.spotsAvailable !== 1 ? 's' : ''} left
                    </span>
                  </div>
                </div>
              </button>
            ))}

            <button
              type="button"
              className="troop-no-match"
              onClick={() => navigate('/join-troop/no-match')}
            >
              Don't see your troop? Leave your details
            </button>
          </div>

          <Button
            onClick={handleContinue}
            disabled={!selected}
            icon={<ArrowRightIcon />}
          >
            Continue
          </Button>
        </div>

        <Footer />
      </div>
    </div>
  )
}
