import { useEffect, useState } from 'react'
import { readText, readJson, writeJson } from '../utils/marketplace'

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

  useEffect(() => {
    try { localStorage.setItem('marchy-language', language) } catch {}
    document.documentElement.lang = language
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
  }, [language])

  useEffect(() => {
    try { localStorage.setItem('marchy-theme', theme) } catch {}
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme
  }, [theme])

  useEffect(() => { writeJson('marchy-cart', cart) }, [cart])
  useEffect(() => { writeJson('marchy-wishlist', wishlist) }, [wishlist])

  function addToCart(product, qty = 1) {
    setCart(previous => {
      const found = previous.find(item => item.id === product.id)
      return found
        ? previous.map(item => item.id === product.id ? { ...item, qty: item.qty + qty } : item)
        : [...previous, { ...product, qty }]
    })
  }

  function updateQty(id, qty) {
    if (qty < 1) return
    setCart(previous => previous.map(item => item.id === id ? { ...item, qty } : item))
  }

  function removeItem(id) {
    setCart(previous => previous.filter(item => item.id !== id))
  }

  function toggleWish(id) {
    setWishlist(previous => previous.includes(id)
      ? previous.filter(item => item !== id)
      : [...previous, id])
  }

  return {
    language, setLanguage, theme, setTheme, cart, wishlist,
    addToCart, updateQty, removeItem, toggleWish,
  }
}
