import { ButtonHTMLAttributes, ReactNode } from 'react'
import './Button.css'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost'
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
}

export function Button({
  variant = 'primary',
  icon,
  iconPosition = 'right',
  fullWidth = false,
  children,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={[
        'btn',
        `btn--${variant}`,
        fullWidth ? 'btn--full' : '',
        className,
      ].filter(Boolean).join(' ')}
      {...props}
    >
      {icon && iconPosition === 'left' && <span className="btn-icon">{icon}</span>}
      {children}
      {icon && iconPosition === 'right' && <span className="btn-icon">{icon}</span>}
    </button>
  )
}

export function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button className="back-btn" onClick={onClick} type="button">
      <svg width="7" height="13" viewBox="0 0 7 13" fill="none">
        <path d="M6 1L1 6.5L6 12" stroke="#005640" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <span>Back</span>
    </button>
  )
}

export function ArrowRightIcon() {
  return (
    <svg width="18" height="15" viewBox="0 0 18 15" fill="none">
      <path d="M1 7.5H17M11 1.5L17 7.5L11 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
