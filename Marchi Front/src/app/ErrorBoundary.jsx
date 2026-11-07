import { Component } from 'react'
import { Link } from 'react-router-dom'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    // In production this would send to an error tracking service
    if (import.meta.env.DEV) {
      console.error('[MARCHY ErrorBoundary]', error, info)
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <main id="main-content" className="shell page">
          <div className="error-boundary-state">
            <span className="error-boundary-icon" aria-hidden="true">⚠</span>
            <h1>Something went wrong</h1>
            <p>An unexpected error occurred on this page. Your cart and saved items are safe.</p>
            <div className="error-boundary-actions">
              <button
                type="button"
                className="primary-btn"
                onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload() }}
              >
                Reload page
              </button>
              <Link to="/" className="outline-btn">Back to home</Link>
            </div>
            {import.meta.env.DEV && this.state.error && (
              <details className="error-boundary-details">
                <summary>Error details (development only)</summary>
                <pre>{this.state.error.toString()}</pre>
              </details>
            )}
          </div>
        </main>
      )
    }
    return this.props.children
  }
}
