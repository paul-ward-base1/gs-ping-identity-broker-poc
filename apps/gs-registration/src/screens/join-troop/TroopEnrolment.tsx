import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { TopNav } from '../../components/TopNav'
import { Footer } from '../../components/Footer'
import { Button, BackButton, ArrowRightIcon } from '../../components/Button'
import { ProgressBar } from '../../components/ProgressBar'
import { RadioCard } from '../../components/RadioCard'
import { useRegistration } from '../../context/RegistrationContext'
import './TroopEnrolment.css'


export function TroopEnrolment() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { data, update } = useRegistration()
  const [answer, setAnswer] = useState<'yes' | 'no' | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const troop = searchParams.get('troop') || '12345'
    update({
      invitationCode: troop,
      troopId: troop,
      troopName: `Troop ${troop}`,
      troopLeader: "Leader's Name",
      troopCity: 'Edison, NJ 08820',
      troopGrade: 'Brownie (Grades 2–3)',
      troopGradeRange: '1st to 3rd',
      troopAssociation: 'Langtree Elementary',
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleContinue = () => {
    if (!answer) { setError('Please select either Yes or No to continue.'); return }
    if (answer === 'yes') {
      update({ selectedTroopName: data.troopName })
      navigate('/join-troop/caregiver-name')
    } else {
      navigate('/join-troop/know-troop')
    }
  }

  return (
    <div className="screen">
      <TopNav />
      <ProgressBar current={1} total={10} />

      <div className="screen-body">
        <div className="screen-content">
          <BackButton onClick={() => navigate('/start')} />

          <div className="heading">
            <h1 className="screen-title">Do you want to join this troop?</h1>
          </div>

          <div className="troop-details-card">
            <p className="troop-details-name">{data.troopName}</p>

            <div className="troop-details-divider" />

            <div className="troop-details-meta">
              <div className="troop-details-row">
                <span className="troop-details-label">Location:</span>
                <span>{data.troopCity}</span>
              </div>
              <div className="troop-details-row">
                <span className="troop-details-label">Grade Range:</span>
                <span>{data.troopGradeRange}</span>
              </div>
              <div className="troop-details-row">
                <span className="troop-details-label">Association:</span>
                <span>{data.troopAssociation}</span>
              </div>
            </div>
          </div>

          <div className="form">
            <div className="fields">
              <RadioCard
                label="Yes"
                selected={answer === 'yes'}
                onSelect={() => { setAnswer('yes'); setError('') }}
              />
              <RadioCard
                label="No"
                selected={answer === 'no'}
                onSelect={() => { setAnswer('no'); setError('') }}
              />
            </div>
            {error && <p className="radio-error">{error}</p>}

            <Button onClick={handleContinue} icon={<ArrowRightIcon />}>
              Continue
            </Button>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  )
}
