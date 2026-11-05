import { Link } from 'react-router-dom'
import { categories, products } from '../data/products'
import { sellers, sellerForProduct } from '../data/sellers'
import { money } from '../utils/marketplace'
import { translateTree } from '../i18n/translate'

function CartPage({ cart, updateQty, removeItem, language }) {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0)
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
        <div className="cart-panel-heading"><b>Items in your cart</b><span>{cart.length} product{cart.length === 1 ? '' : 's'}</span></div>
        {sellerGroups.map(group => <section className="cart-seller-group" key={group.seller.slug} aria-label={`Items from ${group.seller.name}`}>
          <div className="cart-seller-group-heading"><div><span className="seller-avatar">{group.seller.name.slice(0,1)}</span><div><b>{group.seller.name}</b><small>{group.seller.city}, Tunisia · sample storefront</small></div></div><strong>{group.items.length} product{group.items.length===1?'':'s'}</strong></div>
          {group.items.map(item => <article className="cart-item" key={item.id}>
            <Link to={`/product/${item.id}`} className="cart-item-photo"><img onError={e=>{e.currentTarget.onerror=null;e.currentTarget.src='/product-placeholder.svg'}} src={item.image} alt={item.name} loading="lazy"/></Link>
            <div className="cart-item-info">
              <Link to={`/product/${item.id}`} className="cart-item-name">{item.name}</Link>
              <small>{group.seller.name} · {group.seller.city}, Tunisia</small>
              <b className="cart-item-unit-price">{money(item.price)} <span>each</span></b>
              <button type="button" className="remove-link" onClick={() => removeItem(item.id)}>Remove item</button>
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
        <div className="cart-panel-footer"><span>Need something else?</span><Link to="/categories">Explore all categories →</Link></div>
      </section>
      <aside className="summary-card cart-summary">
        <div className="cart-summary-title"><div><span className="eyebrow">YOUR ORDER</span><h2>Order summary</h2></div><span className="cart-summary-count">{itemCount} items</span></div>
        <div className="cart-summary-row"><span>Products subtotal</span><b>{money(subtotal)}</b></div>
        {sellerGroups.map(group=><div className="cart-summary-row seller-summary-row" key={group.seller.slug}><span>{group.seller.name}</span><b>{money(group.subtotal)}</b></div>)}
        <div className="cart-summary-row"><span>Delivery</span><b className="summary-pending">To be confirmed</b></div>
        <div className="cart-summary-row"><span>Discounts</span><b>—</b></div>
        <div className="summary-total"><span>Estimated product total</span><strong>{money(subtotal)}</strong></div>
        <p className="cart-summary-note">Delivery charges, availability and final prices are not yet connected to live seller systems. They are not included in this estimate.</p>
        <Link to="/checkout" className="primary-btn full-btn cart-checkout-button">Continue to checkout <span>→</span></Link>
        <div className="cart-trust-note"><span>ⓘ</span><p>You're reviewing a sample basket. No payment is taken and no order is placed.</p></div>
      </aside>
    </div> : <div className="cart-empty-state"><div className="cart-empty-icon">🛒</div><span className="eyebrow">A FRESH START</span><h2>Your cart is empty</h2><p>Explore the marketplace and add products you'd like to come back to.</p><div><Link to="/search" className="primary-btn">Explore products →</Link><Link to="/categories" className="cart-empty-secondary">Browse categories</Link></div></div>}
  </main>, language)
}

function CheckoutPage({cart,language,clearCart}) {
  const {createOrders}=useDemoOrders()
  const [step,setStep]=useState(1)
  const [details,setDetails]=useState({name:'',phone:'',city:'',address:'',notes:''})
  const navigate=useNavigate()
  const subtotal=cart.reduce((sum,item)=>sum+item.price*item.qty,0)
  const itemCount=cart.reduce((sum,item)=>sum+item.qty,0)
  const groups=[...new Set(cart.map(item=>sellerForProduct(item).slug))].map(slug=>{
    const seller=sellers.find(entry=>entry.slug===slug)
    const items=cart.filter(item=>sellerForProduct(item).slug===slug)
    return {seller,items,subtotal:items.reduce((sum,item)=>sum+item.price*item.qty,0)}
  })
  const update=(key,value)=>setDetails(current=>({...current,[key]:value}))
  const submitDemoOrder=()=>{
    const created=createOrders(groups.map(group=>({buyer:details.name.trim(),city:details.city.trim(),seller:group.seller.name,items:group.items.reduce((sum,item)=>sum+item.qty,0),total:group.subtotal,payment:'Cash on delivery · demo'})))
    clearCart?.()
    navigate('/orders/'+created[0].id)
  }
  if(!cart.length)return translateTree(<main id="main-content" className="shell page checkout-page"><div className="breadcrumbs"><Link to="/">Home</Link><span>/</span><Link to="/cart">Cart</Link><span>/</span><span>Checkout</span></div><div className="cart-empty-state"><div className="cart-empty-icon">🛒</div><span className="eyebrow">NOTHING TO CHECK OUT</span><h1>Your cart is empty</h1><p>Add products before starting checkout.</p><Link to="/search" className="primary-btn">Explore products →</Link></div></main>,language)
  return translateTree(<main id="main-content" className="shell page checkout-page">
    <div className="breadcrumbs"><Link to="/">Home</Link><span>/</span><Link to="/cart">Cart</Link><span>/</span><span aria-current="page">Checkout preview</span></div>
    <div className="checkout-heading"><div><span className="eyebrow">A CLEARER WAY TO CHECK OUT</span><h1>Review your order</h1><p>Confirm the details a real marketplace would need before any order is placed.</p></div><Link to="/cart" className="cart-continue-link">← Back to cart</Link></div>
    <ol className="checkout-steps" aria-label="Checkout progress">
      <li className={step>1?'is-complete':step===1?'is-current':''} aria-current={step===1?'step':undefined}><span>{step>1?'✓':'1'}</span><div><b>Delivery details</b><small>Your contact and address</small></div></li>
      <li className={step>2?'is-complete':step===2?'is-current':''} aria-current={step===2?'step':undefined}><span>{step>2?'✓':'2'}</span><div><b>Order review</b><small>Products and sellers</small></div></li>
      <li><span>3</span><div><b>Demo order</b><small>Saved on this device</small></div></li>
    </ol>
    <div className="checkout-layout">
      <section className="checkout-main-panel" aria-live="polite">
        {step===1&&<form className="checkout-form" onSubmit={event=>{event.preventDefault();setStep(2);window.scrollTo({top:0,behavior:'smooth'})}}>
          <div className="checkout-panel-title"><span className="eyebrow">STEP 01</span><h2>Where should the seller contact you?</h2><p>Phone, street address and notes stay in this page session. Only your display name and city are kept in the local demo order after confirmation.</p></div>
          <div className="checkout-fields">
            <label>Full name<input autoComplete="name" required value={details.name} onChange={e=>update('name',e.target.value)} placeholder="Your full name"/></label>
            <label>Phone number<input autoComplete="tel" type="tel" required inputMode="tel" pattern="[+0-9() .-]{7,20}" value={details.phone} onChange={e=>update('phone',e.target.value)} placeholder="+216 XX XXX XXX"/></label>
            <label>City<input autoComplete="address-level2" required value={details.city} onChange={e=>update('city',e.target.value)} placeholder="e.g. Tunis"/></label>
            <label className="checkout-field-wide">Delivery address<input autoComplete="street-address" required value={details.address} onChange={e=>update('address',e.target.value)} placeholder="Street, building and neighbourhood"/></label>
            <label className="checkout-field-wide">Delivery notes <span className="checkout-optional">Optional</span><textarea value={details.notes} onChange={e=>update('notes',e.target.value)} rows="3" placeholder="Landmark or useful delivery instructions"/></label>
          </div>
          <div className="checkout-form-actions"><span>Required fields are marked by the browser.</span><button type="submit" className="primary-btn">Review order <span>→</span></button></div>
        </form>}
        {step===2&&<section className="checkout-review">
          <div className="checkout-panel-title"><span className="eyebrow">STEP 02</span><h2>Review before proceeding</h2><p>Each seller handles their own availability and delivery confirmation.</p></div>
          <div className="checkout-contact-review"><div><b>Delivery contact</b><button type="button" className="text-link" onClick={()=>setStep(1)}>Edit details</button></div><p>{details.name} · {details.phone}</p><p>{details.address}, {details.city}</p>{details.notes&&<small>{details.notes}</small>}</div>
          {groups.map(group=><article className="checkout-seller-review" key={group.seller.slug}><div className="checkout-seller-heading"><div><span className="seller-avatar">{group.seller.name.slice(0,1)}</span><div><b>{group.seller.name}</b><small>{group.seller.city} · sample storefront</small></div></div><strong>{money(group.subtotal)}</strong></div>{group.items.map(item=><div className="checkout-review-item" key={item.id}><img src={item.image} alt="" onError={e=>{e.currentTarget.onerror=null;e.currentTarget.src='/product-placeholder.svg'}}/><span>{item.name}<small>Qty {item.qty} × {money(item.price)}</small></span><b>{money(item.price*item.qty)}</b></div>)}<div className="checkout-delivery-status"><span>Delivery and stock</span><b>To be confirmed by seller</b></div></article>)}
          <div className="checkout-review-actions"><button type="button" className="outline-btn" onClick={()=>setStep(1)}>← Edit delivery details</button><button type="button" className="primary-btn" onClick={submitDemoOrder}>Place demo order <span>→</span></button></div>
        </section>}
      </section>
      <aside className="summary-card checkout-summary"><span className="eyebrow">YOUR BASKET</span><h2>Order summary</h2><div className="cart-summary-row"><span>{itemCount} items · {cart.length} products</span><b>{money(subtotal)}</b></div>
      {groups.map(group=><div className="cart-summary-row seller-summary-row" key={group.seller.slug}><span>{group.seller.name}</span><b>{money(group.subtotal)}</b></div>)}<div className="cart-summary-row"><span>Delivery</span><b className="summary-pending">To be confirmed</b></div><div className="summary-total"><span>Estimated product total</span><strong>{money(subtotal)}</strong></div><p className="cart-summary-note">Delivery is not included. Each seller must confirm their own delivery fees and availability.</p><div className="checkout-seller-count"><b>{groups.length}</b><span>sample seller{groups.length===1?'':'s'} in this basket</span></div><div className="cart-trust-note"><span>ⓘ</span><p>Demo only. Confirmation creates a sample order on this device; no real order or payment is submitted.</p></div></aside>
    </div>
  </main>,language)
}

export { CartPage, CheckoutPage }
