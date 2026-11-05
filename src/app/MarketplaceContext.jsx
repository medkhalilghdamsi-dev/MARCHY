import { createContext, useContext } from 'react'
import { useMarketplaceState } from '../hooks/useMarketplaceState'

const MarketplaceContext = createContext(null)

export function MarketplaceProvider({ children }) {
  const state = useMarketplaceState()
  return (
    <MarketplaceContext.Provider value={state}>
      {children}
    </MarketplaceContext.Provider>
  )
}

export function useMarketplace() {
  const ctx = useContext(MarketplaceContext)
  if (!ctx) throw new Error('useMarketplace must be used within MarketplaceProvider')
  return ctx
}
