import { lazy, Suspense, useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useMarketplace } from '../providers/MarketplaceContext'
import { ErrorBoundary } from './ErrorBoundary'
import { SELLER_PORTAL_PATHS } from './routePaths'

const Header = lazy(() => import('../components/layout/Header').then(m => ({ default: m.Header })))
const Footer = lazy(() => import('../components/layout/Footer').then(m => ({ default: m.Footer })))
const MobileTabBar = lazy(() => import('../components/layout/MobileTabBar').then(m => ({ default: m.MobileTabBar })))
const SellerPortalHeader = lazy(() => import('../components/layout/SellerPortalChrome').then(m => ({ default: m.SellerPortalHeader })))
const SellerPortalFooter = lazy(() => import('../components/layout/SellerPortalChrome').then(m => ({ default: m.SellerPortalFooter })))
const GlobalCompareDrawer = lazy(() => import('../components/marketplace/GlobalCompareDrawer').then(m => ({ default: m.GlobalCompareDrawer })))
const Home = lazy(() => import('../pages/buyer/HomePage').then(m => ({ default: m.Home })))
const SearchPage = lazy(() => import('../pages/buyer/SearchPage').then(m => ({ default: m.SearchPage })))
const ProductPage = lazy(() => import('../pages/buyer/ProductPage').then(m => ({ default: m.ProductPage })))
const CartPage = lazy(() => import('../pages/buyer/CartPage').then(m => ({ default: m.CartPage })))
const CheckoutPage = lazy(() => import('../pages/buyer/CheckoutPage').then(m => ({ default: m.CheckoutPage })))
const WishlistPage = lazy(() => import('../pages/buyer/WishlistPage').then(m => ({ default: m.WishlistPage })))
const SellersPage = lazy(() => import('../pages/buyer/SellersPage').then(m => ({ default: m.SellersPage })))
const SellerPage = lazy(() => import('../pages/buyer/SellerStorefrontPage').then(m => ({ default: m.SellerPage })))
const CategoriesPage = lazy(() => import('../pages/buyer/CategoriesPage').then(m => ({ default: m.CategoriesPage })))

// Lazy loaded secondary workspace and support pages for code splitting
const SellerLaunchPage = lazy(() => import('../pages/seller/SellerLaunchPage').then(m => ({ default: m.SellerLaunchPage })))
const SellerPreparationPage = lazy(() => import('../pages/seller/SellerPreparationPage').then(m => ({ default: m.SellerPreparationPage })))
const SellerCentralPage = lazy(() => import('../pages/seller/SellerCentralPage').then(m => ({ default: m.SellerCentralPage })))

const AccountPage = lazy(() => import('../pages/buyer/AccountPage').then(m => ({ default: m.AccountPage })))
const BuyerOrderTrackingPage = lazy(() => import('../pages/buyer/BuyerOrderTrackingPage').then(m => ({ default: m.BuyerOrderTrackingPage })))
const BuyerOrdersPage = lazy(() => import('../pages/buyer/BuyerOrdersPage').then(m => ({ default: m.BuyerOrdersPage })))

const AuthPage = lazy(() => import('../pages/shared/AuthPage').then(m => ({ default: m.AuthPage })))
const MarketplaceGuidePage = lazy(() => import('../pages/shared/MarketplaceGuidePage').then(m => ({ default: m.MarketplaceGuidePage })))
const HelpCenterPage = lazy(() => import('../pages/shared/HelpCenterPage').then(m => ({ default: m.HelpCenterPage })))
const NotFoundPage = lazy(() => import('../pages/shared/NotFoundPage').then(m => ({ default: m.NotFoundPage })))
const DeliveryOperationsPage = lazy(() => import('../pages/shared/DeliveryOperationsPage').then(m => ({ default: m.DeliveryOperationsPage })))
const AdminOperationsPage = lazy(() => import('../pages/shared/AdminOperationsPage').then(m => ({ default: m.AdminOperationsPage })))

