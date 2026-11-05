import { createContext, useContext } from 'react'
import { useMarketplaceState } from '../hooks/useMarketplaceState'

const MarketplaceContext = createContext(null)

export function MarketplaceProvider({ children }) {
  const marketplace = useMarketplaceState()
  return <MarketplaceContext.Provider value={marketplace}>{children}</MarketplaceContext.Provider>
}

export function useMarketplace() {
  const marketplace = useContext(MarketplaceContext)
  if (!marketplace) throw new Error('useMarketplace must be used within MarketplaceProvider')
  return marketplace
}
