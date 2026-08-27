import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TopNav } from '../../components/TopNav'
import { Footer } from '../../components/Footer'
import { Button, BackButton, ArrowRightIcon } from '../../components/Button'
import { ProgressBar } from '../../components/ProgressBar'
import { CheckboxCard } from '../../components/CheckboxCard'
import { useRegistration } from '../../context/RegistrationContext'
import { EVENT_GRADES } from './mockEvents'

export function EventGrades() {
  const navigate = useNavigate()
  const { data, update } = useRegistration()
  const [selected, setSelected] = useState<string[]>(data.eventGrades)

  const toggle = (grade: string) => {
    setSelected(prev =>
      prev.includes(grade) ? prev.filter(g => g !== grade) : [...prev, grade]
    )
  }

  const handleContinue = () => {
    update({ eventGrades: selected })
    navigate('/register-event/results')
  }

  return (
    <div className="screen">
      <TopNav />
      <ProgressBar current={3} total={3} />

      <div className="screen-body">
        <div className="screen-content">
          <BackButton onClick={() => navigate('/register-event/type')} />

          <div className="heading-group">
            <div className="heading">
              <p className="eyebrow">Step 3 of 3 — Grades</p>
              <h1 className="screen-title">Which program levels are you interested in?</h1>
            </div>
            <p className="screen-subtitle">Select grade levels for your Girl Scout, or skip to see all.</p>
          </div>

          <div className="form">
            <div className="fields">
              {EVENT_GRADES.map(({ label, sub }) => (
                <CheckboxCard
                  key={label}
                  label={label}
                  description={sub}
                  selected={selected.includes(label)}
                  onToggle={() => toggle(label)}
                />
              ))}
            </div>

            <Button onClick={handleContinue} icon={<ArrowRightIcon />}>
              {selected.length === 0 ? 'Show all events' : 'Find events'}
            </Button>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  )
}
