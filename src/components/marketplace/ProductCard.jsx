import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { sellerForProduct } from '../../data/sellers'
import { money } from '../../utils/marketplace'
import { translateTree } from '../../i18n/translate'
import { useMarketplace } from '../../providers/MarketplaceContext'
import { useToast } from '../../providers/ToastProvider'
import { ArrowRight, ArrowUpRight, Check, Heart, MapPin, Plus, ShoppingCart, ShieldCheck } from 'lucide-react'

export function ProductCard({ product, addToCart, wished, toggleWish, compareIds = [], toggleCompare, returnTo }) {
  const { language } = useMarketplace()
  const toast = useToast()
  const [added, setAdded] = useState(false)
  const [quickViewOpen, setQuickViewOpen] = useState(false)
  const seller = sellerForProduct(product)
  const discount = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0

  function quickAdd() {
    addToCart(product)
    setAdded(true)
    toast(`${product.name} added to cart`, { type: 'success', duration: 2500 })
    setTimeout(() => setAdded(false), 2500)
  }

  useEffect(() => {
    if (!quickViewOpen) return
    const trigger = document.activeElement
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const dialog = document.querySelector(`[aria-labelledby="quick-view-title-${product.id}"]`)
    const focusable = dialog ? Array.from(dialog.querySelectorAll('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')) : []
    focusable[0]?.focus()
    const handleKeys = e => {
      if (e.key === 'Escape') { setQuickViewOpen(false); return }
      if (e.key === 'Tab' && focusable.length) {
        const first = focusable[0], last = focusable[focusable.length - 1]
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }
    window.addEventListener('keydown', handleKeys)
    return () => { window.removeEventListener('keydown', handleKeys); document.body.style.overflow = previousOverflow; trigger?.focus?.() }
  }, [quickViewOpen, product.id])

  const badgeColors = { 'Best seller': 'badge-gold', 'New arrival': 'badge-green', 'Deal': 'badge-red', 'Handmade': 'badge-earth' }

  return translateTree(<>
    <article className="product-card">
      <div className="product-photo">
        <Link to={`/product/${product.id}`} state={returnTo ? { from: returnTo } : undefined} aria-label={`View ${product.name}`}>
          <img onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = '/product-placeholder.svg' }} src={product.image} alt={product.name} loading="lazy" />
        </Link>
        <span className="product-tag">SAMPLE</span>
        {product.badge && <span className={`product-badge ${badgeColors[product.badge] || ''}`}>{product.badge}</span>}
        {discount > 0 && <span className="discount-tag">-{discount}%</span>}
        <button type="button" className={`wish-btn ${wished ? 'wished' : ''}`} onClick={() => toggleWish(product.id)} aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'} aria-pressed={wished}>{wished ? <Heart size={19} fill="currentColor"/> : <Heart size={19}/>}</button>
        <button type="button" className="product-quick-view" onClick={() => setQuickViewOpen(true)} aria-label={`Quick view ${product.name}`}>Quick view <span><ArrowUpRight size={14}/></span></button>
      </div>
      <div className="product-info">
        <div className="card-top-seller">
          <Link to={`/seller/${seller.slug}`} className="seller-name seller-link" title={`${seller.name} in ${seller.city}`}>
            <span className="seller-avatar-mini">{seller.name.slice(0, 1)}</span>
            <span className="seller-name-text">{seller.name}</span>
          </Link>
          <span className="seller-verified-chip" title="Verified local merchant"><ShieldCheck size={11} /> Verified</span>
        </div>
        <div className="product-category">{product.category}</div>
        <Link to={`/product/${product.id}`} state={returnTo ? { from: returnTo } : undefined} className="product-name">{product.name}</Link>
        {product.rating && <div className="product-rating" aria-label={`Rating: ${product.rating} out of 5`}>
          <span aria-hidden="true" className="rating-stars">★ {product.rating}</span>
          <span className="rating-count">({product.reviewCount || 12} reviews)</span>
          <span className="seller-city-dot">·</span>
          <span className="seller-city-tag"><MapPin size={11} aria-hidden="true"/> {seller.city}</span>
        </div>}
        <div className="card-attribute-pills">
          <span className="attr-pill">COD Available</span>
          <span className="attr-pill">Local dispatch</span>
        </div>
        <div className="price-row">
          <div className="price-label-group">
            <small className="price-type-label">Fixed price</small>
            <strong>{money(product.price)}</strong>
          </div>
          {product.oldPrice && <del>{money(product.oldPrice)}</del>}
        </div>
        {toggleCompare && <button type="button" className={`compare-product-button ${compareIds.includes(product.id) ? 'is-selected' : ''}`} onClick={() => toggleCompare(product.id)} aria-pressed={compareIds.includes(product.id)} disabled={compareIds.length >= 3 && !compareIds.includes(product.id)}>
          {compareIds.includes(product.id) ? <><Check size={14}/> Added to compare</> : compareIds.length >= 3 ? 'Compare limit reached' : <><Plus size={14}/> Compare</>}
        </button>}
        <button type="button" className={`add-btn ${added ? 'added' : ''}`} onClick={quickAdd} aria-live="polite">
          {added ? 'Added to cart' : 'Add to cart'} <span>{added ? <Check size={16}/> : <ShoppingCart size={16}/>}</span>
        </button>
      </div>
    </article>
    {quickViewOpen && <div className="quick-view-backdrop" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) setQuickViewOpen(false) }}>
      <section className="quick-view-dialog" role="dialog" aria-modal="true" aria-labelledby={`quick-view-title-${product.id}`}>
        <button type="button" className="quick-view-close" onClick={() => setQuickViewOpen(false)} aria-label="Close quick view">×</button>
        <div className="quick-view-image"><img onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = '/product-placeholder.svg' }} src={product.image} alt={product.name} /></div>
        <div className="quick-view-content">
          <span className="eyebrow">QUICK PRODUCT VIEW · SAMPLE LISTING</span>
          <span className="product-category">{product.category}</span>
          <h2 id={`quick-view-title-${product.id}`}>{product.name}</h2>
          <div className="quick-view-price">{money(product.price)}</div>
          <p>{product.description || 'Product specifications and included items should be confirmed directly with the seller.'}</p>
          <div className="quick-view-seller">Sold by <b>{seller.name}</b> · {seller.city}</div>
          <div className="quick-view-actions">
            <button type="button" className="primary-btn" onClick={quickAdd}>{added ? 'Added to cart ✓' : 'Add to demo cart'}</button>
            <Link to={`/product/${product.id}`} state={returnTo ? { from: returnTo } : undefined} className="outline-btn" onClick={() => setQuickViewOpen(false)}>View full details <ArrowRight size={15}/></Link>
          </div>
          <small>Illustrative catalogue information. Availability and final terms are not verified.</small>
        </div>
      </section>
    </div>}
  </>, language)
}

