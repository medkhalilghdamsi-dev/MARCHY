import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { categories, products } from '../data/products'
import { sellers, sellerByCategory, sellerForProduct } from '../data/sellers'
import { money, searchSynonyms, normalizeSearchText, searchTextMatches, readText, readJson, writeJson } from '../utils/marketplace'
import { translateTree } from '../i18n/translate'
import { ProductCard } from '../components/MarketplaceChrome'

function AccountPage({cart,wishlist,language}) {
 const cartItems=cart.reduce((sum,item)=>sum+item.qty,0)
 const savedProducts=products.filter(p=>wishlist.includes(p.id)).slice(0,3)
 const [recentIds,setRecentIds]=useState(()=>readJson('marchy-recently-viewed',[]))
 const recentProducts=recentIds.map(id=>products.find(p=>p.id===id)).filter(Boolean).slice(0,4)
 const clearRecentlyViewed=()=>{writeJson('marchy-recently-viewed',[]);setRecentIds([])}
 return translateTree(<main id="main-content" className="shell page account-page">
  <div className="breadcrumbs" role="navigation" aria-label="Breadcrumb"><Link to="/">Home</Link> / <span>Account</span></div>
  <section className="account-welcome"><div><span className="eyebrow">YOUR MARCHY</span><h1>Your shopping space.</h1><p>Keep track of the products you're considering and pick up where you left off.</p></div><div className="account-guest-status"><span className="account-guest-avatar">G</span><div><b>Guest browsing</b><small>You're exploring without signing in</small><span className="demo-label">PREVIEW MODE</span></div></div></section>
  <div className="account-overview-grid">
   <Link to="/cart" className="account-overview-card"><span className="account-overview-icon">🛒</span><span><small>YOUR BASKET</small><b>{cartItems}</b><em>Items in cart</em></span><i>→</i></Link>
   <Link to="/wishlist" className="account-overview-card"><span className="account-overview-icon">♡</span><span><small>SAVED COLLECTION</small><b>{wishlist.length}</b><em>Saved products</em></span><i>→</i></Link>
   <Link to="/sellers" className="account-overview-card"><span className="account-overview-icon">▤</span><span><small>DISCOVER LOCAL</small><b>{sellers.length}</b><em>Sample storefronts</em></span><i>→</i></Link>
  </div>
  <div className="account-content-grid">
   <section className="account-panel"><div className="account-panel-heading"><div><span className="eyebrow">YOUR SHORTLIST</span><h2>Recently saved</h2></div><Link to="/wishlist" className="text-link">View all →</Link></div>
    {savedProducts.length?<div className="account-saved-list">{savedProducts.map(p=><Link to={`/product/${p.id}`} className="account-saved-item" key={p.id}><img onError={e=>{e.currentTarget.onerror=null;e.currentTarget.src='/product-placeholder.svg'}} src={p.image} alt=""/><span><b>{p.name}</b><small>{p.category}</small></span><strong>{money(p.price)}</strong></Link>)}</div>:<div className="account-inline-empty"><span>♡</span><b>Your shortlist is empty</b><p>Save products with the heart button and they'll appear here.</p><Link to="/search" className="text-link">Explore products →</Link></div>}
   </section>
   <aside className="account-panel account-activity-panel"><span className="eyebrow">ACCOUNT ACTIVITY</span><h2>Orders & returns</h2><div className="account-activity-empty"><span>↗</span><b>No order history yet</b><p>Order tracking and returns aren't active in this frontend prototype. Your demo cart does not create an order.</p></div><Link to="/help" className="text-link">Visit help centre →</Link></aside>
  </div>
  {recentProducts.length>0&&<section className="account-recently-viewed"><div className="account-panel-heading"><div><span className="eyebrow">PICK UP WHERE YOU LEFT OFF</span><h2>Recently viewed</h2><p>Products you opened on this device.</p></div><button type="button" className="account-clear-recent" onClick={clearRecentlyViewed}>Clear history</button></div><div className="account-recent-grid">{recentProducts.map(p=><Link to={`/product/${p.id}`} className="account-recent-card" key={p.id}><img src={p.image} alt="" onError={e=>{e.currentTarget.onerror=null;e.currentTarget.src='/product-placeholder.svg'}}/><span><b>{p.name}</b><small>{p.category}</small><strong>{money(p.price)}</strong></span></Link>)}</div></section>}
  <section className="account-shortcuts"><div><span className="eyebrow">QUICK LINKS</span><h2>Explore MARCHY</h2></div><div><Link to="/categories">Browse categories <span>→</span></Link><Link to="/delivery">Delivery information <span>→</span></Link><Link to="/returns">Returns information <span>→</span></Link><Link to="/help">Help & support <span>→</span></Link></div></section>
  <p className="catalogue-note">This is a guest-mode frontend preview. No account, personal profile, order history or authentication is created or stored.</p>
 </main>,language)
}


function MarketplaceGuidePage({type,language}) {
 const delivery=type==='delivery'
 const title=delivery?'Delivery, clearly agreed.':'Know the return terms first.'
 const intro=delivery?'Delivery coverage, fees and timing can vary by seller. Confirm the details directly before placing any order.':'Return, exchange and refund terms may vary by seller. Agree the exact conditions before purchasing.'
 const items=delivery?[
  {title:'Delivery coverage',copy:'Confirm whether the seller delivers to your city, neighbourhood or preferred address.'},
  {title:'Total delivery cost',copy:'Ask whether the delivery fee is separate from the displayed product price and whether extra charges may apply.'},
  {title:'Estimated timing',copy:'Confirm preparation time, delivery window and how delays or failed delivery attempts are handled.'},
  {title:'Handover and inspection',copy:'Ask how the item will be handed over and whether you can inspect it before accepting it.'}
 ]:[
  {title:'Eligible return reasons',copy:'Ask which situations qualify for a return, exchange or refund, including damaged, incorrect or unsuitable items.'},
  {title:'Time limits',copy:'Confirm the number of days allowed and when that period starts.'},
  {title:'Item condition',copy:'Ask whether packaging, tags, accessories and proof of purchase must be retained.'},
  {title:'Costs and refund method',copy:'Confirm who pays return delivery and how and when an approved refund would be issued.'}
 ]
 return translateTree(<main id="main-content" className="shell page marketplace-guide-page">
  <div className="breadcrumbs" role="navigation" aria-label="Breadcrumb"><Link to="/">Home</Link> / <Link to="/help">Help & support</Link> / <span>{delivery?'Delivery':'Returns & refunds'}</span></div>
  <section className="marketplace-guide-hero"><span className="eyebrow">{delivery?'DELIVERY INFORMATION':'RETURNS & REFUNDS'}</span><h1>{title}</h1><p>{intro}</p><span className="guide-status-pill">PRE-LAUNCH INFORMATION · NO ACTIVE TRANSACTIONS</span></section>
  <div className="marketplace-guide-layout"><section className="guide-checklist"><div className="guide-section-heading"><span className="eyebrow">BUYER CHECKLIST</span><h2>{delivery?'What to confirm before delivery':'What to agree before you buy'}</h2><p>Use these points as a practical checklist when discussing a purchase with a seller.</p></div>{items.map((item,index)=><article className="guide-checklist-item" key={item.title}><span>{String(index+1).padStart(2,'0')}</span><div><h3>{item.title}</h3><p>{item.copy}</p></div></article>)}</section>
  <aside className="guide-note-panel"><span className="eyebrow">MARCHY STATUS</span><h2>This feature isn't active yet.</h2><p>MARCHY currently displays sample products and storefronts. It does not calculate delivery fees, arrange shipments, process returns or issue refunds.</p><div><b>Before any real purchase</b><span>Get the seller's terms in writing and keep a copy of your agreement.</span></div><Link to="/help" className="text-link">More help & FAQs →</Link></aside></div>
  <section className="guide-bottom-cta"><div><span className="eyebrow">NEED MORE CONTEXT?</span><h2>Check the product and seller details.</h2><p>Review the sample listing and storefront, then confirm all current information directly with the seller.</p></div><div><Link to="/search" className="primary-btn">Browse products →</Link><Link to="/sellers" className="outline-btn">Find storefronts</Link></div></section>
 </main>,language)
}


function HelpCenterPage({language}) {
 const topics=[
  {q:'Are the product prices and discounts live?',a:'No. The catalogue is illustrative. Displayed prices and previous prices are sample data and must not be treated as current seller offers.'},
  {q:'Can I place an order or pay on MARCHY?',a:'Not yet. The cart is a frontend preview only. Checkout, payments, order confirmation and seller stock checks are not connected.'},
  {q:'How can I confirm a product before buying?',a:'Open the product page and visit its sample storefront. In a live marketplace, buyers should confirm specifications, availability, final price and terms directly with the seller.'},
  {q:'Are the storefronts verified?',a:'No. The seller profiles currently shown are sample storefronts created for the frontend prototype. They have not been independently verified.'},
  {q:'How do delivery and returns work?',a:'Delivery and return services are not active in this prototype. The information pages explain what buyers should confirm before any future transaction.'},
  {q:'Can I register as a seller?',a:'Seller onboarding is not open yet. You can use the storefront planner and seller preparation guide to organise sample business and product information.'}
 ]
 return translateTree(<main id="main-content" className="shell page help-center-page">
  <div className="breadcrumbs" role="navigation" aria-label="Breadcrumb"><Link to="/">Home</Link> / <span>Help & support</span></div>
  <section className="help-center-hero"><span className="eyebrow">MARCHY SUPPORT</span><h1>Answers before you shop.</h1><p>Find out how the marketplace preview works and what to check before making a purchase decision.</p><Link to="/search" className="primary-btn">Explore the marketplace →</Link></section>
  <div className="help-center-layout"><section className="help-faq-section"><div className="help-section-heading"><span className="eyebrow">FREQUENTLY ASKED QUESTIONS</span><h2>Good to know</h2><p>Clear answers about the current MARCHY frontend prototype.</p></div><div className="help-faq-list">{topics.map((item,index)=><details className="help-faq-item" key={item.q} open={index===0}><summary><span>{item.q}</span><i>＋</i></summary><p>{item.a}</p></details>)}</div></section>
  <aside className="help-topic-panel"><span className="eyebrow">HELP TOPICS</span><h2>Find the right information.</h2><Link to="/delivery"><span>⌖</span><div><b>Delivery information</b><small>What to confirm about coverage, fees and timing</small></div><i>→</i></Link><Link to="/returns"><span>↩</span><div><b>Returns & refunds</b><small>Understand the current prototype limitations</small></div><i>→</i></Link><Link to="/seller-help"><span>▤</span><div><b>Seller preparation</b><small>Prepare a business and product listing</small></div><i>→</i></Link><div className="help-status-note"><b>Platform status</b><p>MARCHY is a frontend prototype. No support tickets, purchases or seller applications are currently processed.</p></div></aside></div>
 </main>,language)
}


function NotFoundPage({language}) {
 return translateTree(<main id="main-content" className="shell page not-found-page"><div className="not-found-visual"><span>4</span><b>MARCHY<span>.</span></b><span>4</span></div><span className="eyebrow">PAGE NOT FOUND</span><h1>This page isn't here.</h1><p>The link may be incorrect or the page may have moved. Let's get you back to something useful.</p><div className="not-found-actions"><Link to="/" className="primary-btn">Back to home →</Link><Link to="/search" className="outline-btn">Explore products</Link><Link to="/categories" className="text-link">Browse categories</Link></div></main>,language)
}


function SimplePage({ title, eyebrow, text, language }) { return translateTree(<main id="main-content" className="shell page simple-page"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p className="muted">{text}</p><Link to="/search" className="primary-btn">Explore the marketplace →</Link></main>,language) }


export { AccountPage, MarketplaceGuidePage, HelpCenterPage, NotFoundPage, SimplePage }
