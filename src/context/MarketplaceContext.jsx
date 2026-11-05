import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useMarketplaceState } from '../hooks/useMarketplaceState'

const MarketplaceContext = createContext(null)

function ToastItem({ toast, onDismiss }) {
  useEffect(() => {
    const timer = window.setTimeout(() => onDismiss(toast.id), 3800)
    return () => window.clearTimeout(timer)
  }, [toast.id, onDismiss])

  return <div className={`marchy-toast marchy-toast-${toast.type}`} role="status">
    <span aria-hidden="true">{toast.type === 'success' ? '✓' : '!'}</span>
    <p>{toast.message}</p>
    <button type="button" aria-label="Dismiss notification" onClick={() => onDismiss(toast.id)}>×</button>
  </div>
}

function ToastViewport({ toasts, dismiss }) {
  return <div className="marchy-toast-viewport" aria-live="polite" aria-relevant="additions">
    {toasts.map(toast => <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />)}
  </div>
}

export function MarketplaceProvider({ children }) {
  const marketplace = useMarketplaceState()
  const [toasts, setToasts] = useState([])
  const toastId = useRef(0)

  const dismissToast = useCallback(id => {
    setToasts(current => current.filter(toast => toast.id !== id))
  }, [])

  const notify = useCallback((message, type = 'success') => {
    const id = ++toastId.current
    setToasts(current => [...current.slice(-2), { id, message, type }])
  }, [])

  const addToCart = useCallback((...args) => {
    marketplace.addToCart(...args)
    notify('Added to your cart')
  }, [marketplace.addToCart, notify])

  const toggleWish = useCallback((id, ...args) => {
    const removing = marketplace.wishlist.includes(id)
    marketplace.toggleWish(id, ...args)
    notify(removing ? 'Removed from your saved products' : 'Saved to your wishlist')
  }, [marketplace.toggleWish, marketplace.wishlist, notify])

  const value = { ...marketplace, addToCart, toggleWish, notify }
  return <MarketplaceContext.Provider value={value}>
    {children}
    <ToastViewport toasts={toasts} dismiss={dismissToast} />
  </MarketplaceContext.Provider>
}

export function useMarketplace() {
  const marketplace = useContext(MarketplaceContext)
  if (!marketplace) throw new Error('useMarketplace must be used within MarketplaceProvider')
  return marketplace
}
