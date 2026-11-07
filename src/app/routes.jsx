import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { MarketplaceLayout } from './layouts/MarketplaceLayout'
import { SellerPortalLayout } from './layouts/SellerPortalLayout'
import { AuthLayout } from './layouts/AuthLayout'
import { PageLoadingFallback } from './PageLoadingFallback'

const Home = lazy(() => import('../pages/buyer/HomePage').then(module => ({ default: module.Home })))
const SearchPage = lazy(() => import('../pages/buyer/SearchPage').then(module => ({ default: module.SearchPage })))
const ProductPage = lazy(() => import('../pages/buyer/ProductPage').then(module => ({ default: module.ProductPage })))
const CartPage = lazy(() => import('../pages/buyer/CartPage').then(module => ({ default: module.CartPage })))
const CheckoutPage = lazy(() => import('../pages/buyer/CheckoutPage').then(module => ({ default: module.CheckoutPage })))
const OrderConfirmationPage = lazy(() => import('../pages/buyer/OrderConfirmationPage').then(module => ({ default: module.OrderConfirmationPage })))
const WishlistPage = lazy(() => import('../pages/buyer/WishlistPage').then(module => ({ default: module.WishlistPage })))
const SellersPage = lazy(() => import('../pages/buyer/SellersPage').then(module => ({ default: module.SellersPage })))
const SellerPage = lazy(() => import('../pages/buyer/SellerStorefrontPage').then(module => ({ default: module.SellerPage })))
const CategoriesPage = lazy(() => import('../pages/buyer/CategoriesPage').then(module => ({ default: module.CategoriesPage })))
const AccountPage = lazy(() => import('../pages/buyer/AccountPage').then(module => ({ default: module.AccountPage })))
const BuyerOrderTrackingPage = lazy(() => import('../pages/buyer/BuyerOrderTrackingPage').then(module => ({ default: module.BuyerOrderTrackingPage })))
const BuyerOrdersPage = lazy(() => import('../pages/buyer/BuyerOrdersPage').then(module => ({ default: module.BuyerOrdersPage })))

const SellerLaunchPage = lazy(() => import('../pages/seller/SellerLaunchPage').then(module => ({ default: module.SellerLaunchPage })))
const SellerPreparationPage = lazy(() => import('../pages/seller/SellerPreparationPage').then(module => ({ default: module.SellerPreparationPage })))
const SellerCentralPage = lazy(() => import('../pages/seller/SellerCentralPage').then(module => ({ default: module.SellerCentralPage })))

const AuthPage = lazy(() => import('../pages/shared/AuthPage').then(module => ({ default: module.AuthPage })))
const MarketplaceGuidePage = lazy(() => import('../pages/shared/MarketplaceGuidePage').then(module => ({ default: module.MarketplaceGuidePage })))
const HelpCenterPage = lazy(() => import('../pages/shared/HelpCenterPage').then(module => ({ default: module.HelpCenterPage })))
const NotFoundPage = lazy(() => import('../pages/shared/NotFoundPage').then(module => ({ default: module.NotFoundPage })))
const DeliveryOperationsPage = lazy(() => import('../pages/shared/DeliveryOperationsPage').then(module => ({ default: module.DeliveryOperationsPage })))
const AdminOperationsPage = lazy(() => import('../pages/shared/AdminOperationsPage').then(module => ({ default: module.AdminOperationsPage })))

export function AppRoutes() {
  return (
    <Suspense fallback={<PageLoadingFallback />}>
      <Routes>
        <Route element={<MarketplaceLayout />}>
          <Route index element={<Home />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="category/:category" element={<SearchPage />} />
          <Route path="product/:id" element={<ProductPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="checkout/:step" element={<CheckoutPage />} />
          <Route path="order-confirmation/:id" element={<OrderConfirmationPage />} />
          <Route path="wishlist" element={<WishlistPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="sellers" element={<SellersPage />} />
          <Route path="seller/:slug" element={<SellerPage />} />
          <Route path="account" element={<AccountPage />} />
          <Route path="orders" element={<BuyerOrdersPage />} />
          <Route path="orders/:id" element={<BuyerOrderTrackingPage />} />
          <Route path="help" element={<HelpCenterPage />} />
          <Route path="delivery" element={<MarketplaceGuidePage type="delivery" />} />
          <Route path="returns" element={<MarketplaceGuidePage type="returns" />} />
          <Route path="operations/delivery" element={<DeliveryOperationsPage />} />
          <Route path="admin" element={<AdminOperationsPage />} />
        </Route>

        <Route element={<SellerPortalLayout />}>
          <Route path="sell" element={<SellerLaunchPage />} />
          <Route path="seller-central" element={<SellerCentralPage />} />
          <Route path="seller-dashboard" element={<Navigate to="/seller-central" replace />} />
          <Route path="seller-help" element={<SellerPreparationPage />} />
        </Route>

        <Route element={<AuthLayout />}>
          <Route path="login" element={<AuthPage />} />
          <Route path="signup" element={<AuthPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}
