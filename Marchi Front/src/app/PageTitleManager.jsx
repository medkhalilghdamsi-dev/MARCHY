import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export function PageTitleManager() {
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
          storage.writeJson(
            'marchy-recently-viewed',
            [product.id, ...previous.filter(item => item !== product.id)].slice(0, 8)
          )
        }
      } else if (path.startsWith('/orders/')) title = 'Order tracking ' + path.split('/').pop()
      else if (path.startsWith('/order-confirmation/')) title = 'Order Confirmed #' + path.split('/').pop()
      else if (path.startsWith('/checkout')) title = 'Checkout & Order Placement'
      else if (path.startsWith('/seller/')) {
        const { sellers } = await import('../data/sellers')
        const seller = sellers.find(item => item.slug === path.split('/').pop())
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
