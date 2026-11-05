import { useState } from 'react'
import { Link } from 'react-router-dom'
import { products } from '../data/products'
import { sellers } from '../data/sellers'
import { money, readJson, writeJson } from '../utils/marketplace'
import { translateTree } from '../i18n/translate'
import { useDemoOrders } from '../hooks/useDemoOrders'

function AccountPage({cart,wishlist,language}) {
 const {orders}=useDemoOrders()
 const cartItems=cart.reduce((sum,item)=>sum+item.qty,0)
 const savedProducts=products.filter(p=>wishlist.includes(p.id)).slice(0,3)
 const [recentIds,setRecentIds]=useState(()=>readJson('marchy-recently-viewed',[]))
 const recentProducts=recentIds.map(id=>products.find(p=>p.id===id)).filter(Boolean).slice(0,4)
 const clearRecentlyViewed=()=>{writeJson('marchy-recently-viewed',[]);setRecentIds([])}
 return translateTree(<main id="main-content" className="shell page account-page">
  <div className="breadcrumbs" role="navigation" aria-label="Breadcrumb"><Link to="/">Home</Link> / <span>Account</span></div>
  <section className="account-welcome"><div><span className="eyebrow">YOUR MARCHY</span><h1>Your shopping space.</h1><p>Keep track of the products you're considering and pick up where you left off.</p></div><div className="account-guest-status"><span className="account-guest-avatar">G</span><div><b>Guest browsing</b><small>You're exploring without signing in</small><span className="demo-label">PREVIEW MODE</span></div></div></section>
  <section className="account-auth-prompt"><div><span className="eyebrow">YOUR MARCHY PROFILE</span><h2>Make your next visit feel familiar.</h2><p>Sign in or create an account to prepare for a more personal shopping experience.</p></div><div><Link to="/login" className="outline-btn">Sign in</Link><Link to="/signup" className="primary-btn">Create account →</Link></div></section>
  <div className="account-overview-grid">
   <Link to="/cart" className="account-overview-card"><span className="account-overview-icon">🛒</span><span><small>YOUR BASKET</small><b>{cartItems}</b><em>Items in cart</em></span><i>→</i></Link>
   <Link to="/wishlist" className="account-overview-card"><span className="account-overview-icon">♡</span><span><small>SAVED COLLECTION</small><b>{wishlist.length}</b><em>Saved products</em></span><i>→</i></Link>
   <Link to="/sellers" className="account-overview-card"><span className="account-overview-icon">▤</span><span><small>DISCOVER LOCAL</small><b>{sellers.length}</b><em>Sample storefronts</em></span><i>→</i></Link>
  </div>
  <div className="account-content-grid">
   <section className="account-panel"><div className="account-panel-heading"><div><span className="eyebrow">YOUR SHORTLIST</span><h2>Recently saved</h2></div><Link to="/wishlist" className="text-link">View all →</Link></div>
    {savedProducts.length?<div className="account-saved-list">{savedProducts.map(p=><Link to={`/product/${p.id}`} className="account-saved-item" key={p.id}><img onError={e=>{e.currentTarget.onerror=null;e.currentTarget.src='/product-placeholder.svg'}} src={p.image} alt=""/><span><b>{p.name}</b><small>{p.category}</small></span><strong>{money(p.price)}</strong></Link>)}</div>:<div className="account-inline-empty"><span>♡</span><b>Your shortlist is empty</b><p>Save products with the heart button and they'll appear here.</p><Link to="/search" className="text-link">Explore products →</Link></div>}
   </section>
   <aside className="account-panel account-activity-panel"><span className="eyebrow">ORDER ACTIVITY · DEMO</span><h2>Example order tracking</h2><p className="account-demo-caption">Sample orders demonstrate how buyer tracking connects to merchant and delivery updates. They are not linked to your guest account.</p><div className="account-demo-orders">{orders.slice(0,3).map(order=><Link className="account-demo-order" to={'/orders/' + order.id} key={order.id}><span><b>{order.id}</b><small>{order.buyer} · {order.city}</small></span><span className="account-demo-order-status">{order.status}</span><strong>{money(order.total)}</strong></Link>)}</div><div className="account-orders-links"><Link to="/orders" className="text-link">View all orders →</Link><Link to="/help" className="text-link">Visit help centre →</Link></div></aside>
  </div>
  {recentProducts.length>0&&<section className="account-recently-viewed"><div className="account-panel-heading"><div><span className="eyebrow">PICK UP WHERE YOU LEFT OFF</span><h2>Recently viewed</h2><p>Products you opened on this device.</p></div><button type="button" className="account-clear-recent" onClick={clearRecentlyViewed}>Clear history</button></div><div className="account-recent-grid">{recentProducts.map(p=><Link to={`/product/${p.id}`} className="account-recent-card" key={p.id}><img src={p.image} alt="" onError={e=>{e.currentTarget.onerror=null;e.currentTarget.src='/product-placeholder.svg'}}/><span><b>{p.name}</b><small>{p.category}</small><strong>{money(p.price)}</strong></span></Link>)}</div></section>}
  <section className="account-shortcuts"><div><span className="eyebrow">QUICK LINKS</span><h2>Explore MARCHY</h2></div><div><Link to="/categories">Browse categories <span>→</span></Link><Link to="/delivery">Delivery information <span>→</span></Link><Link to="/returns">Returns information <span>→</span></Link><Link to="/help">Help & support <span>→</span></Link></div></section>
  <p className="catalogue-note">This is a guest-mode frontend preview. No account, personal profile, order history or authentication is created or stored.</p>
 </main>,language)
}

export { AccountPage }
