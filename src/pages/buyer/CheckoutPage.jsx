import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { sellers, sellerForProduct } from '../../data/sellers'
import { money, readJson, writeJson } from '../../utils/marketplace'
import { translateTree } from '../../i18n/translate'
import { useDemoOrders } from '../../hooks/useDemoOrders'
import { FormField } from '../../components/ui'
import { useMarketplace } from '../../providers/MarketplaceContext'
import { PageFrame } from '../../components/ui/PageFrame'
import { useToast } from '../../providers/ToastProvider'
import { MarketplaceService } from '../../services/marketplaceService'
import {
  ArrowLeft, ArrowRight, Check, Info, ShoppingBag, Store,
  Truck, MapPin, ShieldCheck, CreditCard, Banknote, Smartphone
} from 'lucide-react'

export function CheckoutPage() {
  const { cart, language, clearCart, appliedCoupon } = useMarketplace()
  const { createOrders } = useDemoOrders()
  const toast = useToast()
  const navigate = useNavigate()
  const { step: routeStep } = useParams()

  const stepFromRoute = routeStep === 'review' ? 4 : routeStep === 'payment' ? 3 : routeStep === 'delivery' ? 2 : 1
  const [step, setStep] = useState(stepFromRoute)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const stepHeadingRef = useRef(null)
  const previousStepRef = useRef(step)

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
      deliveryMethod: 'Delivery preference (demo; seller confirmation required)',
      paymentMethod: 'Cash on delivery · demo'
    }
  })

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0)
  const couponValidation = appliedCoupon ? MarketplaceService.validateCoupon(appliedCoupon, subtotal) : null
  const discountAmount = couponValidation?.valid ? couponValidation.discount : 0
  const finalTotal = Math.max(0, subtotal - discountAmount)
  const itemCount = cart.reduce((sum, item) => sum + item.qty, 0)
  const groups = [...new Set(cart.map(item => item.sellerSlug || sellerForProduct(item).slug))].map(slug => {
    const items = cart.filter(item => (item.sellerSlug || sellerForProduct(item).slug) === slug)
    const seller = sellers.find(entry => entry.slug === slug) || {
      slug,
      name: items[0]?.seller || items[0]?.sellerName || 'Marketplace seller',
      city: items[0]?.sellerCity || 'Tunisia'
    }
    return { seller, items, subtotal: items.reduce((sum, item) => sum + item.price * item.qty, 0) }
  })
  const update = (key, value) => setDetails(current => ({ ...current, [key]: value }))

  useEffect(() => {
    setStep(stepFromRoute)
  }, [stepFromRoute])

  useEffect(() => {
    if (previousStepRef.current !== step) {
      stepHeadingRef.current?.focus()
      previousStepRef.current = step
    }
  }, [step])

  const goToStep = (targetStep) => {
    const stepSlugs = { 1: 'address', 2: 'delivery', 3: 'payment', 4: 'review' }
    setStep(targetStep)
    navigate(`/checkout/${stepSlugs[targetStep]}`)
    window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
  }

  const handleSelectSavedAddress = (addr) => {
    setDetails(curr => ({
      ...curr,
      name: addr.name || curr.name,
      phone: addr.phone || curr.phone,
      city: addr.city || curr.city,
      address: addr.address || curr.address
    }))
  }

  const handleAddressSubmit = (event) => {
    event.preventDefault()
    if (!details.name.trim() || !details.phone.trim() || !details.address.trim()) {
      toast('Please complete all required contact and delivery fields.', { type: 'error' })
      return
    }
    goToStep(2)
  }

  const submitDemoOrder = () => {
    if (isSubmitting) return
    setIsSubmitting(true)

    const stockIssues = cart.flatMap(item => {
      const offers = MarketplaceService.getProductOffers(item.id)
      const slug = item.sellerSlug || sellerForProduct(item).slug
      const offer = offers.find(entry => entry.sellerSlug === slug)
      if (!offer) return [{ item, message: 'This seller offer is no longer available.' }]
      const stock = Number(offer.stock ?? 0)
      if (stock < item.qty) return [{ item, message: `Only ${stock} unit${stock === 1 ? '' : 's'} remain for ${item.name}.` }]
      return []
    })

    if (stockIssues.length) {
      setIsSubmitting(false)
      toast(stockIssues[0].message, { type: 'error' })
      return
    }

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
        selectedVariant: item.selectedVariant || null,
        sellerSlug: item.sellerSlug || group.seller.slug,
        sellerName: group.seller.name,
        sellerCity: group.seller.city
      })),
      subtotal: group.subtotal,
      discountRatio,
      total: Math.round(group.subtotal * discountRatio * 1000) / 1000,
      payment: details.paymentMethod || 'Cash on delivery · demo preference only',
      deliveryMethod: details.deliveryMethod || 'Standard courier (seller confirmed)',
    })))

    // Update the local demo inventory for the ordered items.
    MarketplaceService.decrementInventory(cart)

    // Add a local in-app demo notification; no external seller notification is sent.
    MarketplaceService.addNotification({
      title: 'Order Confirmed',
      message: `Order #${created[0]?.id || 'NEW'} placed with Cash on Delivery demo preference. No seller or courier is contacted in this frontend demo.`,
      type: 'order',
      link: '/orders'
    })

    clearCart?.()
    const targetOrderId = created[0]?.id
    if (targetOrderId) {
      navigate('/order-confirmation/' + targetOrderId, { state: { justCreatedOrderIds: created.map(order => order.id) } })
    } else {
      navigate('/orders')
    }
  }

  if (!cart.length) {
    return translateTree(
      <PageFrame id="main-content" className=" checkout-page">
        <div className="breadcrumbs" role="navigation" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/cart">Cart</Link>
          <span>/</span>
          <span>Checkout</span>
        </div>
        <div className="cart-empty-state">
          <div className="cart-empty-icon">🛒</div>
          <span className="eyebrow">NOTHING TO CHECK OUT</span>
          <h1>Your cart is empty</h1>
          <p>Add products before starting checkout.</p>
          <Link to="/search" className="primary-btn">Explore products →</Link>
        </div>
      </PageFrame>,
      language
    )
  }

  return translateTree(
    <PageFrame id="main-content" className=" checkout-page">
      <div className="breadcrumbs" role="navigation" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to="/cart">Cart</Link>
        <span>/</span>
        <span aria-current="page">Checkout preview</span>
      </div>

      <div className="checkout-heading">
        <div>
          <span className="eyebrow">A CLEARER WAY TO CHECK OUT</span>
          <h1>Checkout & Order Placement</h1>
          <p>A four-step checkout preview for reviewing delivery details, payment preferences and seller-by-seller totals.</p>
        </div>
        <Link to="/cart" className="cart-continue-link">
          <ArrowLeft size={15}/> Back to cart
        </Link>
      </div>

      <ol className="checkout-steps checkout-steps-4" aria-label="Checkout progress">
        <li
          className={step > 1 ? 'is-complete' : step === 1 ? 'is-current' : ''}
          aria-current={step === 1 ? 'step' : undefined}
          onClick={() => goToStep(1)}
          style={{ cursor: 'pointer' }}
        >
          <span>{step > 1 ? <Check size={15}/> : '1'}</span>
          <div><b>1. Delivery Address</b><small>Your contact & location</small></div>
        </li>
        <li
          className={step > 2 ? 'is-complete' : step === 2 ? 'is-current' : ''}
          aria-current={step === 2 ? 'step' : undefined}
          onClick={() => step > 1 && goToStep(2)}
          style={{ cursor: step > 1 ? 'pointer' : 'default' }}
        >
          <span>{step > 2 ? <Check size={15}/> : '2'}</span>
          <div><b>2. Shipping Method</b><small>Delivery preference</small></div>
        </li>
        <li
          className={step > 3 ? 'is-complete' : step === 3 ? 'is-current' : ''}
          aria-current={step === 3 ? 'step' : undefined}
          onClick={() => step > 2 && goToStep(3)}
          style={{ cursor: step > 2 ? 'pointer' : 'default' }}
        >
          <span>{step > 3 ? <Check size={15}/> : '3'}</span>
          <div><b>3. Payment Choice</b><small>Demo payment preference</small></div>
        </li>
        <li
          className={step > 4 ? 'is-complete' : step === 4 ? 'is-current' : ''}
          aria-current={step === 4 ? 'step' : undefined}
          onClick={() => step > 3 && goToStep(4)}
          style={{ cursor: step > 3 ? 'pointer' : 'default' }}
        >
          <span>{step > 4 ? <Check size={15}/> : '4'}</span>
          <div><b>4. Order Review</b><small>Vendors & final check</small></div>
        </li>
      </ol>

      <div className="checkout-layout">
        <section className="checkout-main-panel" aria-live="polite">
          {/* STEP 1: CONTACT & DELIVERY ADDRESS */}
          {step === 1 && (
            <form className="checkout-form" onSubmit={handleAddressSubmit}>
              <div className="checkout-panel-title">
                <span className="eyebrow">STEP 01 OF 04</span>
                <h2 ref={stepHeadingRef} tabIndex={-1}>Where should the order be delivered?</h2>
                <p>Add the recipient’s contact details and delivery address for this sample order.</p>
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
                        aria-label={`Use saved address: ${addr.address}, ${addr.city}`}
                        aria-pressed={details.address === addr.address}
                        title={`${addr.address}, ${addr.city}`}
                      >
                        <b>{addr.label || addr.city}</b>
                        <span>{addr.address}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="checkout-fields">
                <FormField label="Full name" hint="Enter the name the courier can use to identify the recipient." required>
                  <input
                    id="checkout-full-name"
                    autoComplete="name"
                    required
                    value={details.name}
                    onChange={e => update('name', e.target.value)}
                    placeholder="Your full name"
                  />
                </FormField>
                <FormField label="Phone number" hint="Enter a mobile number associated with this sample order." required>
                  <input
                    id="checkout-phone"
                    autoComplete="tel"
                    type="tel"
                    inputMode="tel"
                    required
                    pattern="[+0-9().\\-]{7,20}"
                    value={details.phone}
                    onChange={e => update('phone', e.target.value)}
                    placeholder="+216 XX XXX XXX"
                  />
                </FormField>
                <label htmlFor="checkout-region">Governorate / Region
                  <select
                    id="checkout-region"
                    autoComplete="address-level1"
                    required
                    value={details.city}
                    onChange={e => update('city', e.target.value)}
                  >
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
                <FormField className="checkout-field-wide" label="Delivery address" hint="Include the building, street and neighbourhood in the sample delivery address." required>
                  <input
                    id="checkout-address"
                    autoComplete="street-address"
                    required
                    value={details.address}
                    onChange={e => update('address', e.target.value)}
                    placeholder="Street, building and neighbourhood"
                  />
                </FormField>
                <label className="checkout-field-wide" htmlFor="checkout-notes">
                  Delivery instructions <span className="checkout-optional">Optional</span>
                  <textarea
                    id="checkout-notes"
                    value={details.notes}
                    onChange={e => update('notes', e.target.value)}
                    rows="3"
                    placeholder="Nearby landmark, gate code, or delivery timing preferences"
                  />
                </label>
              </div>

              <label className="checkout-save-address-opt">
                <input
                  type="checkbox"
                  checked={saveAddressToBook}
                  onChange={e => setSaveAddressToBook(e.target.checked)}
                />
                <span>Save this address to my account for faster checkouts next time</span>
              </label>

              <div className="checkout-form-actions">
                <span>Required fields are validated by the browser.</span>
                <button type="submit" className="primary-btn">
                  Continue to shipping method <ArrowRight size={15}/>
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: SHIPPING METHOD */}
          {step === 2 && (
            <div className="checkout-step-panel">
              <div className="checkout-panel-title">
                <span className="eyebrow">STEP 02 OF 04</span>
                <h2 ref={stepHeadingRef} tabIndex={-1}>Choose your shipping method</h2>
                <p>Select how you would like each vendor to dispatch your parcel.</p>
              </div>

              <div className="checkout-option-cards" role="radiogroup" aria-label="Shipping method selection">
                <label className={`checkout-option-card ${details.deliveryMethod.includes('Standard') ? 'is-selected' : ''}`}>
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value="Standard courier (seller confirmed)"
                    checked={details.deliveryMethod.includes('Standard')}
                    onChange={e => update('deliveryMethod', e.target.value)}
                  />
                  <div className="option-card-body">
                    <div className="option-header">
                      <b><Truck size={16}/> Standard courier delivery</b>
                      <span className="option-badge">Standard Rate</span>
                    </div>
                    <p>Illustrative option only. Delivery coverage, timing, fees and parcel-inspection rules must be confirmed with the seller before an order is placed.</p>
                  </div>
                </label>

                <label className={`checkout-option-card ${details.deliveryMethod.includes('Express') ? 'is-selected' : ''}`}>
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value="Express dispatch (24–48h where available)"
                    checked={details.deliveryMethod.includes('Express')}
                    onChange={e => update('deliveryMethod', e.target.value)}
                  />
                  <div className="option-card-body">
                    <div className="option-header">
                      <b><Truck size={16}/> Express regional dispatch</b>
                      <span className="option-badge">Fast Dispatch</span>
                    </div>
                    <p>Illustrative express option only. Availability and delivery timing are not connected to a live courier network and must be confirmed with the seller.</p>
                  </div>
                </label>

                <label className={`checkout-option-card ${details.deliveryMethod.includes('pickup') ? 'is-selected' : ''}`}>
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value="Local pickup / relay point (demo)"
                    checked={details.deliveryMethod.includes('pickup')}
                    onChange={e => update('deliveryMethod', e.target.value)}
                  />
                  <div className="option-card-body">
                    <div className="option-header">
                      <b><Store size={16}/> Local merchant pickup point</b>
                      <span className="option-badge">Self Pickup</span>
                    </div>
                    <p>Pick up directly at the seller's storefront or local relay depot at your convenience.</p>
                  </div>
                </label>
              </div>

              <div className="checkout-dispatch-note" role="note" style={{ marginTop: '16px', padding: '12px 14px', background: 'var(--surface-soft)', borderRadius: '9px', fontSize: '11px', color: 'var(--muted)', display: 'flex', gap: '9px', alignItems: 'flex-start' }}>
                <Info size={16} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--forest)' }} />
                <span>
                  <strong>Multi-vendor dispatch:</strong> You have {groups.length} vendor{groups.length === 1 ? '' : 's'} in this order. Each vendor ships their items directly from their workshop or warehouse.
                </span>
              </div>

              <div className="checkout-form-actions">
                <button type="button" className="outline-btn" onClick={() => goToStep(1)}>
                  <ArrowLeft size={14}/> Back to address
                </button>
                <button type="button" className="primary-btn" onClick={() => goToStep(3)}>
                  Continue to payment <ArrowRight size={15}/>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PAYMENT METHOD */}
          {step === 3 && (
            <div className="checkout-step-panel">
              <div className="checkout-panel-title">
                <span className="eyebrow">STEP 03 OF 04</span>
                <h2 ref={stepHeadingRef} tabIndex={-1}>Choose how you want to pay</h2>
                <p>Choose a payment preference for this demo. No payment is collected and no payment provider is connected.</p>
              </div>

              <div className="checkout-option-cards" role="radiogroup" aria-label="Payment method selection">
                <label className={`checkout-option-card ${details.paymentMethod.includes('Cash') ? 'is-selected' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Cash on delivery · demo"
                    checked={details.paymentMethod.includes('Cash')}
                    onChange={e => update('paymentMethod', e.target.value)}
                  />
                  <div className="option-card-body">
                    <div className="option-header">
                      <b><Banknote size={16}/> Cash on Delivery (Pay upon inspection)</b>
                      <span className="option-badge primary-badge">Recommended</span>
                    </div>
                    <p>Pay cash in Tunisian Dinar (TND) directly to the delivery agent once you have inspected the parcel.</p>
                  </div>
                </label>

                <label className={`checkout-option-card ${details.paymentMethod.includes('card') ? 'is-selected' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Bank card preview · demo"
                    checked={details.paymentMethod.includes('card')}
                    onChange={e => update('paymentMethod', e.target.value)}
                  />
                  <div className="option-card-body">
                    <div className="option-header">
                      <b><CreditCard size={16}/> Bank card / ClicToPay (Simulated demo)</b>
                      <span className="option-badge">Preview</span>
                    </div>
                    <p>Payment-provider concept preview only. No GIM-TEL, ClicToPay or 3D-Secure connection is active.</p>
                  </div>
                </label>

                <label className={`checkout-option-card ${details.paymentMethod.includes('wallet') ? 'is-selected' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Mobile wallet preview · demo"
                    checked={details.paymentMethod.includes('wallet')}
                    onChange={e => update('paymentMethod', e.target.value)}
                  />
                  <div className="option-card-body">
                    <div className="option-header">
                      <b><Smartphone size={16}/> Flouci / Mobile Wallet (Simulated demo)</b>
                      <span className="option-badge">Preview</span>
                    </div>
                    <p>Instant mobile payment via QR code scan or wallet transfer. Simulated sandbox preview.</p>
                  </div>
                </label>
              </div>

              <div className="checkout-dispatch-note" role="note" style={{ marginTop: '16px', padding: '14px', background: 'rgba(0, 122, 100, 0.06)', border: '1px solid rgba(0, 122, 100, 0.15)', borderRadius: '9px', fontSize: '12px', color: 'var(--ink)', display: 'flex', gap: '10px', alignItems: 'center' }}>
                <ShieldCheck size={20} style={{ color: 'var(--forest)', flexShrink: 0 }} />
                <span><strong>Buyer protection preview:</strong> MARCHY’s verification, payment protection and returns processes are not active in this demo. Review the seller’s terms and confirm product details before placing a sample order.</span>
              </div>

              <div className="checkout-form-actions">
                <button type="button" className="outline-btn" onClick={() => goToStep(2)}>
                  <ArrowLeft size={14}/> Back to shipping
                </button>
                <button type="button" className="primary-btn" onClick={() => goToStep(4)}>
                  Review your order <ArrowRight size={15}/>
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: ORDER REVIEW */}
          {step === 4 && (
            <section className="checkout-review">
              <div className="checkout-panel-title">
                <span className="eyebrow">STEP 04 OF 04</span>
                <h2 ref={stepHeadingRef} tabIndex={-1}>Review and confirm your order</h2>
                <p>Verify your delivery information, selected courier, and multi-vendor item breakdown.</p>
              </div>

              <div className="checkout-preview-note" role="note">
                <Info size={20} aria-hidden="true" />
                <div>
                  <strong>Demo checkout preview</strong>
                  <p>This flow stores a sample order in this browser only. No seller receives real charges, and no payment is taken.</p>
                </div>
              </div>

              <div className="checkout-contact-review">
                <div>
                  <b>Delivery contact & address</b>
                  <button type="button" className="text-link" onClick={() => goToStep(1)}>Edit address</button>
                </div>
                <p>{details.name} · {details.phone}</p>
                <p>{details.address}, {details.city}</p>
                {details.notes && <small>Note: "{details.notes}"</small>}
              </div>

              <div className="checkout-contact-review" style={{ marginTop: '10px' }}>
                <div>
                  <b>Shipping & payment choices</b>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button type="button" className="text-link" onClick={() => goToStep(2)}>Edit shipping</button>
                    <button type="button" className="text-link" onClick={() => goToStep(3)}>Edit payment</button>
                  </div>
                </div>
                <p><small>Shipping: <strong>{details.deliveryMethod}</strong></small></p>
                <p><small>Payment: <strong>{details.paymentMethod}</strong></small></p>
              </div>

              {groups.map(group => (
                <article className="checkout-seller-review" key={group.seller.slug}>
                  <div className="checkout-seller-heading">
                    <div>
                      <span className="seller-avatar">{group.seller.name.slice(0, 1)}</span>
                      <div>
                        <b>{group.seller.name}</b>
                        <small>{group.seller.city} · sample storefront</small>
                      </div>
                    </div>
                    <strong>{money(group.subtotal)}</strong>
                  </div>
                  {group.items.map(item => (
                    <div className="checkout-review-item" key={`${item.id}-${item.sellerSlug || group.seller.slug}-${item.selectedVariant || 'default'}`}>
                      <img
                        src={item.image}
                        alt=""
                        onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = '/product-placeholder.svg' }}
                      />
                      <span>
                        {item.name}
                        {item.selectedVariant && <small className="checkout-item-variant">Option: {item.selectedVariant}</small>}
                        <small>Qty {item.qty} × {money(item.price)}</small>
                      </span>
                      <b>{money(item.price * item.qty)}</b>
                    </div>
                  ))}
                  <div className="checkout-delivery-status">
                    <span><Truck size={14}/> Delivery and stock</span>
                    <b>To be confirmed by seller upon order acceptance</b>
                  </div>
                </article>
              ))}

              <div className="checkout-review-actions">
                <button type="button" className="outline-btn" onClick={() => goToStep(3)}>
                  <ArrowLeft size={14}/> Edit payment
                </button>
                <button
                  type="button"
                  className="primary-btn"
                  onClick={submitDemoOrder}
                  disabled={isSubmitting}
                  aria-busy={isSubmitting}
                >
                  {isSubmitting ? 'Placing demo order...' : 'Place demo order'} <ArrowRight size={15}/>
                </button>
              </div>
            </section>
          )}
        </section>

        {/* SUMMARY ASIDE */}
        <aside className="summary-card checkout-summary">
          <span className="eyebrow"><ShoppingBag size={13}/> YOUR BASKET</span>
          <h2>Order summary</h2>
          <div className="cart-summary-row">
            <span>{itemCount} items · {cart.length} products</span>
            <b>{money(subtotal)}</b>
          </div>
          {groups.map(group => (
            <div className="cart-summary-row seller-summary-row" key={group.seller.slug}>
              <span>{group.seller.name}</span>
              <b>{money(group.subtotal)}</b>
            </div>
          ))}
          <div className="cart-summary-row">
            <span>Delivery</span>
            <b className="summary-pending">To be confirmed</b>
          </div>
          {appliedCoupon && (
            <div className="cart-summary-row applied-coupon-row">
              <span>Coupon ({appliedCoupon})</span>
              <b style={{ color: 'var(--forest)' }}>-{money(discountAmount)}</b>
            </div>
          )}
          <div className="summary-total">
            <span>Estimated product total</span>
            <strong>{money(finalTotal)}</strong>
          </div>
          <p className="cart-summary-note">Delivery is not included. Each seller confirms their own delivery fees and availability.</p>
          <div className="checkout-seller-count">
            <Store size={16}/>
            <b>{groups.length}</b>
            <span>sample seller{groups.length === 1 ? '' : 's'} in this basket</span>
          </div>
          <div className="cart-trust-note">
            <span><Info size={16}/></span>
            <p>Demo only. Confirmation creates a sample order on this device; no real charge is submitted.</p>
          </div>
        </aside>
      </div>
    </PageFrame>,
    language
  )
}
export default CheckoutPage
