import { ReactNode } from 'react'
import './RadioCard.css'

interface RadioCardProps {
  label: string
  description?: string
  icon?: ReactNode
  selected: boolean
  onSelect: () => void
  disabled?: boolean
}

export function RadioCard({ label, description, icon, selected, onSelect, disabled }: RadioCardProps) {
  return (
    <button
      type="button"
      className={[
        'radio-card',
        selected ? 'radio-card--selected' : '',
        disabled ? 'radio-card--disabled' : '',
      ].filter(Boolean).join(' ')}
      onClick={onSelect}
      disabled={disabled}
    >
      <div className="radio-card-radio">
        <div className="radio-card-dot" />
      </div>
      <div className="radio-card-body">
        {icon && <div className="radio-card-icon">{icon}</div>}
        <span className="radio-card-label">{label}</span>
        {description && <p className="radio-card-desc">{description}</p>}
      </div>
    </button>
  )
}