function PageLoadingFallback() {
  return (
    <main id="main-content" className="shell page page-loading-state" aria-busy="true" aria-label="Loading page">
      <div className="page-skeleton">
        <div className="skeleton-block skeleton-title" />
        <div className="skeleton-block skeleton-text" />
        <div className="skeleton-block skeleton-text skeleton-text-short" />
        <div className="skeleton-grid">
          {[1,2,3,4].map(i => <div key={i} className="skeleton-card" />)}
        </div>
      </div>
    </main>
  )
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function PageTitleManager() {
  const location = useLocation()
  useEffect(() => {
    let cancelled = false
    const path = location.pathname
    const params = new URLSearchParams(location.search)
    const queryTerm = params.get('q')
    const setTitle = title => {
      if (!cancelled) document.title = title + ' | MARCHY'
    }

    const updateTitle = async () => {
      let title = 'Discover local products and stores'
      if (path === '/') title = 'Discover more, closer to home'
      else if (path === '/search') title = queryTerm ? 'Search results for ' + queryTerm : 'Shop the marketplace'
      else if (path.startsWith('/category/')) {
        const { categories } = await import('../data/products')
        const slug = decodeURIComponent(path.split('/').pop() || '')
        const category = categories.find(item => item.toLowerCase() === slug.toLowerCase())
        title = category ? category + ' products' : 'Category not found'
      } else if (path.startsWith('/product/')) {
        const [{ products }, storage] = await Promise.all([
          import('../data/products'),
          import('../utils/marketplace')
        ])
        const product = products.find(item => item.id === Number(path.split('/').pop()))
        title = product ? product.name : 'Product not found'
        if (product) {
          const previous = storage.readJson('marchy-recently-viewed', [])
          storage.writeJson('marchy-recently-viewed', [product.id, ...previous.filter(item => item !== product.id)].slice(0, 8))
        }
      } else if (path.startsWith('/orders/')) title = 'Order tracking ' + path.split('/').pop()
      else if (path.startsWith('/seller/')) {
        const { sellers } = await import('../data/sellers')
        const slug = path.split('/').pop()
        const seller = sellers.find(item => item.slug === slug)
        title = seller ? seller.name : 'Seller storefront'
      } else {
        const titles = {
          '/cart': 'Shopping cart',
          '/checkout': 'Checkout preview',
          '/wishlist': 'Saved products',
          '/categories': 'Browse categories',
          '/sellers': 'Discover sellers',
          '/account': 'Your account',
          '/login': 'Sign in',
          '/signup': 'Create account',
          '/help': 'Help centre',
          '/delivery': 'Delivery guide',
          '/returns': 'Returns guide',
          '/seller-help': 'Seller preparation guide',
          '/sell': 'Sell on MARCHY',
          '/seller-dashboard': 'Seller workspace',
          '/seller-central': 'Seller Central',
          '/operations/delivery': 'Delivery operations',
          '/admin': 'Platform overview',
          '/orders': 'Your orders'
        }
        title = titles[path] || 'Page not found'
      }
      setTitle(title)
    }

    updateTitle().catch(() => setTitle('MARCHY marketplace'))
    return () => { cancelled = true }
  }, [location.pathname, location.search])
  return null
}
export default function App() {
  const { language, cart, wishlist } = useMarketplace()
  const location = useLocation()
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup'
  const isSellerPortal = SELLER_PORTAL_PATHS.includes(location.pathname)
  const cartCount = cart.reduce((s, x) => s + x.qty, 0)

  return (
    <div className={language === 'ar' ? 'app-root is-rtl' : 'app-root'} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <ScrollToTop />
      <PageTitleManager />
      {!isAuthPage && <a className="skip-to-content" href="#main-content">Skip to main content</a>}
      {!isAuthPage && !isSellerPortal && <Suspense fallback={null}><Header cartCount={cartCount} /></Suspense>}
      {!isAuthPage && isSellerPortal && <Suspense fallback={null}><SellerPortalHeader /></Suspense>}
      <ErrorBoundary>
        <Suspense fallback={<PageLoadingFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/category/:category" element={<SearchPage />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/sellers" element={<SellersPage />} />
            <Route path="/seller/:slug" element={<SellerPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/signup" element={<AuthPage />} />
            <Route path="/help" element={<HelpCenterPage />} />
            <Route path="/delivery" element={<MarketplaceGuidePage type="delivery" />} />
            <Route path="/returns" element={<MarketplaceGuidePage type="returns" />} />
            <Route path="/seller-help" element={<SellerPreparationPage />} />
            <Route path="/sell" element={<SellerLaunchPage />} />
            <Route path="/seller-dashboard" element={<Navigate to="/seller-central" replace />} />
            <Route path="/seller-central" element={<SellerCentralPage />} />
            <Route path="/operations/delivery" element={<DeliveryOperationsPage />} />
            <Route path="/admin" element={<AdminOperationsPage />} />
            <Route path="/orders" element={<BuyerOrdersPage />} />
            <Route path="/orders/:id" element={<BuyerOrderTrackingPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
      {!isAuthPage && !isSellerPortal && <Suspense fallback={null}><GlobalCompareDrawer /></Suspense>}
      {!isAuthPage && !isSellerPortal && <Suspense fallback={null}><Footer /></Suspense>}
      {!isAuthPage && isSellerPortal && <Suspense fallback={null}><SellerPortalFooter /></Suspense>}
      {!isAuthPage && !isSellerPortal && <Suspense fallback={null}><MobileTabBar cartCount={cartCount} wishlistCount={wishlist.length} /></Suspense>}
    </div>
  )
}
