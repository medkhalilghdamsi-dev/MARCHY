import { lazy, Suspense, useEffect, useState } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { categories, products } from '../data/products'
import { sellers } from '../data/sellers'
import { MarketplaceProvider, useMarketplace } from '../context/MarketplaceContext'
import { Header, Footer, MobileTabBar } from '../components/MarketplaceChrome'
import { AppErrorBoundary } from '../components/AppErrorBoundary'

const Home = lazy(() => import('../pages/ShoppingPages').then(m => ({ default: m.Home })))
const SearchPage = lazy(() => import('../pages/ShoppingPages').then(m => ({ default: m.SearchPage })))
const ProductPage = lazy(() => import('../pages/ShoppingPages').then(m => ({ default: m.ProductPage })))
const CartPage = lazy(() => import('../pages/ShoppingPages').then(m => ({ default: m.CartPage })))
const CheckoutPage = lazy(() => import('../pages/ShoppingPages').then(m => ({ default: m.CheckoutPage })))
const WishlistPage = lazy(() => import('../pages/ShoppingPages').then(m => ({ default: m.WishlistPage })))
const SellersPage = lazy(() => import('../pages/DiscoveryPages').then(m => ({ default: m.SellersPage })))
const SellerPage = lazy(() => import('../pages/DiscoveryPages').then(m => ({ default: m.SellerPage })))
const CategoriesPage = lazy(() => import('../pages/DiscoveryPages').then(m => ({ default: m.CategoriesPage })))
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

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function RouteLoading() {
  return <main id="main-content" className="shell page route-loading" role="status" aria-live="polite">
    <span className="route-loading-mark" aria-hidden="true" />
    <span>Loading this page…</span>
  </main>
}

function MarketplaceAppContent() {
  const location = useLocation()
  const [query, setQuery] = useState('')
  const { language, setLanguage, theme, setTheme, cart, wishlist } = useMarketplace()

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    setQuery(params.get('q') || '')
  }, [location.pathname, location.search])

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
    } else if (path.startsWith('/orders/')) title = 'Order tracking ' + path.split('/').pop()
    else if (path.startsWith('/seller/')) {
      const seller = sellers.find(item => item.slug === path.split('/').pop())
      title = seller ? seller.name : 'Seller storefront'
    } else {
      const titles = {
        '/cart': 'Shopping cart', '/checkout': 'Checkout preview', '/wishlist': 'Saved products',
        '/categories': 'Browse categories', '/sellers': 'Discover sellers', '/account': 'Your account',
        '/login': 'Sign in', '/signup': 'Create account', '/help': 'Help centre',
        '/delivery': 'Delivery guide', '/returns': 'Returns guide', '/seller-help': 'Seller preparation guide',
        '/sell': 'Sell on MARCHY', '/seller-dashboard': 'Seller workspace',
        '/operations/delivery': 'Delivery operations', '/admin': 'Platform overview', '/orders': 'Your orders'
      }
      title = titles[path] || 'Page not found'
    }
    document.title = title + ' | MARCHY'
  }, [location.pathname, location.search])

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0)
  return <div className={language === 'ar' ? 'app-root is-rtl' : 'app-root'} dir={language === 'ar' ? 'rtl' : 'ltr'}>
    <ScrollToTop />
    <a className="skip-to-content" href="#main-content">Skip to main content</a>
    <Header cartCount={cartCount} query={query} setQuery={setQuery} language={language} setLanguage={setLanguage} theme={theme} setTheme={setTheme} />
    <AppErrorBoundary>
      <Suspense fallback={<RouteLoading />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/category/:category" element={<SearchPage addToCart={addToCart} wishlist={wishlist} toggleWish={toggleWish} language={language} />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/wishlist" element={<WishlistPage products={products} />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/sellers" element={<SellersPage />} />
          <Route path="/seller/:slug" element={<SellerPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/signup" element={<AuthPage language={language} />} />
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
    </AppErrorBoundary>
    <Footer language={language} />
    <MobileTabBar cartCount={cartCount} wishlistCount={wishlist.length} language={language} />
  </div>
}

export default function MarketplaceApp() { return <MarketplaceProvider><MarketplaceAppContent /></MarketplaceProvider> }
