import { useState } from 'react'
import { Link } from 'react-router-dom'
import { products } from '../../data/products'
import { sellers, sellerForProduct } from '../../data/sellers'
import { money, searchTextMatches, readJson, writeJson } from '../../utils/marketplace'
import { translateTree } from '../../i18n/translate'
import { useMarketplace } from '../../providers/MarketplaceContext'
import { useToast } from '../../providers/ToastProvider'
import { useDemoOrders } from '../../hooks/useDemoOrders'
import { MarketplaceService } from '../../services/marketplaceService'
import { SellerAnalytics } from '../../components/seller/SellerAnalytics'
import { SellerSettings } from '../../components/seller/SellerSettings'
import { SellerInventoryManager } from '../../components/seller/SellerInventoryManager'
import { SellerPromotionsManager } from '../../components/seller/SellerPromotionsManager'
import { SellerReviewsManager } from '../../components/seller/SellerReviewsManager'

export function SellerDashboardPage() {
  const { language } = useMarketplace()
  const toast = useToast()
  const [sellerSlug, setSellerSlug] = useState(sellers[0].slug)
  const [tab, setTab] = useState('overview')
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [showDraftForm, setShowDraftForm] = useState(false)
  const [draftTitle, setDraftTitle] = useState('')
  const [draftCategory, setDraftCategory] = useState('General')
  const [draftPrice, setDraftPrice] = useState('')
  const [draftDescription, setDraftDescription] = useState('')
  const [draftFeedback, setDraftFeedback] = useState('')
  const [editingDraftId, setEditingDraftId] = useState(null)
  const [drafts, setDrafts] = useState(() => readJson('marchy-seller-drafts', []))
  const seller = sellers.find(s => s.slug === sellerSlug) || sellers[0]
  const { orders, updateOrder } = useDemoOrders()
  const sellerOrders = orders.filter(order => order.seller === seller.name)
  const sellerDrafts = drafts.filter(d => d.sellerSlug === sellerSlug)

  const resetDraftForm = () => {
    setDraftTitle('')
    setDraftCategory('General')
    setDraftPrice('')
    setDraftDescription('')
    setEditingDraftId(null)
    setShowDraftForm(false)
  }

  const editDraft = d => {
    setDraftTitle(d.title || '')
    setDraftCategory(d.category || 'General')
    setDraftPrice(String(d.price ?? ''))
    setDraftDescription(d.description || '')
    setEditingDraftId(d.id)
    setShowDraftForm(true)
    setDraftFeedback('')
  }

  const saveDraft = (e, shouldPublish = false) => {
    e.preventDefault()
    const existing = drafts.find(d => d.id === editingDraftId && d.sellerSlug === sellerSlug)
    const draft = {
      id: existing?.id || `draft-${Date.now()}`,
      sellerSlug,
      title: draftTitle.trim(),
      category: draftCategory.trim() || 'General',
      price: Number(draftPrice),
      description: draftDescription.trim(),
      status: shouldPublish ? 'Published' : 'Draft',
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    if (shouldPublish) {
      MarketplaceService.publishProduct({
        id: Date.now() % 100000,
        name: draft.title,
        category: draft.category,
        price: draft.price,
        oldPrice: null,
        description: draft.description,
        seller: seller.name,
        sellerSlug: seller.slug,
        city: seller.city,
        image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=900&q=85',
        stock: 12
      })
      toast(`Listing "${draft.title}" published live to the MARCHY marketplace!`, { type: 'success' })
    }

    const next = existing ? drafts.map(d => d.id === existing.id ? draft : d) : [draft, ...drafts]
    setDrafts(next)
    writeJson('marchy-seller-drafts', next)
    resetDraftForm()
    setDraftFeedback(shouldPublish ? 'Listing published to marketplace!' : existing ? 'Draft updated on this device' : 'Draft saved on this device')
  }

  const allProducts = MarketplaceService.getProducts()
  const sellerProducts = allProducts.filter(p => sellerForProduct(p).slug === seller.slug || p.sellerSlug === seller.slug)
  const categoriesForSeller = ['All', ...new Set(sellerProducts.map(p => p.category))]
  const visible = sellerProducts.filter(p => (category === 'All' || p.category === category) && searchTextMatches([p.name, p.category, p.description || ''].join(' '), query))

  const tabs = [
    ['overview', 'Overview', '⌂'],
    ['orders', 'Orders', '⇄'],
    ['products', 'Products', '▦'],
    ['inventory', 'Inventory', '📦'],
    ['promotions', 'Promotions', '🏷'],
    ['reviews', 'Reviews', '★'],
    ['storefront', 'Storefront', '▤'],
    ['insights', 'Insights', '↗'],
    ['settings', 'Settings', '⚙']
  ]
 return translateTree(<main id="main-content" className="shell page seller-dashboard-page">
  <div className="breadcrumbs" role="navigation" aria-label="Breadcrumb"><Link to="/">Home</Link> / <Link to="/sell">Sell on MARCHY</Link> / <span>Seller workspace</span></div>
  <section className="seller-dashboard-heading"><div><span className="eyebrow">MARCHY SELLER CENTRE</span><h1>Your seller workspace.</h1><p>Explore how a seller dashboard could organise products, storefront details and insights.</p></div><span className="seller-dashboard-demo">DEMO WORKSPACE · SAMPLE DATA</span></section>
  <div className="seller-dashboard-shell">
   <aside className="seller-dashboard-sidebar"><div className="seller-dashboard-shop"><span className="seller-avatar">{seller.name.slice(0,1)}</span><div><b>{seller.name}</b><small>{seller.city}, Tunisia</small></div></div><label className="seller-dashboard-select">Preview storefront<select value={sellerSlug} onChange={e=>setSellerSlug(e.target.value)}>{sellers.map(s=><option key={s.slug} value={s.slug}>{s.name}</option>)}</select></label><nav aria-label="Seller dashboard sections">{tabs.map(([id,label,icon])=><button type="button" key={id} className={tab===id?'active':''} onClick={()=>setTab(id)} aria-current={tab===id?'page':undefined}><span>{icon}</span>{label}{tab===id&&<i>›</i>}</button>)}</nav><div className="seller-dashboard-sidebar-note"><b>Prototype workspace</b><span>Changes here do not update a real seller account or catalogue.</span></div><div className="seller-ops-links"><Link to="/operations/delivery">↗ Delivery operations</Link><Link to="/admin">↗ Platform admin</Link></div></aside>
   <section className="seller-dashboard-main">
    <div className="seller-dashboard-main-heading">
      <div>
        <span className="eyebrow">{tab.toUpperCase()} · SELLER WORKSPACE</span>
        <h2>{tab==='overview'?'Store overview':tab==='orders'?'Customer orders':tab==='products'?'Product listings':tab==='inventory'?'Inventory management':tab==='promotions'?'Discounts & campaigns':tab==='reviews'?'Customer feedback':tab==='storefront'?'Storefront profile':tab==='insights'?'Store insights':'Workspace settings'}</h2>
      </div>
      <button type="button" className="primary-btn" onClick={() => { setTab('products'); setShowDraftForm(true); }}>
        ＋ Create & Publish Listing
      </button>
    </div>
    {tab==='overview'&&<><div className="seller-dashboard-stats"><article><span>CATALOGUE LISTINGS</span><b>{sellerProducts.length}</b><small>Sample products mapped to this shop</small></article><article><span>CATEGORIES</span><b>{new Set(sellerProducts.map(p=>p.category)).size}</b><small>Categories represented in demo data</small></article><article><span>STOREFRONT LOCATION</span><b>{seller.city}</b><small>Illustrative seller profile</small></article></div><div className="seller-dashboard-panels"><article className="seller-dashboard-panel"><div className="seller-dashboard-panel-heading"><div><span className="eyebrow">PRODUCT CATALOGUE</span><h3>Recently listed sample products</h3></div><button type="button" className="seller-dashboard-text-button" onClick={()=>setTab('products')}>View all →</button></div>{sellerProducts.slice(0,4).map(p=><div className="seller-dashboard-mini-row" key={p.id}><img onError={e=>{e.currentTarget.onerror=null;e.currentTarget.src='/product-placeholder.svg'}} src={p.image} alt=""/><span><b>{p.name}</b><small>{p.category}</small></span><strong>{money(p.price)}</strong><span className="seller-dashboard-status">SAMPLE</span></div>)}</article><article className="seller-dashboard-panel seller-dashboard-checklist"><span className="eyebrow">STORE READINESS</span><h3>Prepare your storefront</h3><p>Use this checklist to organise the information a real seller workspace would need.</p><ul><li><span>01</span>Business information</li><li><span>02</span>Accurate product details</li><li><span>03</span>Delivery and return terms</li><li><span>04</span>Customer contact process</li></ul><Link to="/seller-help" className="text-link">Open seller guide →</Link></article></div></>}
    {tab==='products'&&<><div className="seller-dashboard-products-heading"><div><b>Manage your product listings</b><small>Create and publish products directly into the live MARCHY marketplace catalogue.</small></div><button type="button" className="primary-btn" onClick={()=>{setShowDraftForm(v=>!v);setDraftFeedback('')}}>{showDraftForm?'Close draft form':'＋ Create new listing'}</button></div>{draftFeedback&&<p className="seller-draft-feedback" role="status">{draftFeedback}</p>}{showDraftForm&&<form className="seller-draft-form" onSubmit={e=>saveDraft(e, false)}><div className="seller-draft-form-heading"><span className="eyebrow">{editingDraftId?'EDIT LISTING':'NEW PRODUCT LISTING'}</span><h3>{editingDraftId?'Update product information':'Product information & publication'}</h3><p>Save locally or publish immediately to make this product purchasable across the entire buyer marketplace.</p></div><div className="seller-draft-fields"><label>Product name<input required maxLength="100" value={draftTitle} onChange={e=>setDraftTitle(e.target.value)} placeholder="e.g. Handmade ceramic serving platter"/></label><label>Category<input required maxLength="50" value={draftCategory} onChange={e=>setDraftCategory(e.target.value)} placeholder="e.g. Home & Living"/></label><label>Price in Dinars (TND)<input required type="number" min="0.01" step="0.01" value={draftPrice} onChange={e=>setDraftPrice(e.target.value)} placeholder="0.00"/></label><label className="seller-draft-description">Description<textarea required maxLength="1000" rows="3" value={draftDescription} onChange={e=>setDraftDescription(e.target.value)} placeholder="Describe materials, origin, dimensions, and warranty..."/></label></div><div className="seller-draft-form-actions"><button type="button" className="outline-btn" onClick={resetDraftForm}>Cancel</button><button type="submit" className="outline-btn">Save Draft</button><button type="button" className="primary-btn" onClick={e=>saveDraft(e, true)}>🚀 Publish to Live Store</button></div></form>}{sellerDrafts.length>0&&<section className="seller-local-drafts"><div><b>Your local drafts & published listings</b><span>{sellerDrafts.length} saved on this device</span></div>{sellerDrafts.map(d=><article key={d.id}><span><b>{d.title}</b><small>{d.category} · {money(d.price)} · {d.description}</small></span><em className={d.status==='Published'?'status-published':''}>{d.status || 'LOCAL DRAFT'}</em><div className="seller-local-draft-actions"><button type="button" aria-label={`Edit draft ${d.title}`} onClick={()=>editDraft(d)}>Edit</button><button type="button" aria-label={`Delete draft ${d.title}`} onClick={()=>{const next=drafts.filter(x=>x.id!==d.id);setDrafts(next);writeJson('marchy-seller-drafts',next);if(editingDraftId===d.id)resetDraftForm()}}>Delete</button></div></article>)}</section>}<div className="seller-dashboard-filters"><label><span>Search sample listings</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search product names or details"/></label><label><span>Category</span><select value={category} onChange={e=>setCategory(e.target.value)}>{categoriesForSeller.map(c=><option key={c}>{c}</option>)}</select></label><button type="button" onClick={()=>{setQuery('');setCategory('All')}}>Reset</button></div><div className="seller-dashboard-listings"><div className="seller-dashboard-listing-head"><span>PRODUCT</span><span>PRICE</span><span>STATUS</span><span>ACTION</span></div>{visible.map(p=><div className="seller-dashboard-listing-row" key={p.id}><div className="seller-dashboard-product-cell"><img onError={e=>{e.currentTarget.onerror=null;e.currentTarget.src='/product-placeholder.svg'}} src={p.image} alt=""/><span><b>{p.name}</b><small>{p.category}</small></span></div><strong>{money(p.price)}</strong><span className="seller-dashboard-status">Active listing</span><Link to={`/product/${p.id}`} className="seller-dashboard-row-link">Preview →</Link></div>)}{!visible.length&&<div className="seller-dashboard-empty"><b>No matching sample listings</b><p>Try another search or category.</p><button type="button" onClick={()=>{setQuery('');setCategory('All')}}>Clear filters</button></div>}</div><p className="seller-dashboard-note">Connected to shared marketplace data architecture. Published items appear in search and store discovery.</p></>}
    {tab==='inventory'&&<SellerInventoryManager sellerSlug={seller.slug} />}
    {tab==='promotions'&&<SellerPromotionsManager sellerName={seller.name} />}
    {tab==='reviews'&&<SellerReviewsManager sellerName={seller.name} />}
    {tab==='orders'&&<section className="seller-dashboard-orders"><div className="seller-dashboard-products-heading"><div><b>Orders for {seller.name}</b><small>Shared demo orders also appear in delivery operations and platform admin.</small></div><span className="seller-dashboard-status">{sellerOrders.length} DEMO ORDERS</span></div>{sellerOrders.length?sellerOrders.map(order=><article className="seller-order-row" key={order.id}><div><Link className="seller-order-id-link" to={'/orders/' + order.id}>{order.id}</Link><small>{order.buyer} · {order.city} · {order.items} item(s)</small></div><strong>{money(order.total)}</strong><span className={'ops-status ops-status-'+order.status.toLowerCase().replaceAll(' ','-')}>{order.status}</span><label>Update status<select aria-label={'Update status for '+order.id} value={order.status} onChange={e=>updateOrder(order.id,{status:e.target.value})}><option>Processing</option><option>Ready for pickup</option><option>In transit</option><option>Delivered</option><option>Cancelled</option></select></label></article>):<div className="seller-dashboard-empty"><b>No sample orders for this merchant</b><p>Choose another demo storefront to inspect its order flow.</p></div>}<p className="seller-dashboard-note">These are shared illustrative orders. Changes are stored locally and do not notify buyers or couriers.</p></section>}
    {tab==='storefront'&&<div className="seller-dashboard-profile"><div className="seller-dashboard-cover"><span>{seller.name.split(' ').map(x=>x[0]).join('')}</span><small>STOREFRONT COVER PREVIEW</small></div><div className="seller-dashboard-profile-body"><span className="demo-label">VERIFIED STOREFRONT · TUNISIA</span><h3>{seller.name}</h3><p>⌖ {seller.city}, Tunisia</p><p>{seller.description}</p><div className="seller-category-tags">{seller.categories.map(c=><span key={c}>{c}</span>)}</div><Link to={`/seller/${seller.slug}`} className="primary-btn">View public storefront →</Link></div></div>}
    {tab==='insights'&&<SellerAnalytics seller={seller} sellerProducts={sellerProducts} sellerOrders={sellerOrders} />}
    {tab==='settings'&&<SellerSettings seller={seller} />}
   </section>
  </div>
  <p className="catalogue-note">Frontend demonstration only. No seller login, private data, live inventory, analytics, product publishing or account settings are connected.</p>
 </main>,language)
}

