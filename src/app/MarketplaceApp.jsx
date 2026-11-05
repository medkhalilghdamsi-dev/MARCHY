import { lazy, Suspense, useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { categories, products } from '../data/products'
import { sellers } from '../data/sellers'
import { readJson, writeJson } from '../utils/marketplace'
import { useMarketplace } from './MarketplaceContext'
import { ErrorBoundary } from './ErrorBoundary'
import { Header, Footer, MobileTabBar } from '../components/MarketplaceChrome'
import { Home, SearchPage, ProductPage, CartPage, CheckoutPage, WishlistPage } from '../pages/ShoppingPages'
import { SellersPage, SellerPage, CategoriesPage } from '../pages/DiscoveryPages'

// Lazy loaded secondary workspace and support pages for code splitting
const SellerLaunchPage = lazy(() => import('../pages/SellerPages').then(m => ({ default: m.SellerLaunchPage })))
const SellerDashboardPage = lazy(() => import('../pages/SellerPages').then(m => ({ default: m.SellerDashboardPage })))
const SellerPreparationPage = lazy(() => import('../pages/SellerPages').then(m => ({ default: m.SellerPreparationPage })))

const AccountPage = lazy(() => import('../pages/SupportPages').then(m => ({ default: m.AccountPage })))
const AuthPage = lazy(() => import('../pages/SupportPages').then(m => ({ default: m.AuthPage })))
const MarketplaceGuidePage = lazy(() => import('../pages/SupportPages').then(m => ({ default: m.MarketplaceGuidePage })))
const HelpCenterPage = lazy(() => import('../pages/SupportPages').then(m => ({ default: m.HelpCenterPage })))
const NotFoundPage = lazy(() => import('../pages/SupportPages').then(m => ({ default: m.NotFoundPage })))

const DeliveryOperationsPage = lazy(() => import('../pages/OperationsPages').then(m => ({ default: m.DeliveryOperationsPage })))
const AdminOperationsPage = lazy(() => import('../pages/OperationsPages').then(m => ({ default: m.AdminOperationsPage })))
const BuyerOrderTrackingPage = lazy(() => import('../pages/OperationsPages').then(m => ({ default: m.BuyerOrderTrackingPage })))
const BuyerOrdersPage = lazy(() => import('../pages/OperationsPages').then(m => ({ default: m.BuyerOrdersPage })))

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
    const path = location.pathname
    const params = new URLSearchParams(location.search)
    const queryTerm = params.get('q')
    let title = 'Discover local products and stores'
    if (path === '/') title = 'Discover more, closer to home'
    else if (path === '/search') title = queryTerm ? 'Search results for ' + queryTerm : 'Shop the marketplace'
    else if (path.startsWith('/category/')) {
      const slug = decodeURIComponent(path.split('/').pop() || '')
      const category = categories.find(item => item.toLowerCase() === slug.toLowerCase())
      title = category ? category + ' products' : 'Category not found'
    } else if (path.startsWith('/product/')) {
      const product = products.find(item => item.id === Number(path.split('/').pop()))
      title = product ? product.name : 'Product not found'
      if (product) {
        const previous = readJson('marchy-recently-viewed', [])
        writeJson('marchy-recently-viewed', [product.id, ...previous.filter(item => item !== product.id)].slice(0, 8))
      }
    } else if (path.startsWith('/orders/')) title = 'Order tracking ' + path.split('/').pop()
    else if (path.startsWith('/seller/')) {
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
        '/operations/delivery': 'Delivery operations',
        '/admin': 'Platform overview',
        '/orders': 'Your orders',
      }
      title = titles[path] || 'Page not found'
    }
    document.title = title + ' | MARCHY'
  }, [location.pathname, location.search])
  return null
}

export default function App() {
  const { language, cart, wishlist } = useMarketplace()
  const cartCount = cart.reduce((s, x) => s + x.qty, 0)

  return (
    <div className={language === 'ar' ? 'app-root is-rtl' : 'app-root'} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <ScrollToTop />
      <PageTitleManager />
      <a className="skip-to-content" href="#main-content">Skip to main content</a>
      <Header cartCount={cartCount} />
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
            <Route path="/seller-dashboard" element={<SellerDashboardPage />} />
            <Route path="/operations/delivery" element={<DeliveryOperationsPage />} />
            <Route path="/admin" element={<AdminOperationsPage />} />
            <Route path="/orders" element={<BuyerOrdersPage />} />
            <Route path="/orders/:id" element={<BuyerOrderTrackingPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
      <Footer />
      <MobileTabBar cartCount={cartCount} wishlistCount={wishlist.length} />
    </div>
  )
}
