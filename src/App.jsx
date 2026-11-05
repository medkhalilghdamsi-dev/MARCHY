import { AppErrorBoundary } from './components/AppErrorBoundary'
import MarketplaceApp from './app/MarketplaceApp'

function App() {
  return (
    <AppErrorBoundary>
      <MarketplaceApp />
    </AppErrorBoundary>
  )
}

export default App
