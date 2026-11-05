import { Link, useLocation } from 'react-router-dom'
import { translateTree } from '../../i18n/translate'
import { useMarketplace } from '../../providers/MarketplaceContext'
import { House, Search, UserRound, Heart, ShoppingCart } from 'lucide-react'

export function MobileTabBar({ cartCount, wishlistCount }) {
  const { language } = useMarketplace()
  const { pathname } = useLocation()
  const active = path => path === '/' ? pathname === '/' : pathname === path || pathname.startsWith(path + '/')
  return translateTree(<nav className="mobile-tabbar" aria-label="Quick navigation">
    <Link to="/" className={active('/') ? 'is-active' : ''} aria-current={active('/') ? 'page' : undefined}>
      <span><House size={20}/></span><small>Home</small>
    </Link>
    <Link to="/search" className={active('/search') || active('/category') || active('/categories') ? 'is-active' : ''} aria-current={active('/search') || active('/category') || active('/categories') ? 'page' : undefined}>
      <span><Search size={20}/></span><small>Explore</small>
    </Link>
    <Link to="/wishlist" className={active('/wishlist') ? 'is-active' : ''} aria-current={active('/wishlist') ? 'page' : undefined} aria-label={wishlistCount ? `Saved products, ${wishlistCount} items` : 'Saved products'}>
      <span><Heart size={20}/>{wishlistCount > 0 && <i aria-hidden="true">{wishlistCount > 99 ? '99+' : wishlistCount}</i>}</span><small>Saved</small>
    </Link>
    <Link to="/cart" className={active('/cart') || active('/checkout') ? 'is-active' : ''} aria-current={active('/cart') || active('/checkout') ? 'page' : undefined} aria-label={cartCount ? `Shopping cart, ${cartCount} items` : 'Shopping cart'}>
      <span><ShoppingCart size={20}/>{cartCount > 0 && <i aria-hidden="true">{cartCount > 99 ? '99+' : cartCount}</i>}</span><small>Cart</small>
    </Link>
    <Link to="/account" className={active('/login') || active('/signup') || active('/account') ? 'is-active' : ''} aria-current={active('/login') || active('/signup') || active('/account') ? 'page' : undefined}>
      <span><UserRound size={20}/></span><small>Account</small>
    </Link>
  </nav>, language)
}
