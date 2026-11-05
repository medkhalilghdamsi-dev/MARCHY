import { Link } from 'react-router-dom'
import { translateTree } from '../../i18n/translate'
import { useMarketplace } from '../../providers/MarketplaceContext'

export function MarketplaceGuidePage({ type }) {
 const { language } = useMarketplace()
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
