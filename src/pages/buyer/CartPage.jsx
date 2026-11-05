import { useState } from 'react'
import { Link } from 'react-router-dom'
import { sellers, sellerForProduct } from '../../data/sellers'
import { money } from '../../utils/marketplace'
import { translateTree } from '../../i18n/translate'
import { useMarketplace } from '../../providers/MarketplaceContext'
import { useToast } from '../../providers/ToastProvider'

export function CartPage() {
  const {
    cart, updateQty, removeItem, language,
    appliedCoupon, setAppliedCoupon,
    savedForLater = [], saveForLater, moveToCart, removeSavedItem,
  } = useMarketplace()
  const toast = useToast()
  const [couponCode, setCouponCode] = useState('')
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0)
  const discountAmount = appliedCoupon === 'MARCHY10' ? subtotal * 0.1 : appliedCoupon === 'BIENVENUE' ? Math.min(5, subtotal) : 0
  const finalTotal = Math.max(0, subtotal - discountAmount)
  const freeDeliveryThreshold = 120
  const freeDeliveryRemaining = Math.max(0, freeDeliveryThreshold - subtotal)
  const freeDeliveryProgress = Math.min(100, Math.round((subtotal / freeDeliveryThreshold) * 100))

  const applyCoupon = (e) => {
    e.preventDefault()
    const clean = couponCode.trim().toUpperCase()
    if (clean === 'MARCHY10') {
      setAppliedCoupon(clean)
      toast('10% discount applied with code MARCHY10!', { type: 'success' })
      setCouponCode('')
    } else if (clean === 'BIENVENUE') {
      setAppliedCoupon(clean)
      toast('5.000 TND welcome discount applied!', { type: 'success' })
      setCouponCode('')
    } else {
      toast('Invalid coupon. Try "MARCHY10" (10% off) or "BIENVENUE" (5 TND off)', { type: 'error' })
    }
  }
  const removeCoupon = () => {
    setAppliedCoupon('')
    toast('Coupon removed', { type: 'info' })
  }
  const itemCount = cart.reduce((sum, item) => sum + item.qty, 0)
  const sellerCount = new Set(cart.map(item => sellerForProduct(item).slug)).size
  const sellerGroups = [...new Set(cart.map(item => sellerForProduct(item).slug))].map(slug => {
    const seller = sellers.find(entry => entry.slug === slug)
    const items = cart.filter(item => sellerForProduct(item).slug === slug)
    return { seller, items, subtotal: items.reduce((sum, item) => sum + item.price * item.qty, 0) }
  })
  return translateTree(<main id="main-content" className="shell page cart-page">
    <div className="breadcrumbs" role="navigation" aria-label="Breadcrumb"><Link to="/">Home</Link><span>/</span><span aria-current="page">Your cart</span></div>
    <div className="cart-page-heading">
      <div><span className="eyebrow">YOUR MARCHY BASKET</span><h1>Your shopping cart</h1><p>{itemCount} items · {cart.length} products · {sellerCount} sellers</p></div>
      <Link to="/search" className="cart-continue-link">← Continue shopping</Link>
    </div>
    {cart.length ? <div className="cart-layout">
      <section className="cart-items-panel" aria-label="Cart items">
        <div className="cart-free-delivery-meter" role="region" aria-label="Free delivery progress">
          <div className="cart-free-delivery-copy">
            <span>{freeDeliveryRemaining > 0 ? `Add ${money(freeDeliveryRemaining)} more for illustrative free standard delivery` : '✓ Illustrative free standard delivery threshold reached (120.000 TND)'}</span>
            <b>{freeDeliveryProgress}%</b>
          </div>
          <div className="cart-free-delivery-bar" aria-hidden="true"><span style={{ width: `${freeDeliveryProgress}%` }} /></div>
        </div>
        <div className="cart-panel-heading"><b>Items in your cart</b><span>{cart.length} product{cart.length === 1 ? '' : 's'}</span></div>
        {sellerGroups.map(group => <section className="cart-seller-group" key={group.seller.slug} aria-label={`Items from ${group.seller.name}`}>
          <div className="cart-seller-group-heading"><div><span className="seller-avatar">{group.seller.name.slice(0,1)}</span><div><b>{group.seller.name}</b><small>{group.seller.city}, Tunisia · sample storefront</small></div></div><strong>{group.items.length} product{group.items.length===1?'':'s'}</strong></div>
          {group.items.map(item => <article className="cart-item" key={item.id}>
            <Link to={`/product/${item.id}`} className="cart-item-photo"><img onError={e=>{e.currentTarget.onerror=null;e.currentTarget.src='/product-placeholder.svg'}} src={item.image} alt={item.name} loading="lazy"/></Link>
            <div className="cart-item-info">
              <Link to={`/product/${item.id}`} className="cart-item-name">{item.name}</Link>
              <small>{group.seller.name} · {group.seller.city}, Tunisia</small>
              <b className="cart-item-unit-price">{money(item.price)} <span>each</span></b>
              <div className="cart-item-actions-row">
                <button type="button" className="remove-link" onClick={() => removeItem(item.id)}>Remove item</button>
                {saveForLater && <button type="button" className="save-later-link" onClick={() => { saveForLater(item); toast(`Saved ${item.name} for later`, { type: 'info' }) }}>Save for later</button>}
              </div>
            </div>
            <div className="cart-item-quantity"><span>Quantity</span><div className="quantity">
              <button type="button" aria-label={`Decrease ${item.name} quantity`} disabled={item.qty <= 1} onClick={() => updateQty(item.id, item.qty - 1)}>−</button>
              <output aria-live="polite">{item.qty}</output>
              <button type="button" aria-label={`Increase ${item.name} quantity`} disabled={item.qty >= 99} onClick={() => updateQty(item.id, Math.min(99, item.qty + 1))}>＋</button>
            </div></div>
            <strong className="cart-line-total">{money(item.price * item.qty)}</strong>
          </article>)}
          <div className="cart-seller-group-footer"><span>Seller subtotal</span><b>{money(group.subtotal)}</b></div>
        </section>)}
        {savedForLater.length > 0 && (
          <section className="cart-saved-later-section" aria-label="Saved for later">
            <div className="cart-panel-heading"><b>Saved for later</b><span>{savedForLater.length} item{savedForLater.length === 1 ? '' : 's'}</span></div>
            <div className="cart-saved-later-list">
              {savedForLater.map(item => (
                <article className="cart-saved-item" key={item.id}>
                  <Link to={`/product/${item.id}`} className="cart-item-photo"><img onError={e=>{e.currentTarget.onerror=null;e.currentTarget.src='/product-placeholder.svg'}} src={item.image} alt={item.name} loading="lazy"/></Link>
                  <div className="cart-item-info">
                    <Link to={`/product/${item.id}`} className="cart-item-name">{item.name}</Link>
                    <b className="cart-item-unit-price">{money(item.price)}</b>
                  </div>
                  <div className="cart-saved-item-actions">
                    <button type="button" className="outline-btn" onClick={() => { moveToCart(item); toast(`Moved ${item.name} to cart`, { type: 'success' }) }}>Move to cart</button>
                    <button type="button" className="remove-link" onClick={() => removeSavedItem(item.id)}>Remove</button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
        <div className="cart-panel-footer"><span>Need something else?</span><Link to="/categories">Explore all categories →</Link></div>
      </section>
      <aside className="summary-card cart-summary">
        <div className="cart-summary-title"><div><span className="eyebrow">YOUR ORDER</span><h2>Order summary</h2></div><span className="cart-summary-count">{itemCount} items</span></div>
        <div className="cart-summary-row"><span>Products subtotal</span><b>{money(subtotal)}</b></div>
        {sellerGroups.map(group=><div className="cart-summary-row seller-summary-row" key={group.seller.slug}><span>{group.seller.name}</span><b>{money(group.subtotal)}</b></div>)}
        <div className="cart-summary-row"><span>Delivery</span><b className="summary-pending">To be confirmed</b></div>
        {appliedCoupon ? (
          <div className="cart-summary-row applied-coupon-row">
            <span>Discount ({appliedCoupon}) <button type="button" className="coupon-remove-btn" onClick={removeCoupon} aria-label="Remove coupon">×</button></span>
            <b style={{ color: 'var(--forest)' }}>-{money(discountAmount)}</b>
          </div>
        ) : (
          <div className="cart-summary-row"><span>Discounts</span><b>—</b></div>
        )}
        <form className="cart-coupon-form" onSubmit={applyCoupon} aria-label="Promo code">
          <label htmlFor="cart-coupon-input" className="sr-only">Promo code</label>
          <input
            id="cart-coupon-input"
            type="text"
            value={couponCode}
            onChange={e => setCouponCode(e.target.value)}
            placeholder="Promo code (e.g. MARCHY10)"
            aria-label="Promo code"
          />
          <button type="submit" className="outline-btn">Apply</button>
        </form>
        <div className="summary-total"><span>Estimated product total</span><strong>{money(finalTotal)}</strong></div>
        <p className="cart-summary-note">Delivery charges, availability and final prices are not yet connected to live seller systems. They are not included in this estimate.</p>
        <Link to="/checkout" className="primary-btn full-btn cart-checkout-button">Continue to checkout <span>→</span></Link>
        <div className="cart-trust-note"><span>ⓘ</span><p>You're reviewing a sample basket. No payment is taken and no order is placed.</p></div>
      </aside>
    </div> : <div className="cart-empty-state"><div className="cart-empty-icon">🛒</div><span className="eyebrow">A FRESH START</span><h2>Your cart is empty</h2><p>Explore the marketplace and add products you'd like to come back to.</p><div><Link to="/search" className="primary-btn">Explore products →</Link><Link to="/categories" className="cart-empty-secondary">Browse categories</Link></div>
      {savedForLater.length > 0 && (
        <section className="cart-saved-later-section" aria-label="Saved for later" style={{ marginTop: '24px', textAlign: 'left' }}>
          <div className="cart-panel-heading"><b>Saved for later</b><span>{savedForLater.length} item{savedForLater.length === 1 ? '' : 's'}</span></div>
          <div className="cart-saved-later-list">
            {savedForLater.map(item => (
              <article className="cart-saved-item" key={item.id}>
                <Link to={`/product/${item.id}`} className="cart-item-photo"><img onError={e=>{e.currentTarget.onerror=null;e.currentTarget.src='/product-placeholder.svg'}} src={item.image} alt={item.name} loading="lazy"/></Link>
                <div className="cart-item-info">
                  <Link to={`/product/${item.id}`} className="cart-item-name">{item.name}</Link>
                  <b className="cart-item-unit-price">{money(item.price)}</b>
                </div>
                <div className="cart-saved-item-actions">
                  <button type="button" className="outline-btn" onClick={() => { moveToCart(item); toast(`Moved ${item.name} to cart`, { type: 'success' }) }}>Move to cart</button>
                  <button type="button" className="remove-link" onClick={() => removeSavedItem(item.id)}>Remove</button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>}
  </main>, language)
}

