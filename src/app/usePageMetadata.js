import { useEffect } from 'react'
import { categories, products } from '../data/products'
import { sellers } from '../data/sellers'

const STATIC_PAGE_TITLES = {
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

/** Keep document titles in one place, derived from the active route. */
export function usePageMetadata(location) {
  useEffect(() => {
    const { pathname, search } = location
    const params = new URLSearchParams(search)
    const query = params.get('q')
    let title = 'Discover local products and stores'

    if (pathname === '/') title = 'Discover more, closer to home'
    else if (pathname === '/search') title = query ? 'Search results for ' + query : 'Shop the marketplace'
    else if (pathname.startsWith('/category/')) {
      const slug = decodeURIComponent(pathname.split('/').pop() || '')
      const category = categories.find(item => item.toLowerCase() === slug.toLowerCase())
      title = category ? category + ' products' : 'Category not found'
    } else if (pathname.startsWith('/product/')) {
      const product = products.find(item => item.id === Number(pathname.split('/').pop()))
      title = product ? product.name : 'Product not found'
    } else if (pathname.startsWith('/orders/')) {
      title = 'Order tracking ' + pathname.split('/').pop()
    } else if (pathname.startsWith('/seller/')) {
      const seller = sellers.find(item => item.slug === pathname.split('/').pop())
      title = seller ? seller.name : 'Seller storefront'
    } else {
      title = STATIC_PAGE_TITLES[pathname] || 'Page not found'
    }

    document.title = title + ' | MARCHY'
  }, [location.pathname, location.search])
}
