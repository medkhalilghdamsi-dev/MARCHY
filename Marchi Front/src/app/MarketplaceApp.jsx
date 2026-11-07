import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useMarketplace } from '../providers/MarketplaceContext'
import { ErrorBoundary } from './ErrorBoundary'
import { AppRoutes } from './routes'
import { PageTitleManager } from './PageTitleManager'

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

export default function App() {
  const { language } = useMarketplace()
  const isRtl = language === 'ar'

  return (
    <div className={isRtl ? 'app-root is-rtl' : 'app-root'} dir={isRtl ? 'rtl' : 'ltr'}>
      <ScrollToTop />
      <PageTitleManager />
      <a className="skip-to-content" href="#main-content">Skip to main content</a>
      <ErrorBoundary>
        <AppRoutes />
      </ErrorBoundary>
    </div>
  )
}
