import { useEffect, useState } from 'react'
import { readText, readJson, writeJson } from '../utils/marketplace'
import { sellers, sellerForProduct } from '../data/sellers'
import { products } from '../data/products'
import { createDemoOrders } from '../data/demoOrders'

export function useMarketplaceState() {
  const [language, setLanguage] = useState(() => {
    const saved = readText('marchy-language', 'en')
    return ['en', 'fr', 'ar'].includes(saved) ? saved : 'en'
  })
  const [cart, setCart] = useState(() => readJson('marchy-cart', []))
  const [wishlist, setWishlist] = useState(() => readJson('marchy-wishlist', []))

  useEffect(() => {
    try { localStorage.setItem('marchy-language', language) } catch {}
    document.documentElement.lang = language
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
  }, [language])

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

  function placeDemoOrder(details, items) {
    const existing = readJson('marchy-demo-orders', null) || createDemoOrders(sellers, products, sellerForProduct)
    const groups = [...new Set(items.map(item => sellerForProduct(item).slug))].map(slug => ({ seller: sellers.find(entry => entry.slug === slug), items: items.filter(item => sellerForProduct(item).slug === slug) }))
    const now = Date.now()
    const createdAt = new Date().toISOString().slice(0, 10)
    const newOrders = groups.map((group, index) => ({
      id: `MCH-DEMO-${String(now).slice(-7)}${index ? `-${index + 1}` : ''}`,
      customer: details.name, city: details.city, createdAt, status: 'pending',
      sellerSlug: group.seller.slug, sellerName: group.seller.name,
      items: group.items.map(item => ({ id: item.id, name: item.name, quantity: item.qty, price: item.price })),
      deliveryMethod: 'Seller to confirm', trackingReference: 'Not assigned',
      paymentStatus: 'Not collected · demo only', deliveryAddress: `${details.address}, ${details.city}`,
      customerPhone: details.phone, deliveryNotes: details.notes || ''
    }))
    writeJson('marchy-demo-orders', [...newOrders, ...existing])
    setCart([])
    return newOrders.map(order => order.id)
  }

  function toggleWish(id) {
    setWishlist(previous => previous.includes(id)
      ? previous.filter(item => item !== id)
      : [...previous, id])
  }

  return {
    language, setLanguage, cart, wishlist,
    addToCart, updateQty, removeItem, toggleWish, placeDemoOrder,
  }
}
