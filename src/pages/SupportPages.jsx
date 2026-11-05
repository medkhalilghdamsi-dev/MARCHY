import { Link } from 'react-router-dom'
import { translateTree } from '../i18n/translate'

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


export { MarketplaceGuidePage, HelpCenterPage, NotFoundPage, SimplePage }
