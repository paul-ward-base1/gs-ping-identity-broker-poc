import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { TopNav } from '../../components/TopNav'
import { Footer } from '../../components/Footer'
import { Button, BackButton, ArrowRightIcon } from '../../components/Button'
import './LeadCapture.css'

export function TroopContactComments() {
  const navigate = useNavigate()
  const [comments, setComments] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    navigate('/join-troop/contact-confirmation')
  }

  return (
    <div className="screen">
      <TopNav />

      <form className="screen-body" onSubmit={handleSubmit} noValidate>
        <div className="screen-content">
          <BackButton onClick={() => navigate('/join-troop/contact-school')} />

          <div className="heading">
            <h1 className="screen-title">Any further comments?</h1>
            <p className="screen-subtitle">Include anything you want to tell us.</p>
          </div>

          <div className="form">
            <div className="fields">
              <div className="lead-textarea-wrap">
                <textarea
                  className="lead-textarea"
                  placeholder="Comments (optional)"
                  value={comments}
                  onChange={e => setComments(e.target.value)}
                  rows={6}
                />
              </div>
            </div>
            <Button type="submit" icon={<ArrowRightIcon />}>
              Send request
            </Button>
          </div>
        </div>
        <Footer />
      </form>
    </div>
  )
}
