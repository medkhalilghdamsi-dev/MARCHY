import { Link, useLocation } from 'react-router-dom'
import { translateTree } from '../../i18n/translate'
import { useMarketplace } from '../../providers/MarketplaceContext'

export function MobileTabBar({ cartCount, wishlistCount }) {
  const { language } = useMarketplace()
  const { pathname } = useLocation()
  const active = path => path === '/' ? pathname === '/' : pathname === path || pathname.startsWith(path + '/')
  return translateTree(<nav className="mobile-tabbar" aria-label="Quick navigation">
    <Link to="/" className={active('/') ? 'is-active' : ''} aria-current={active('/') ? 'page' : undefined}><span>⌂</span><small>Home</small></Link>
    <Link to="/search" className={active('/search') || active('/category') ? 'is-active' : ''} aria-current={active('/search') || active('/category') ? 'page' : undefined}><span>⌕</span><small>Search</small></Link>
    <Link to="/sellers" className={active('/sellers') || active('/seller') ? 'is-active' : ''} aria-current={active('/sellers') || active('/seller') ? 'page' : undefined}><span>▤</span><small>Sellers</small></Link>
    <Link to="/account" className={active('/login') || active('/signup') || active('/account') ? 'is-active' : ''} aria-current={active('/login') || active('/signup') || active('/account') ? 'page' : undefined}><span>♙</span><small>Account</small></Link>
    <Link to="/wishlist" className={active('/wishlist') ? 'is-active' : ''} aria-current={active('/wishlist') ? 'page' : undefined}><span>♡<i>{wishlistCount || null}</i></span><small>Saved</small></Link>
    <Link to="/cart" className={active('/cart') ? 'is-active' : ''} aria-current={active('/cart') ? 'page' : undefined}><span>🛒<i>{cartCount || null}</i></span><small>Cart</small></Link>
  </nav>, language)
}
