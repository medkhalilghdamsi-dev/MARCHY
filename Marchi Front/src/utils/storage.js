// Safe localStorage helpers. Every key MARCHY writes is listed in STORAGE_KEYS
// so a "reset demo data" action can clear exactly what the app owns.
export const STORAGE_KEYS = {
  language: 'marchy-language',
  theme: 'marchy-theme',
  cart: 'marchy-cart-v2',
  saved: 'marchy-saved-for-later-v2',
  wishlist: 'marchy-wishlist',
  compare: 'marchy-compare',
  recentlyViewed: 'marchy-recently-viewed',
  recentSearches: 'marchy-recent-searches',
  coupon: 'marchy-applied-coupon',
  followedSellers: 'marchy-followed-sellers',
  orders: 'marchy-orders-v2',
  catalog: 'marchy-seller-catalog-v1',
  sellerWorkspace: 'marchy-seller-workspace-v1',
  activeSeller: 'marchy-active-seller',
  productView: 'marchy-product-view',
  checkoutDraft: 'marchy-checkout-draft',
}

export function readText(key, fallback = '') {
  try { return localStorage.getItem(key) ?? fallback } catch { return fallback }
}
export function writeText(key, value) {
  try { localStorage.setItem(key, value) } catch { /* storage unavailable (private mode / quota) */ }
}
export function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (raw == null) return fallback
    const value = JSON.parse(raw)
    return value ?? fallback
  } catch { return fallback }
}
export function writeJson(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* ignore */ }
}
export function removeKey(key) {
  try { localStorage.removeItem(key) } catch { /* ignore */ }
}

