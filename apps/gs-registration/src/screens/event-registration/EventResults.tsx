import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { TopNav } from '../../components/TopNav'
import { Footer } from '../../components/Footer'
import { BackButton } from '../../components/Button'
import { useRegistration } from '../../context/RegistrationContext'
import { MOCK_EVENTS, EVENT_TYPES, EVENT_GRADES, GsEvent } from './mockEvents'
import './EventResults.css'

export function EventResults() {
  const navigate = useNavigate()
  const { data } = useRegistration()
  const [showFilters, setShowFilters] = useState(false)
  const [filterTypes, setFilterTypes] = useState<string[]>(data.eventTypes)
  const [filterGrades, setFilterGrades] = useState<string[]>(data.eventGrades)
  const [filterFreeOnly, setFilterFreeOnly] = useState(false)

  const filtered = useMemo(() => {
    return MOCK_EVENTS.filter(ev => {
      if (filterTypes.length > 0 && !filterTypes.includes(ev.type)) return false
      if (filterGrades.length > 0 && !ev.grades.some(g => filterGrades.includes(g))) return false
      if (filterFreeOnly && ev.price > 0) return false
      return true
    })
  }, [filterTypes, filterGrades, filterFreeOnly])

  const activeFilterCount = filterTypes.length + filterGrades.length + (filterFreeOnly ? 1 : 0)

  const toggleType = (t: string) =>
    setFilterTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])
  const toggleGrade = (g: string) =>
    setFilterGrades(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g])
  const clearAll = () => { setFilterTypes([]); setFilterGrades([]); setFilterFreeOnly(false) }

  return (
    <div className="screen">
      <TopNav />

      <div className="screen-body">
        {/* Results header */}
        <div className="event-results-header">
          <BackButton onClick={() => navigate('/register-event/grades')} />
          <div className="event-results-meta">
            <span className="event-results-count">{filtered.length} event{filtered.length !== 1 ? 's' : ''}</span>
            {data.eventZip && <span className="event-results-location">near {data.eventZip}</span>}
          </div>
          <button
            type="button"
            className={`event-filter-btn ${showFilters ? 'event-filter-btn--active' : ''}`}
            onClick={() => setShowFilters(s => !s)}
          >
            <FilterIcon />
            Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
          </button>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="event-filter-panel">
            <div className="event-filter-section">
              <div className="event-filter-section-head">
                <span className="event-filter-section-label">Event type</span>
              </div>
              <div className="event-filter-chips">
                {EVENT_TYPES.map(t => (
                  <button
                    key={t}
                    type="button"
                    className={`event-filter-chip ${filterTypes.includes(t) ? 'event-filter-chip--on' : ''}`}
                    onClick={() => toggleType(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="event-filter-section">
              <div className="event-filter-section-head">
                <span className="event-filter-section-label">Program level</span>
              </div>
              <div className="event-filter-chips">
                {EVENT_GRADES.map(({ label }) => (
                  <button
                    key={label}
                    type="button"
                    className={`event-filter-chip ${filterGrades.includes(label) ? 'event-filter-chip--on' : ''}`}
                    onClick={() => toggleGrade(label)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="event-filter-section">
              <button
                type="button"
                className={`event-filter-toggle ${filterFreeOnly ? 'event-filter-toggle--on' : ''}`}
                onClick={() => setFilterFreeOnly(f => !f)}
              >
                <div className="event-filter-toggle-box">
                  {filterFreeOnly && <SmallCheckIcon />}
                </div>
                Free events only
              </button>
            </div>
            {activeFilterCount > 0 && (
              <button type="button" className="event-filter-clear" onClick={clearAll}>
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Results list */}
        <div className="event-results-list">
          {filtered.length === 0 ? (
            <div className="event-results-empty">
              <p>No events match your filters.</p>
              <button type="button" className="event-filter-clear" onClick={clearAll}>
                Clear filters
              </button>
            </div>
          ) : (
            filtered.map(ev => (
              <EventCard key={ev.id} event={ev} onClick={() => navigate(`/register-event/event/${ev.id}`)} />
            ))
          )}
        </div>

        <Footer />
      </div>
    </div>
  )
}

function EventCard({ event, onClick }: { event: GsEvent; onClick: () => void }) {
  return (
    <button type="button" className="event-card" onClick={onClick}>
      <div className="event-card-body">
        <div className="event-card-top">
          <span className="event-card-type">{event.type}</span>
          {event.status === 'partial-waitlist' && (
            <span className="event-card-badge event-card-badge--warning">
              {event.spotsLeft} spot{event.spotsLeft !== 1 ? 's' : ''} left
            </span>
          )}
          {event.status === 'full-waitlist' && (
            <span className="event-card-badge event-card-badge--full">Waitlist only</span>
          )}
        </div>
        <h2 className="event-card-name">{event.name}</h2>
        <div className="event-card-meta">
          <span>{event.dateShort}</span>
          <span className="event-card-sep">·</span>
          <span>{event.city}</span>
        </div>
        <div className="event-card-grades">
          {event.grades.slice(0, 3).map(g => (
            <span key={g} className="event-card-grade">{g}</span>
          ))}
          {event.grades.length > 3 && (
            <span className="event-card-grade">+{event.grades.length - 3}</span>
          )}
        </div>
      </div>
      <div className="event-card-price">
        {event.price === 0 ? (
          <span className="event-card-price-free">Free</span>
        ) : (
          <>
            <span className="event-card-price-amount">${event.price}</span>
            <span className="event-card-price-label">/person</span>
          </>
        )}
        <ChevronRightIcon />
      </div>
    </button>
  )
}

function FilterIcon() {
  return (
    <svg width="16" height="14" viewBox="0 0 16 14" fill="none">
      <path d="M1 1H15M4 7H12M7 13H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg width="7" height="12" viewBox="0 0 7 12" fill="none">
      <path d="M1 1L6 6L1 11" stroke="#adb5bd" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function SmallCheckIcon() {
  return (
    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
