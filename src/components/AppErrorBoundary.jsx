import React from 'react'
import { Link } from 'react-router-dom'

export class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('MARCHY page rendering failed:', error, info)
  }

  handleRetry = () => {
    this.setState({ hasError: false })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <main id="main-content" className="shell page app-error-state" role="alert">
          <span className="eyebrow">A TEMPORARY PROBLEM</span>
          <h1>That page didn’t load as expected.</h1>
          <p className="muted">Your browsing session is still here. Try loading the page again or return to the marketplace.</p>
          <div className="app-error-actions">
            <button type="button" className="primary-btn" onClick={this.handleRetry}>Try again</button>
            <Link className="outline-btn" to="/" onClick={() => this.setState({ hasError: false })}>Back to MARCHY</Link>
          </div>
        </main>
      )
    }
    return this.props.children
  }
}
