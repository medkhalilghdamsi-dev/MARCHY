import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { sellers, sellerForProduct } from '../../data/sellers'
import { money, readJson, writeJson } from '../../utils/marketplace'
import { translateTree } from '../../i18n/translate'
import { useDemoOrders } from '../../hooks/useDemoOrders'
import { useMarketplace } from '../../providers/MarketplaceContext'
import { ArrowLeft, ArrowRight, Check, Info, ShoppingBag, Store, Truck, ShieldCheck, MapPin } from 'lucide-react'

export function CheckoutPage() {
  const { cart, language, clearCart, appliedCoupon } = useMarketplace()
  const { createOrders } = useDemoOrders()
  const [step, setStep] = useState(1)
  const savedAddresses = readJson('marchy-saved-addresses', [])
  const [saveAddressToBook, setSaveAddressToBook] = useState(false)
  const [details, setDetails] = useState(() => {
    const authUser = readJson('marchy-auth-user', null)
    const defaultAddr = savedAddresses.find(a => a.isDefault) || savedAddresses[0]
    return {
      name: defaultAddr?.name || authUser?.name || '',
      phone: defaultAddr?.phone || authUser?.phone || '',
      city: defaultAddr?.city || authUser?.city || 'Tunis',
      address: defaultAddr?.address || authUser?.address || '',
      notes: '',
      deliveryMethod: 'Standard courier (seller confirmed)',
      paymentMethod: 'Cash on delivery · demo'
    }
  })
  const navigate = useNavigate()
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0)
  const discountAmount = appliedCoupon === 'MARCHY10' ? subtotal * 0.1 : appliedCoupon === 'BIENVENUE' ? Math.min(5, subtotal) : 0
  const finalTotal = Math.max(0, subtotal - discountAmount)
  const itemCount = cart.reduce((sum, item) => sum + item.qty, 0)
  const groups = [...new Set(cart.map(item => sellerForProduct(item).slug))].map(slug => {
    const seller = sellers.find(entry => entry.slug === slug)
    const items = cart.filter(item => sellerForProduct(item).slug === slug)
    return { seller, items, subtotal: items.reduce((sum, item) => sum + item.price * item.qty, 0) }
  })
  const update = (key, value) => setDetails(current => ({ ...current, [key]: value }))

  const handleSelectSavedAddress = (addr) => {
    setDetails(curr => ({
      ...curr,
      name: addr.name || curr.name,
      phone: addr.phone || curr.phone,
      city: addr.city || curr.city,
      address: addr.address || curr.address
    }))
  }

  const submitDemoOrder = () => {
    if (saveAddressToBook && details.name && details.phone && details.address) {
      const currentAddrs = readJson('marchy-saved-addresses', [])
      const alreadyExists = currentAddrs.some(a => a.address.trim().toLowerCase() === details.address.trim().toLowerCase())
      if (!alreadyExists) {
        const newAddr = {
          id: 'addr-' + Date.now(),
          label: 'Delivery Address',
          name: details.name.trim(),
          phone: details.phone.trim(),
          city: details.city.trim(),
          address: details.address.trim(),
          isDefault: currentAddrs.length === 0
        }
        writeJson('marchy-saved-addresses', [...currentAddrs, newAddr])
      }
    }

    const discountRatio = subtotal > 0 ? finalTotal / subtotal : 1
    const created = createOrders(groups.map(group => ({
      buyer: details.name.trim(),
      phone: details.phone.trim(),
      city: details.city.trim(),
      address: details.address.trim(),
      notes: details.notes.trim(),
      seller: group.seller.name,
      sellerCity: group.seller.city,
      items: group.items.reduce((sum, item) => sum + item.qty, 0),
      products: group.items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        qty: item.qty,
        image: item.image,
        category: item.category,
        selectedVariant: item.selectedVariant || null
      })),
      subtotal: group.subtotal,
      discountRatio,
      total: Math.round(group.subtotal * discountRatio * 1000) / 1000,
      payment: details.paymentMethod || 'Cash on delivery · Pay upon inspection',
      deliveryMethod: details.deliveryMethod || 'Standard courier (seller confirmed)',
    })))
    clearCart?.()
    navigate(created.length === 1 ? '/orders/' + created[0].id : '/orders', { state: { justCreatedOrderIds: created.map(order => order.id) } })
  }

  if (!cart.length) return translateTree(<main id="main-content" className="shell page checkout-page"><div className="breadcrumbs"><Link to="/">Home</Link><span>/</span><Link to="/cart">Cart</Link><span>/</span><span>Checkout</span></div><div className="cart-empty-state"><div className="cart-empty-icon">🛒</div><span className="eyebrow">NOTHING TO CHECK OUT</span><h1>Your cart is empty</h1><p>Add products before starting checkout.</p><Link to="/search" className="primary-btn">Explore products →</Link></div></main>, language)

  return translateTree(<main id="main-content" className="shell page checkout-page">
    <div className="breadcrumbs"><Link to="/">Home</Link><span>/</span><Link to="/cart">Cart</Link><span>/</span><span aria-current="page">Checkout preview</span></div>
    <div className="checkout-heading"><div><span className="eyebrow">A CLEARER WAY TO CHECK OUT</span><h1>Review your order</h1><p>Confirm the details a real marketplace would need before any order is placed.</p></div><Link to="/cart" className="cart-continue-link"><ArrowLeft size={15}/> Back to cart</Link></div>
    <ol className="checkout-steps" aria-label="Checkout progress">
      <li className={step > 1 ? 'is-complete' : step === 1 ? 'is-current' : ''} aria-current={step === 1 ? 'step' : undefined}><span>{step > 1 ? <Check size={15}/> : '1'}</span><div><b>Delivery details</b><small>Your contact and address</small></div></li>
      <li className={step > 2 ? 'is-complete' : step === 2 ? 'is-current' : ''} aria-current={step === 2 ? 'step' : undefined}><span>{step > 2 ? <Check size={15}/> : '2'}</span><div><b>Order review</b><small>Products and sellers</small></div></li>
    </ol>
    <div className="checkout-layout">
      <section className="checkout-main-panel" aria-live="polite">
        {step === 1 && <form className="checkout-form" onSubmit={event => { event.preventDefault(); setStep(2); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
          <div className="checkout-panel-title">
            <span className="eyebrow">STEP 01</span>
            <h2>Where should the seller contact you?</h2>
            <p>Phone, street address and notes stay in this page session. Only your display name and city are kept in the local demo order after confirmation.</p>
          </div>

          {savedAddresses.length > 0 && (
            <div className="checkout-saved-addresses-bar">
              <span className="saved-addr-title"><MapPin size={14}/> Quick-fill from saved addresses:</span>
              <div className="saved-addr-chips">
                {savedAddresses.map(addr => (
                  <button
                    key={addr.id}
                    type="button"
                    className={`saved-addr-chip ${details.address === addr.address ? 'is-selected' : ''}`}
                    onClick={() => handleSelectSavedAddress(addr)}
                  >
                    <b>{addr.label || addr.city}</b>
                    <span>{addr.address.slice(0, 22)}...</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="checkout-fields">
            <label>Full name<input autoComplete="name" required value={details.name} onChange={e => update('name', e.target.value)} placeholder="Your full name"/></label>
            <label>Phone number<input autoComplete="tel" type="tel" required inputMode="tel" pattern="[+0-9() .-]{7,20}" value={details.phone} onChange={e => update('phone', e.target.value)} placeholder="+216 XX XXX XXX"/></label>
            <label>Governorate / Region
              <select autoComplete="address-level1" required value={details.city} onChange={e => update('city', e.target.value)}>
                <option value="Tunis">Tunis (Grand Tunis)</option>
                <option value="Ariana">Ariana (Grand Tunis)</option>
                <option value="Ben Arous">Ben Arous (Grand Tunis)</option>
                <option value="Manouba">Manouba (Grand Tunis)</option>
                <option value="Sousse">Sousse</option>
                <option value="Sfax">Sfax</option>
                <option value="Nabeul">Nabeul / Hammamet</option>
                <option value="Bizerte">Bizerte</option>
                <option value="Monastir">Monastir</option>
                <option value="Mahdia">Mahdia</option>
                <option value="Kairouan">Kairouan</option>
                <option value="Gabès">Gabès</option>
                <option value="Djerba / Medenine">Djerba / Medenine</option>
                <option value="Gafsa">Gafsa</option>
                <option value="Tozeur">Tozeur</option>
                <option value="Other governorate">Other governorate</option>
              </select>
            </label>
            <label className="checkout-field-wide">Delivery address<input autoComplete="street-address" required value={details.address} onChange={e => update('address', e.target.value)} placeholder="Street, building and neighbourhood"/></label>
            <label>Delivery method
              <select value={details.deliveryMethod} onChange={e => update('deliveryMethod', e.target.value)}>
                <option value="Standard courier (seller confirmed)">Standard courier (seller confirmed)</option>
                <option value="Express dispatch (24–48h where available)">Express dispatch (24–48h where available)</option>
                <option value="Local pickup / relay point (demo)">Local pickup / relay point (demo)</option>
              </select>
            </label>
            <label>Payment method (Demo only)
              <select value={details.paymentMethod} onChange={e => update('paymentMethod', e.target.value)}>
                <option value="Cash on delivery · demo">Cash on delivery (Pay upon inspection · Demo)</option>
                <option value="Bank card preview · demo">Bank card / ClicToPay preview (Simulated · Demo only)</option>
                <option value="Mobile wallet preview · demo">Flouci / Mobile wallet preview (Simulated · Demo only)</option>
              </select>
            </label>
            <label className="checkout-field-wide">Delivery notes <span className="checkout-optional">Optional</span><textarea value={details.notes} onChange={e => update('notes', e.target.value)} rows="3" placeholder="Landmark or useful delivery instructions"/></label>
          </div>

          <label className="checkout-save-address-opt">
            <input
              type="checkbox"
              checked={saveAddressToBook}
              onChange={e => setSaveAddressToBook(e.target.checked)}
            />
            <span>Save this address to my account for faster checkouts next time</span>
          </label>

          <div className="checkout-form-actions"><span>Required fields are marked by the browser.</span><button type="submit" className="primary-btn">Review order <ArrowRight size={15}/></button></div>
        </form>}
        {step === 2 && <section className="checkout-review">
          <div className="checkout-panel-title"><span className="eyebrow">STEP 02</span><h2>Review before proceeding</h2><p>Each seller handles their own availability and delivery confirmation.</p></div>

          <div className="cod-guarantee-banner">
            <ShieldCheck size={24} className="cod-badge-icon" />
            <div>
              <strong>Tunisian Buyer Protection & COD Guarantee</strong>
              <p>You pay zero millimes upfront. Inspect your items upon arrival with the courier before paying in cash.</p>
            </div>
          </div>

          <div className="checkout-contact-review"><div><b>Delivery contact</b><button type="button" className="text-link" onClick={() => setStep(1)}>Edit details</button></div><p>{details.name} · {details.phone}</p><p>{details.address}, {details.city}</p><p><small>Delivery: {details.deliveryMethod} · Payment: {details.paymentMethod}</small></p>{details.notes && <small>{details.notes}</small>}</div>
          {groups.map(group => <article className="checkout-seller-review" key={group.seller.slug}><div className="checkout-seller-heading"><div><span className="seller-avatar">{group.seller.name.slice(0, 1)}</span><div><b>{group.seller.name}</b><small>{group.seller.city} · sample storefront</small></div></div><strong>{money(group.subtotal)}</strong></div>{group.items.map(item => <div className="checkout-review-item" key={`${item.id}-${item.selectedVariant || 'default'}`}><img src={item.image} alt="" onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = '/product-placeholder.svg' }}/><span>{item.name}{item.selectedVariant && <small className="checkout-item-variant">Option: {item.selectedVariant}</small>}<small>Qty {item.qty} × {money(item.price)}</small></span><b>{money(item.price * item.qty)}</b></div>)}<div className="checkout-delivery-status"><span><Truck size={14}/> Delivery and stock</span><b>To be confirmed by seller</b></div></article>)}
          <div className="checkout-review-actions"><button type="button" className="outline-btn" onClick={() => setStep(1)}><ArrowLeft size={14}/> Edit delivery details</button><button type="button" className="primary-btn" onClick={submitDemoOrder}>Place demo order <ArrowRight size={15}/></button></div>
        </section>}
      </section>
      <aside className="summary-card checkout-summary"><span className="eyebrow"><ShoppingBag size={13}/> YOUR BASKET</span><h2>Order summary</h2><div className="cart-summary-row"><span>{itemCount} items · {cart.length} products</span><b>{money(subtotal)}</b></div>
      {groups.map(group => <div className="cart-summary-row seller-summary-row" key={group.seller.slug}><span>{group.seller.name}</span><b>{money(group.subtotal)}</b></div>)}<div className="cart-summary-row"><span>Delivery</span><b className="summary-pending">To be confirmed</b></div>
{appliedCoupon && (
  <div className="cart-summary-row applied-coupon-row">
    <span>Coupon ({appliedCoupon})</span>
    <b style={{ color: 'var(--forest)' }}>-{money(discountAmount)}</b>
  </div>
)}
<div className="summary-total"><span>Estimated product total</span><strong>{money(finalTotal)}</strong></div><p className="cart-summary-note">Delivery is not included. Each seller must confirm their own delivery fees and availability.</p><div className="checkout-seller-count"><Store size={16}/><b>{groups.length}</b><span>sample seller{groups.length === 1 ? '' : 's'} in this basket</span></div><div className="cart-trust-note"><span><Info size={16}/></span><p>Demo only. Confirmation creates a sample order on this device; no real order or payment is submitted.</p></div></aside>
    </div>
  </main>, language)
}

