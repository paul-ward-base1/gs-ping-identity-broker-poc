import './CheckboxCard.css'

interface CheckboxCardProps {
  label: string
  description?: string
  selected: boolean
  onToggle: () => void
  disabled?: boolean
}

export function CheckboxCard({ label, description, selected, onToggle, disabled }: CheckboxCardProps) {
  return (
    <button
      type="button"
      className={[
        'checkbox-card',
        selected ? 'checkbox-card--selected' : '',
        disabled ? 'checkbox-card--disabled' : '',
      ].filter(Boolean).join(' ')}
      onClick={onToggle}
      disabled={disabled}
      role="checkbox"
      aria-checked={selected}
    >
      <div className="checkbox-card-box">
        {selected && <CheckIcon />}
      </div>
      <div className="checkbox-card-body">
        <span className="checkbox-card-label">{label}</span>
        {description && <p className="checkbox-card-desc">{description}</p>}
      </div>
    </button>
  )
}

function CheckIcon() {
  return (
    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
