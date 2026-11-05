import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useMarketplaceState } from '../hooks/useMarketplaceState'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'
import { MobileTabBar } from '../components/MobileTabBar'
import { MarketplaceRoutes } from './MarketplaceRoutes'
import { usePageMetadata } from './usePageMetadata'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function MarketplaceApp() {
  const location = useLocation()
  const [query, setQuery] = useState('')
  const {
    language,
    setLanguage,
    cart,
    wishlist,
    addToCart,
    updateQty,
    removeItem,
    clearCart,
    toggleWish,
  } = useMarketplaceState()

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    setQuery(params.get('q') || '')
  }, [location.pathname, location.search])

  usePageMetadata(location)

  const cartCount = cart.reduce((total, item) => total + item.qty, 0)

  return (
    <div
      className={language === 'ar' ? 'app-root is-rtl' : 'app-root'}
      dir={language === 'ar' ? 'rtl' : 'ltr'}
    >
      <ScrollToTop />
      <a className="skip-to-content" href="#main-content">Skip to main content</a>

      <Header
        cartCount={cartCount}
        query={query}
        setQuery={setQuery}
        language={language}
        setLanguage={setLanguage}
      />

      <MarketplaceRoutes
        language={language}
        cart={cart}
        wishlist={wishlist}
        addToCart={addToCart}
        updateQty={updateQty}
        removeItem={removeItem}
        clearCart={clearCart}
        toggleWish={toggleWish}
      />

      <Footer language={language} />
      <MobileTabBar
        cartCount={cartCount}
        wishlistCount={wishlist.length}
        language={language}
      />
    </div>
  )
}

export default MarketplaceApp
