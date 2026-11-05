import { Route, Routes } from 'react-router-dom'
import { products } from '../data/products'
import { Home } from '../pages/HomePage'
import { SearchPage } from '../pages/SearchPage'
import { ProductPage } from '../pages/ProductPage'
import { CartPage } from '../pages/CartPage'
import { CheckoutPage } from '../pages/CheckoutPage'
import { WishlistPage } from '../pages/WishlistPage'
import { SellersPage } from '../pages/SellersPage'
import { SellerPage } from '../pages/SellerPage'
import { CategoriesPage } from '../pages/CategoriesPage'
import {
  SellerLaunchPage,
  SellerDashboardPage,
  SellerPreparationPage,
} from '../pages/SellerPages'
import {
  MarketplaceGuidePage,
  HelpCenterPage,
  NotFoundPage,
} from '../pages/SupportPages'
import { AccountPage } from '../pages/AccountPage'
import { AuthPage } from '../pages/AuthPage'
import {
  DeliveryOperationsPage,
  AdminOperationsPage,
  BuyerOrderTrackingPage,
  BuyerOrdersPage,
} from '../pages/OperationsPages'

/**
 * Central route table for every frontend workspace.
 * Keep route URLs stable: external links, bookmarks and backend integration
 * will depend on these paths.
 */
export function MarketplaceRoutes({
  language,
  cart,
  wishlist,
  addToCart,
  updateQty,
  removeItem,
  clearCart,
  toggleWish,
}) {
  const shoppingProps = { addToCart, wishlist, toggleWish, language }

  return (
    <Routes>
      <Route path="/" element={<Home {...shoppingProps} />} />
      <Route path="/search" element={<SearchPage {...shoppingProps} />} />
      <Route path="/category/:category" element={<SearchPage {...shoppingProps} />} />
      <Route path="/product/:id" element={<ProductPage {...shoppingProps} />} />

      <Route path="/cart" element={<CartPage cart={cart} updateQty={updateQty} removeItem={removeItem} language={language} />} />
      <Route path="/checkout" element={<CheckoutPage cart={cart} language={language} clearCart={clearCart} />} />
      <Route path="/wishlist" element={<WishlistPage products={products} wishlist={wishlist} toggleWish={toggleWish} addToCart={addToCart} language={language} />} />

      <Route path="/categories" element={<CategoriesPage language={language} />} />
      <Route path="/sellers" element={<SellersPage language={language} />} />
      <Route path="/seller/:slug" element={<SellerPage language={language} addToCart={addToCart} wishlist={wishlist} toggleWish={toggleWish} />} />

      <Route path="/account" element={<AccountPage cart={cart} wishlist={wishlist} language={language} />} />
      <Route path="/login" element={<AuthPage language={language} />} />
      <Route path="/signup" element={<AuthPage language={language} />} />
      <Route path="/help" element={<HelpCenterPage language={language} />} />
      <Route path="/delivery" element={<MarketplaceGuidePage type="delivery" language={language} />} />
      <Route path="/returns" element={<MarketplaceGuidePage type="returns" language={language} />} />

      <Route path="/seller-help" element={<SellerPreparationPage language={language} />} />
      <Route path="/sell" element={<SellerLaunchPage language={language} />} />
      <Route path="/seller-dashboard" element={<SellerDashboardPage language={language} />} />

      <Route path="/operations/delivery" element={<DeliveryOperationsPage language={language} />} />
      <Route path="/admin" element={<AdminOperationsPage language={language} />} />
      <Route path="/orders" element={<BuyerOrdersPage language={language} />} />
      <Route path="/orders/:id" element={<BuyerOrderTrackingPage language={language} />} />

      <Route path="*" element={<NotFoundPage language={language} />} />
    </Routes>
  )
}
