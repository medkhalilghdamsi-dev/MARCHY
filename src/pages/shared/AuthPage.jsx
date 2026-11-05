import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { translateTree } from '../../i18n/translate'
import { useMarketplace } from '../../providers/MarketplaceContext'

export function AuthPage() {
  const { language } = useMarketplace()
  const location = useLocation()
  const signup = location.pathname === '/signup'
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', terms: false })

  const update = (key, value) => {
    setForm(current => ({ ...current, [key]: value }))
    setMessage('')
  }

  const submit = event => {
    event.preventDefault()
    if (signup && form.password !== form.confirm) {
      setMessage('Your passwords do not match.')
      return
    }
    setMessage('Authentication is currently simulated in this preview. Your credentials have not been transmitted or stored.')
  }

  return translateTree(
    <main id="main-content" className="auth-unique-page">
      <div className="auth-unique-layout">
        {/* Logo beside the form */}
        <section className="auth-logo-side" aria-label="Brand">
          <Link to="/" className="auth-brand-logo" aria-label="MARCHY home">
            <span className="auth-brand-icon-wrap">
              <img src="/favicon.svg" alt="" width="48" height="48" className="auth-brand-icon" />
            </span>
            <span className="auth-brand-wordmark">
              MARCHY<span className="auth-brand-accent">.</span>
            </span>
          </Link>
          <Link to="/" className="auth-back-link">
            <span aria-hidden="true" className="auth-back-arrow">←</span>
            <span>Back to marketplace</span>
          </Link>
        </section>

        {/* Login and sign in form */}
        <section className="auth-form-card" aria-label={signup ? 'Create account' : 'Sign in'}>
          <div className="auth-mode-switch" role="tablist" aria-label="Account access options">
            <Link
              to="/login"
              role="tab"
              aria-selected={!signup}
              className={!signup ? 'active' : ''}
            >
              Sign in
            </Link>
            <Link
              to="/signup"
              role="tab"
              aria-selected={signup}
              className={signup ? 'active' : ''}
            >
              Sign up
            </Link>
          </div>

          <div className="auth-form-heading">
            <h2>{signup ? 'Create an account' : 'Sign in to MARCHY'}</h2>
            <p>{signup ? 'Join to keep your favorite finds and orders in one place.' : 'Enter your email and password to access your profile.'}</p>
          </div>

          <form className="auth-form" onSubmit={submit}>
            {signup && (
              <label>
                Full name
                <input
                  required
                  autoComplete="name"
                  value={form.name}
                  onChange={e => update('name', e.target.value)}
                  placeholder="Your full name"
                />
              </label>
            )}

            <label>
              Email address
              <input
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={e => update('email', e.target.value)}
                placeholder="you@example.com"
              />
            </label>

            <label>
              Password
              <span className="auth-password-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength="8"
                  autoComplete={signup ? 'new-password' : 'current-password'}
                  value={form.password}
                  onChange={e => update('password', e.target.value)}
                  placeholder="At least 8 characters"
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </span>
            </label>

            {signup && (
              <>
                <label>
                  Confirm password
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength="8"
                    autoComplete="new-password"
                    value={form.confirm}
                    onChange={e => update('confirm', e.target.value)}
                    placeholder="Repeat your password"
                  />
                </label>
                <label className="auth-terms">
                  <input
                    type="checkbox"
                    required
                    checked={form.terms}
                    onChange={e => update('terms', e.target.checked)}
                  />
                  <span>I agree to the <Link to="/help">platform guidelines</Link> and preview terms.</span>
                </label>
              </>
            )}

            {!signup && (
              <div className="auth-form-meta">
                <label className="auth-remember">
                  <input type="checkbox" /> Remember me
                </label>
                <button
                  type="button"
                  className="auth-text-button"
                  onClick={() => setMessage('Password recovery is simulated for this preview.')}
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button type="submit" className="primary-btn auth-submit">
              {signup ? 'Create account' : 'Sign in'} <span aria-hidden="true">→</span>
            </button>

            {message && <p className="auth-feedback" role="status">{message}</p>}
          </form>

          <p className="auth-switch-copy">
            {signup ? 'Already have an account?' : 'New to MARCHY?'}{' '}
            <Link to={signup ? '/login' : '/signup'}>
              {signup ? 'Sign in' : 'Create an account'}
            </Link>
          </p>
        </section>
      </div>
    </main>,
    language
  )
}
