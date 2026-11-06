import { products as initialProducts, categories as initialCategories, mockReviews } from '../data/products'
import { sellers } from '../data/sellers'
import { readJson, writeJson } from '../utils/marketplace'
import { DEFAULT_OFFERS, DEFAULT_QA, DEFAULT_PROMOTIONS, DEFAULT_NOTIFICATIONS } from '../data/marketplaceDemoData'

const PRODUCTS_KEY = 'marchy-live-products'
const OFFERS_KEY = 'marchy-seller-offers'
const INVENTORY_KEY = 'marchy-inventory-records'
const QA_KEY = 'marchy-product-qa'
const PROMOTIONS_KEY = 'marchy-active-promotions'
const NOTIFICATIONS_KEY = 'marchy-notifications-feed'
const COMPARE_KEY = 'marchy-compare-tray'

export const MarketplaceService = {
  // 1. Products & Master Catalog
  getProducts() {
    const custom = readJson(PRODUCTS_KEY, [])
    const combined = [...initialProducts]
    // prepend or replace custom products
    custom.forEach(cp => {
      const idx = combined.findIndex(p => p.id === cp.id)
      if (idx >= 0) combined[idx] = cp
      else combined.unshift(cp)
    })
    return combined
  },

  getProductById(id) {
    const numId = Number(id)
    return this.getProducts().find(p => p.id === numId) || null
  },

  publishProduct(productData) {
    const current = readJson(PRODUCTS_KEY, [])
    const newId = productData.id || (1000 + Date.now() % 90000)
    const product = {
      ...productData,
      id: newId,
      rating: productData.rating || 5.0,
      reviewCount: productData.reviewCount || 1,
      badge: 'New Seller Listing',
      stock: Number(productData.stock) > 0 ? 'In stock' : 'Out of stock'
    }
    const updated = [product, ...current.filter(p => p.id !== newId)]
    writeJson(PRODUCTS_KEY, updated)

    // Automatically create a seller offer for this listing
    this.addSellerOffer({
      id: `off-${newId}-${Date.now()}`,
      productId: newId,
      sellerSlug: productData.sellerSlug || 'atlas-tech-tunis',
      sellerName: productData.seller || 'Atlas Tech',
      sellerCity: productData.city || 'Tunis',
      sellerRating: 4.9,
      price: Number(productData.price) || 0,
      oldPrice: productData.oldPrice ? Number(productData.oldPrice) : null,
      condition: productData.condition || 'Brand New',
      shippingFee: 0,
      deliveryTime: '24–48h express',
      stock: Number(productData.stock) || 10,
      isFeatured: true
    })

    // Add notification
    this.addNotification({
      title: 'New Product Published',
      message: `Your listing "${product.name}" is now live in the MARCHY marketplace catalogue.`,
      type: 'seller',
      link: `/product/${newId}`
    })

    return product
  },

  updateProduct(id, updates) {
    const current = readJson(PRODUCTS_KEY, [])
    const all = this.getProducts()
    const target = all.find(p => p.id === Number(id))
    if (!target) return null
    const updatedProduct = { ...target, ...updates }
    const filtered = current.filter(p => p.id !== Number(id))
    writeJson(PRODUCTS_KEY, [updatedProduct, ...filtered])
    return updatedProduct
  },

  deleteProduct(id) {
    const numId = Number(id)
    const current = readJson(PRODUCTS_KEY, [])
    writeJson(PRODUCTS_KEY, current.filter(p => p.id !== numId))
  },

  // 2. Multi-Seller Offers
  getProductOffers(productId) {
    const numId = Number(productId)
    const stored = readJson(OFFERS_KEY, DEFAULT_OFFERS)
    const offers = stored[numId] || []
    const inventory = readJson(INVENTORY_KEY, {})
    
    // If no explicit multi-offers, create a default offer from the product itself
    if (offers.length === 0) {
      const prod = this.getProductById(numId)
      if (prod) {
        return [{
          id: `off-default-${numId}`,
          productId: numId,
          sellerSlug: 'atlas-tech-tunis',
          sellerName: prod.seller || 'Atlas Tech',
          sellerCity: 'Tunis',
          sellerRating: prod.rating || 4.7,
          price: prod.price,
          oldPrice: prod.oldPrice || null,
          condition: 'Brand New',
          shippingFee: 0,
          deliveryTime: '24–48h courier',
          stock: inventory[`atlas-tech-tunis-${numId}`] ?? 15,
          isFeatured: true
        }]
      }
    }
    return offers.map(offer => ({
      ...offer,
      stock: inventory[`${offer.sellerSlug}-${numId}`] ?? offer.stock
    }))
  },

  addSellerOffer(offer) {
    const stored = readJson(OFFERS_KEY, DEFAULT_OFFERS)
    const pId = Number(offer.productId)
    const list = stored[pId] || []
    const updated = {
      ...stored,
      [pId]: [offer, ...list.filter(o => o.sellerSlug !== offer.sellerSlug)]
    }
    writeJson(OFFERS_KEY, updated)
  },

  // 3. Live Inventory Controller
  getInventory(sellerSlug) {
    const inventory = readJson(INVENTORY_KEY, {})
    const products = this.getProducts()
    const sellerProducts = products.filter(p => {
      const offers = this.getProductOffers(p.id)
      return offers.some(o => o.sellerSlug === sellerSlug) || p.sellerSlug === sellerSlug
    })

    return sellerProducts.map(p => {
      const offers = this.getProductOffers(p.id)
      const sellerOffer = offers.find(o => o.sellerSlug === sellerSlug)
      const currentStock = inventory[`${sellerSlug}-${p.id}`] ?? sellerOffer?.stock ?? 12
      return {
        productId: p.id,
        name: p.name,
        category: p.category,
        image: p.image,
        price: sellerOffer?.price || p.price,
        stock: currentStock,
        status: currentStock > 5 ? 'In Stock' : currentStock > 0 ? 'Low Stock' : 'Out of Stock',
        lowStockThreshold: 5
      }
    })
  },

  updateStock(sellerSlug, productId, newStock) {
    const normalizedStock = Math.max(0, Number(newStock) || 0)
    const inventory = readJson(INVENTORY_KEY, {})
    inventory[`${sellerSlug}-${productId}`] = normalizedStock
    writeJson(INVENTORY_KEY, inventory)

    const storedOffers = readJson(OFFERS_KEY, DEFAULT_OFFERS)
    const productOffers = storedOffers[Number(productId)] || []
    if (productOffers.length) {
      const updatedOffers = productOffers.map(offer =>
        offer.sellerSlug === sellerSlug ? { ...offer, stock: normalizedStock } : offer
      )
      writeJson(OFFERS_KEY, { ...storedOffers, [Number(productId)]: updatedOffers })
    }

    // Trigger notification if low stock
    if (normalizedStock <= 3) {
      this.addNotification({
        title: '⚠️ Low Stock Alert',
        message: `Stock for item #${productId} dropped to ${normalizedStock} units. Consider replenishing.`,
        type: 'inventory',
        link: '/seller-dashboard'
      })
    }
  },

  decrementInventory(orderItems) {
    const inventory = readJson(INVENTORY_KEY, {})
    const storedOffers = readJson(OFFERS_KEY, DEFAULT_OFFERS)
    const updatedOffers = { ...storedOffers }

    orderItems.forEach(item => {
      const slug = item.sellerSlug || 'atlas-tech-tunis'
      const productId = Number(item.id)
      const key = `${slug}-${productId}`
      const offers = updatedOffers[productId] || []
      const offer = offers.find(entry => entry.sellerSlug === slug)
      const current = inventory[key] ?? offer?.stock ?? 12
      const nextStock = Math.max(0, current - (item.qty || 1))
      inventory[key] = nextStock
      if (offer) {
        updatedOffers[productId] = offers.map(entry =>
          entry.sellerSlug === slug ? { ...entry, stock: nextStock } : entry
        )
      }
    })

    writeJson(INVENTORY_KEY, inventory)
    writeJson(OFFERS_KEY, updatedOffers)
  },

  // 4. Product Q&A
  getProductQA(productId) {
    const stored = readJson(QA_KEY, DEFAULT_QA)
    return stored[Number(productId)] || []
  },

  askQuestion(productId, questionText, author = 'Customer') {
    const stored = readJson(QA_KEY, DEFAULT_QA)
    const pId = Number(productId)
    const list = stored[pId] || []
    const newQ = {
      id: `qa-${pId}-${Date.now()}`,
      productId: pId,
      author: author.trim() || 'Tunisian Shopper',
      date: new Date().toISOString().split('T')[0],
      question: questionText.trim(),
      answers: []
    }
    const updated = { ...stored, [pId]: [newQ, ...list] }
    writeJson(QA_KEY, updated)

    this.addNotification({
      title: 'New Customer Question',
      message: `A buyer asked: "${questionText.slice(0, 45)}..." on product #${pId}`,
      type: 'qa',
      link: `/product/${pId}`
    })

    return newQ
  },

  answerQuestion(productId, questionId, answerText, sellerName = 'Verified Merchant') {
    const stored = readJson(QA_KEY, DEFAULT_QA)
    const pId = Number(productId)
    const list = stored[pId] || []
    const updatedList = list.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          answers: [
            ...q.answers,
            {
              id: `ans-${Date.now()}`,
              author: sellerName,
              isSeller: true,
              date: new Date().toISOString().split('T')[0],
              answer: answerText.trim()
            }
          ]
        }
      }
      return q
    })
    const updated = { ...stored, [pId]: updatedList }
    writeJson(QA_KEY, updated)
  },

  // 5. Promotions
  getPromotions() {
    return readJson(PROMOTIONS_KEY, DEFAULT_PROMOTIONS)
  },

  createPromotion(promo) {
    const list = this.getPromotions()
    const newPromo = {
      ...promo,
      code: promo.code.trim().toUpperCase(),
      active: true,
      createdAt: new Date().toISOString()
    }
    const updated = [newPromo, ...list.filter(p => p.code !== newPromo.code)]
    writeJson(PROMOTIONS_KEY, updated)

    this.addNotification({
      title: 'Promotional Campaign Active',
      message: `Coupon code ${newPromo.code} (${newPromo.label}) is now live for buyers.`,
      type: 'promo',
      link: '/cart'
    })

    return newPromo
  },

  validateCoupon(code, subtotal) {
    if (!code) return { valid: false, message: 'Please enter a coupon code' }
    const promos = this.getPromotions()
    const found = promos.find(p => p.code === code.trim().toUpperCase() && p.active)
    if (!found) return { valid: false, message: 'Invalid or expired coupon code' }
    if (found.minSpend && subtotal < found.minSpend) {
      return { valid: false, message: `Minimum order of ${found.minSpend} TND required for this code` }
    }
    const discount = found.type === 'percentage'
      ? (subtotal * found.value) / 100
      : Math.min(found.value, subtotal)
    return {
      valid: true,
      code: found.code,
      discount: Math.round(discount * 1000) / 1000,
      label: found.label
    }
  },

  // 6. Notifications
  getNotifications() {
    return readJson(NOTIFICATIONS_KEY, DEFAULT_NOTIFICATIONS)
  },

  markAsRead(id) {
    const list = this.getNotifications()
    const updated = list.map(n => n.id === id ? { ...n, read: true } : n)
    writeJson(NOTIFICATIONS_KEY, updated)
    return updated
  },

  markAllAsRead() {
    const list = this.getNotifications()
    const updated = list.map(n => ({ ...n, read: true }))
    writeJson(NOTIFICATIONS_KEY, updated)
    return updated
  },

  addNotification(notif) {
    const list = this.getNotifications()
    const newNotif = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      time: 'Just now',
      read: false,
      ...notif
    }
    const updated = [newNotif, ...list].slice(0, 20)
    writeJson(NOTIFICATIONS_KEY, updated)
    return newNotif
  },

  // 7. Global Compare
  getCompareIds() {
    return readJson(COMPARE_KEY, [])
  },

  toggleCompare(id) {
    const current = this.getCompareIds()
    const numId = Number(id)
    const next = current.includes(numId)
      ? current.filter(i => i !== numId)
      : [...current, numId].slice(-3) // Max 3 items compared
    writeJson(COMPARE_KEY, next)
    return next
  },

  clearCompare() {
    writeJson(COMPARE_KEY, [])
    return []
  }
}
