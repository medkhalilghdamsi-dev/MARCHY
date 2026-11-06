import { useCallback, useEffect, useMemo, useState } from 'react'
import { readText, readJson, writeJson } from '../utils/marketplace'

const isSameCartLine = (entry, item) =>
  entry.id === item.id &&
  (entry.selectedVariant || null) === (item.selectedVariant || null) &&
  (entry.sellerSlug || null) === (item.sellerSlug || null)

export function useMarketplaceState() {
  const [language, setLanguage] = useState(() => {
    const saved = readText('marchy-language', 'en')
    return ['en', 'fr', 'ar'].includes(saved) ? saved : 'en'
  })
  const [theme, setTheme] = useState(() => {
    const saved = readText('marchy-theme', 'light')
    return saved === 'dark' ? 'dark' : 'light'
  })
  const [cart, setCart] = useState(() => readJson('marchy-cart', []))
  const [wishlist, setWishlist] = useState(() => readJson('marchy-wishlist', []))
  const [savedForLater, setSavedForLater] = useState(() => readJson('marchy-saved-for-later', []))
  const [appliedCoupon, setAppliedCoupon] = useState(() => readText('marchy-applied-coupon', ''))
  const [followedSellers, setFollowedSellers] = useState(() => readJson('marchy-followed-sellers', []))

  useEffect(() => {
    try { localStorage.setItem('marchy-language', language) } catch {}
    document.documentElement.lang = language
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
  }, [language])

  useEffect(() => {
    try { localStorage.setItem('marchy-theme', theme) } catch {}
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme
    const themeMeta = document.querySelector('meta[name="theme-color"]')
    if (themeMeta) themeMeta.setAttribute('content', theme === 'dark' ? '#111915' : '#f5f7f6')
  }, [theme])

  useEffect(() => { writeJson('marchy-cart', cart) }, [cart])
  useEffect(() => { writeJson('marchy-wishlist', wishlist) }, [wishlist])
  useEffect(() => { writeJson('marchy-saved-for-later', savedForLater) }, [savedForLater])
  useEffect(() => { writeJson('marchy-followed-sellers', followedSellers) }, [followedSellers])
  useEffect(() => {
    try {
      if (appliedCoupon) localStorage.setItem('marchy-applied-coupon', appliedCoupon)
      else localStorage.removeItem('marchy-applied-coupon')
    } catch {}
  }, [appliedCoupon])

  const addToCart = useCallback((product, qty = 1, variant = null) => {
    const line = { id: product.id, selectedVariant: variant || null }
    setCart(previous => {
      const found = previous.find(item => isSameCartLine(item, line))
      const next = found
        ? previous.map(item => isSameCartLine(item, line) ? { ...item, qty: item.qty + qty } : item)
        : [...previous, { ...product, qty, ...(variant ? { selectedVariant: variant } : {}) }]
      writeJson('marchy-cart', next)
      return next
    })
  }, [])

  const updateQty = useCallback((id, qty, variant = null, sellerSlug = null) => {
    if (qty < 1) return
    const line = { id, selectedVariant: variant || null, sellerSlug: sellerSlug || null }
    setCart(previous => {
      const next = previous.map(item => isSameCartLine(item, line) ? { ...item, qty } : item)
      writeJson('marchy-cart', next)
      return next
    })
  }, [])

  const removeItem = useCallback((id, variant = null, sellerSlug = null) => {
    const line = { id, selectedVariant: variant || null, sellerSlug: sellerSlug || null }
    setCart(previous => {
      const next = previous.filter(item => !isSameCartLine(item, line))
      writeJson('marchy-cart', next)
      return next
    })
  }, [])

  const clearCart = useCallback(() => {
    writeJson('marchy-cart', [])
    setCart([])
  }, [])

  const toggleWish = useCallback((id) => {
    setWishlist(previous => {
      const next = previous.includes(id)
        ? previous.filter(item => item !== id)
        : [...previous, id]
      writeJson('marchy-wishlist', next)
      return next
    })
  }, [])

  const saveForLater = useCallback((item) => {
    setCart(previous => {
      const next = previous.filter(entry => !isSameCartLine(entry, item))
      writeJson('marchy-cart', next)
      return next
    })
    setSavedForLater(previous => {
      const next = previous.some(entry => isSameCartLine(entry, item))
        ? previous
        : [...previous, { ...item, qty: item.qty || 1 }]
      writeJson('marchy-saved-for-later', next)
      return next
    })
  }, [])

  const moveToCart = useCallback((item) => {
    setSavedForLater(previous => {
      const next = previous.filter(entry => !isSameCartLine(entry, item))
      writeJson('marchy-saved-for-later', next)
      return next
    })
    setCart(previous => {
      const found = previous.find(entry => isSameCartLine(entry, item))
      const next = found
        ? previous.map(entry => isSameCartLine(entry, item) ? { ...entry, qty: entry.qty + (item.qty || 1) } : entry)
        : [...previous, { ...item, qty: item.qty || 1 }]
      writeJson('marchy-cart', next)
      return next
    })
  }, [])

  const removeSavedItem = useCallback((id, variant = null, sellerSlug = null) => {
    const line = { id, selectedVariant: variant || null, sellerSlug: sellerSlug || null }
    setSavedForLater(previous => {
      const next = previous.filter(entry => !isSameCartLine(entry, line))
      writeJson('marchy-saved-for-later', next)
      return next
    })
  }, [])

  const toggleFollowSeller = useCallback((slug) => {
    setFollowedSellers(previous => {
      const next = previous.includes(slug)
        ? previous.filter(entry => entry !== slug)
        : [...previous, slug]
      writeJson('marchy-followed-sellers', next)
      return next
    })
  }, [])

  return useMemo(() => ({
    language, setLanguage, theme, setTheme,
    cart, wishlist, savedForLater,
    appliedCoupon, setAppliedCoupon,
    followedSellers, toggleFollowSeller,
    addToCart, updateQty, removeItem, clearCart, toggleWish,
    saveForLater, moveToCart, removeSavedItem,
  }), [
    language, theme, cart, wishlist, savedForLater, appliedCoupon, followedSellers,
    addToCart, updateQty, removeItem, clearCart, toggleWish,
    saveForLater, moveToCart, removeSavedItem, toggleFollowSeller,
  ])
}
