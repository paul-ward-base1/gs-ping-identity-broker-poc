import { InputHTMLAttributes, forwardRef } from 'react'
import './TextField.css'

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  helperText?: string
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, helperText, id, ...props }, ref) => {
    const fieldId = id || label.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className={`text-field ${error ? 'text-field--error' : ''}`}>
        <div className="text-field-input-wrap">
          <input
            ref={ref}
            id={fieldId}
            className="text-field-input"
            placeholder=" "
            {...props}
          />
          <label className="text-field-label" htmlFor={fieldId}>
            {label}
          </label>
        </div>
        {error && <p className="text-field-message text-field-message--error">{error}</p>}
        {!error && helperText && <p className="text-field-message">{helperText}</p>}
      </div>
    )
  }
)

TextField.displayName = 'TextField'
