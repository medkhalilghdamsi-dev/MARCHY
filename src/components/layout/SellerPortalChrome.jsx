import { Link, useLocation } from 'react-router-dom'
import { ArrowUpRight, LayoutDashboard, Store, BookOpen } from 'lucide-react'

const links=[
 {to:'/sell',label:'Start selling',icon:Store},
 {to:'/seller-central',label:'Seller Central',icon:LayoutDashboard},
 {to:'/seller-help',label:'Seller guide',icon:BookOpen}
]
export function SellerPortalHeader(){
 const {pathname}=useLocation()
 return <header className="seller-portal-header">
  <div className="seller-portal-topline"><div className="seller-portal-container"><span>SELLER SERVICES · TUNISIA</span><span>Marketplace preview · Seller tools are not connected to live operations</span></div></div>
  <div className="seller-portal-container seller-portal-header-main">
   <Link to="/sell" className="seller-portal-brand" aria-label="MARCHY Seller home"><span className="seller-portal-mark">M</span><span>MARCHY<small>SELLER</small></span></Link>
   <nav className="seller-portal-nav" aria-label="Seller navigation">{links.map(({to,label,icon:Icon})=><Link key={to} to={to} className={pathname===to?'active':''} aria-current={pathname===to?'page':undefined}><Icon size={16}/>{label}</Link>)}</nav>
   <Link to="/" className="seller-portal-store-link">Visit marketplace <ArrowUpRight size={15}/></Link>
  </div>
 </header>
}
export function SellerPortalFooter(){
 return <footer className="seller-portal-footer"><div className="seller-portal-container"><div><b>MARCHY Seller</b><span>Tools to prepare and manage your business on the marketplace.</span></div><nav aria-label="Seller footer navigation"><Link to="/seller-help">Seller guide</Link><Link to="/seller-central">Seller Central</Link><Link to="/help">Marketplace help</Link><Link to="/">Back to shopping</Link></nav><small>Seller experience preview · Tunisia</small></div></footer>
}
