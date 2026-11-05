import { Link } from 'react-router-dom'
import { translateTree } from '../../i18n/translate'
import { useMarketplace } from '../../providers/MarketplaceContext'
import { Compass, CircleHelp, Store, UserRound } from 'lucide-react'

export function Footer() {
  const { language } = useMarketplace()
  return translateTree(<footer className="footer"><div className="shell footer-main">
    <div className="footer-brand">
      <Link to="/" className="logo"><span className="logo-mark" aria-hidden="true">M</span><span className="logo-word">MARCHY</span><span className="logo-period" aria-hidden="true">.</span></Link>
      <p>Tunisia's marketplace for everyday discoveries.<br />Discover local sellers and products in one place.</p>
      <div className="footer-social"><span>🇹🇳 Built for Tunisia.</span></div>
    </div>
    <div>
      <b><Compass size={15}/> Discover</b>
      <Link to="/search">All products</Link>
      <Link to="/categories">Categories</Link>
      <Link to="/wishlist">Wishlist</Link>
      <Link to="/sellers">Find sellers</Link>
      <Link to="/search?deal=true">Today's deals</Link>
    </div>
    <div>
      <b><UserRound size={15}/> Your account</b>
      <Link to="/login">Sign in</Link>
      <Link to="/signup">Create an account</Link>
      <Link to="/account">Account overview</Link>
      <Link to="/orders">Order history</Link>
      <Link to="/wishlist">Saved products</Link>
    </div>
    <div>
      <b><Store size={15}/> Sell on MARCHY</b>
      <Link to="/sell">Start selling</Link>
      <Link to="/seller-dashboard">Seller workspace</Link>
      <Link to="/seller-help">Seller guide</Link>
    </div>
    <div>
      <b><CircleHelp size={15}/> Help & support</b>
      <Link to="/help">Contact us</Link>
      <Link to="/delivery">Delivery information</Link>
      <Link to="/returns">Returns & refunds</Link>
    </div>
  </div><div className="shell footer-bottom"><span>© 2026 MARCHY. All rights reserved.</span><span>Built for Tunisia.</span></div></footer>, language)
}

