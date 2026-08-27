import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { TopNav } from '../../components/TopNav'
import { Footer } from '../../components/Footer'
import { TextField } from '../../components/TextField'
import { Button, BackButton, ArrowRightIcon } from '../../components/Button'
import { ProgressBar } from '../../components/ProgressBar'

export function FindTroop() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!query.trim()) {
      setError("Please enter a troop number, name, or leader's name")
      return
    }
    navigate('/join-troop/choose-troop', { state: { query } })
  }

  return (
    <div className="screen">
      <TopNav />
      <ProgressBar current={3} total={10} />

      <form className="screen-body" onSubmit={handleSubmit} noValidate>
        <div className="screen-content">
          <BackButton onClick={() => navigate('/join-troop/know-troop')} />

          <div className="heading-group">
            <div className="heading">
              <p className="eyebrow">Question 3 of 10</p>
              <h1 className="screen-title">Find a Troop</h1>
            </div>
            <p className="screen-subtitle">
              Search by troop number, name, or your leader's name.
            </p>
          </div>

          <div className="form">
            <div className="fields">
              <TextField
                label="Troop number, name or leader's name"
                value={query}
                onChange={e => { setQuery(e.target.value); setError('') }}
                error={error}
                autoFocus
              />
            </div>

            <Button type="submit" icon={<ArrowRightIcon />}>
              Search
            </Button>
          </div>
        </div>

        <Footer />
      </form>
    </div>
  )
}
