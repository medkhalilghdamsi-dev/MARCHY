import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { translateTree } from '../../i18n/translate'
import { useMarketplace } from '../../providers/MarketplaceContext'
import { useToast } from '../../providers/ToastProvider'
import { writeJson } from '../../utils/marketplace'

export function AuthPage() {
  const { language } = useMarketplace()
  const location = useLocation()
  const navigate = useNavigate()
  const toast = useToast()
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

    // Static simulation: store active profile and navigate to landing page
    const displayName = form.name?.trim() || form.email.split('@')[0] || 'User'
    writeJson('marchy-auth-user', {
      name: displayName,
      email: form.email,
      isLoggedIn: true,
      createdAt: new Date().toISOString()
    })

    toast(
      signup
        ? `Preview profile created for ${displayName}. No real account was created.`
        : `Local preview session started for ${displayName}. Credentials were not verified.`,
      { type: 'success' }
    )

    navigate('/')
  }

  return translateTree(
    <main id="main-content" className="auth-unique-page">
      {/* Logo resting on top left */}
      <header className="auth-top-bar" aria-label="Brand and navigation">
        <Link to="/" className="auth-brand-logo" aria-label="MARCHY home">
          <span className="auth-brand-icon-wrap">
            <img src="/favicon.svg" alt="" width="30" height="30" className="auth-brand-icon" />
          </span>
          <span className="auth-brand-wordmark">
            MARCHY<span className="auth-brand-accent">.</span>
          </span>
        </Link>
        <Link to="/" className="auth-back-link">
          <span aria-hidden="true" className="auth-back-arrow">←</span>
          <span>Back to marketplace</span>
        </Link>
      </header>

      {/* Centered Login and Sign In form */}
      <div className="auth-form-container">
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
            <p>{signup ? 'Preview the profile experience and keep sample preferences on this device.' : 'Preview the sign-in experience using a local-only profile.'}</p>
            <p className="auth-preview-disclaimer">Preview only: credentials are not verified or sent to a server. No real account is created.</p>
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
