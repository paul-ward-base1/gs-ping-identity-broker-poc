import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { TopNav } from '../../components/TopNav'
import { Footer } from '../../components/Footer'
import { Button, BackButton, ArrowRightIcon } from '../../components/Button'
import { ProgressBar } from '../../components/ProgressBar'
import { RadioCard } from '../../components/RadioCard'
import { useRegistration } from '../../context/RegistrationContext'
import './KnowTroop.css'

export function KnowTroop() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { data } = useRegistration()
  const [answer, setAnswer] = useState<'find' | 'without' | 'help' | null>(() => {
    const pre = searchParams.get('preselect')
    if (pre === 'without') return 'without'
    if (pre === 'find') return 'find'
    if (pre === 'help') return 'help'
    return null
  })
  const [error, setError] = useState('')

  const fromInvitation = !!data.invitationCode

  const handleContinue = () => {
    if (!answer) { setError("Please make a selection, then click on the 'Continue' button."); return }
    if (answer === 'find') {
      navigate('/join-troop/girl-residence?flow=find')
    } else if (answer === 'without') {
      navigate('/join-troop/caregiver-name')
    } else if (answer === 'help') {
      navigate('/join-troop/contact-method')
    } else {
      navigate('/join-troop/no-match')
    }
  }

  return (
    <div className="screen">
      <TopNav />
      <ProgressBar current={1} total={10} />

      <div className="screen-body">
        <div className="screen-content">
          <BackButton onClick={() => navigate(fromInvitation ? '/join-troop/enrolment' : '/join-troop')} />

          <div className="heading">
            <h1 className="screen-title">No problem - let's find something that works for you!</h1>
          </div>

          <div className="form">
            <div className="fields">
              <RadioCard
                label="Find a Troop"
                selected={answer === 'find'}
                onSelect={() => { setAnswer('find'); setError('') }}
              />
              <RadioCard
                label="Join without a Troop"
                selected={answer === 'without'}
                onSelect={() => { setAnswer('without'); setError('') }}
              />
              <RadioCard
                label="Get help from Girl Scouts"
                selected={answer === 'help'}
                onSelect={() => { setAnswer('help'); setError('') }}
              />
            </div>
            {error && <p className="know-troop-error">{error}</p>}

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

