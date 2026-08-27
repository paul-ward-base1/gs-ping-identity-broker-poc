import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { TopNav } from '../../components/TopNav'
import { Footer } from '../../components/Footer'
import { Button, BackButton, ArrowRightIcon } from '../../components/Button'
import './TroopFindSearch.css'

export function TroopFindSearch() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (query.trim().length < 3) { setError('Please enter at least 3 characters of the troop name you would like to search for.'); return }
    navigate('/join-troop/troop-results')
  }

  return (
    <div className="screen">
      <TopNav />

      <form className="screen-body" onSubmit={handleSubmit} noValidate>
        <div className="screen-content">
          <BackButton onClick={() => navigate('/join-troop/girl-residence?flow=find')} />

          <div className="heading">
            <h1 className="screen-title">Find a Troop</h1>
            <p className="screen-subtitle">Please enter the Troop name that you would like to search for.</p>
          </div>

          <div className="form">
            <div className="fields">
              <div className={`troop-search-wrap ${error ? 'troop-search-wrap--error' : ''}`}>
                <SearchIcon />
                <input
                  className="troop-search-input"
                  type="search"
                  placeholder="Search by Troop name"
                  value={query}
                  onChange={e => { setQuery(e.target.value); setError('') }}
                  autoFocus
                />
              </div>
              {error && <p className="troop-search-error">{error}</p>}

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
            </div>
            <div className="troop-search-continue">
              <Button type="submit" icon={<ArrowRightIcon />}>
                Continue
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </form>
    </div>
  )
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="troop-search-icon">
      <circle cx="7.5" cy="7.5" r="5.5" stroke="#646669" strokeWidth="1.5" />
      <path d="M11.5 11.5L16 16" stroke="#646669" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
