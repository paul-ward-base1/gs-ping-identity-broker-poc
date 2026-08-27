import { useState, useEffect, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from 'react-oidc-context'
import { TopNav } from '../../components/TopNav'
import { Footer } from '../../components/Footer'
import { TextField } from '../../components/TextField'
import { Button, BackButton, ArrowRightIcon } from '../../components/Button'
import './RenewEntry.css'

export function RenewEntry() {
  const navigate = useNavigate()
  const auth = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (auth.isAuthenticated) navigate('/renew/account')
  }, [auth.isAuthenticated, navigate])

  const handleSignIn = (e: FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!email.trim()) errs.email = 'Email is required'
    if (!password.trim()) errs.password = 'Password is required'
    if (Object.keys(errs).length) { setErrors(errs); return }
    navigate('/renew/account')
  }

  return (
    <div className="screen">
      <TopNav />

      <form className="screen-body" onSubmit={handleSignIn} noValidate>
        <div className="screen-content">
          <BackButton onClick={() => navigate('/')} />

          <div className="heading-group">
            <div className="heading">
              <p className="eyebrow">Renew Membership</p>
              <h1 className="screen-title">Sign in to your account</h1>
            </div>
            <p className="screen-subtitle">
              Sign in to view and renew your Girl Scout memberships.
            </p>
          </div>

          <div className="form">
            <div className="fields">
              <TextField
                label="Email address"
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })) }}
                error={errors.email}
                autoComplete="email"
                inputMode="email"
                autoFocus
              />
              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })) }}
                error={errors.password}
                autoComplete="current-password"
              />
            </div>

            <div className="renew-entry-forgot">
              <button type="button" className="renew-entry-link">Forgot password?</button>
            </div>

            <Button type="submit" icon={<ArrowRightIcon />}>
              Sign in
            </Button>

            <div className="renew-entry-demo">
              <span>No account?</span>
              <button type="button" className="renew-entry-link" onClick={() => navigate('/renew/no-account')}>
                Look up by member ID or email
              </button>
            </div>
          </div>

          <div className="renew-entry-divider">
            <span>or</span>
          </div>

          <Button onClick={() => auth.signinRedirect()}>
            Sign in with Girl Scouts
          </Button>

          <div className="renew-entry-divider">
            <span>or try the demo</span>
          </div>

          <Button variant="outline" onClick={() => navigate('/renew/account')}>
            Demo — Sign in as Jane Smith
          </Button>
        </div>

        <Footer />
      </form>
    </div>
  )
}
