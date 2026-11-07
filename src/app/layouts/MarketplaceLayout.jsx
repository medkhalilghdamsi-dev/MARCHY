import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { useMarketplace } from '../../providers/MarketplaceContext'
import { Header } from '../../components/layout/Header'
import { Footer } from '../../components/layout/Footer'
import { MobileTabBar } from '../../components/layout/MobileTabBar'
import { GlobalCompareDrawer } from '../../components/marketplace/GlobalCompareDrawer'

export function MarketplaceLayout() {
  const { cart, wishlist } = useMarketplace()
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0)

  return (
    <>
      <Header cartCount={cartCount} />
      <div className="marketplace-route-content">
        <Outlet />
      </div>
      <Suspense fallback={null}>
        <GlobalCompareDrawer />
        <Footer />
        <MobileTabBar cartCount={cartCount} wishlistCount={wishlist.length} />
      </Suspense>
    </>
  )
}
