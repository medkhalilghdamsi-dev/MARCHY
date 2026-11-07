import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom'
import { money, readJson } from '../../utils/marketplace'
import { useDemoOrders } from '../../hooks/useDemoOrders'
import { useMarketplace } from '../../providers/MarketplaceContext'
import { translateTree } from '../../i18n/translate'
import { CheckCircle2, Package, Truck, Printer, ArrowRight, ShieldCheck, ShoppingBag, MapPin, Phone, User, Store } from 'lucide-react'

export function OrderConfirmationPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { language } = useMarketplace()
  const { orders } = useDemoOrders()

  // Only show the order matching this URL; never substitute another order.
  const order = orders.find(item => item.id === id)

  const handlePrint = () => {
    window.print()
  }

  if (!order) {
    return translateTree(
      <main id="main-content" className="shell page order-confirmation-page">
        <div className="cart-empty-state">
          <div className="cart-empty-icon">📦</div>
          <span className="eyebrow">ORDER REFERENCE</span>
          <h1>No order found</h1>
          <p>We could not locate this order reference in your current session records.</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Link to="/orders" className="primary-btn">View your orders</Link>
            <Link to="/" className="outline-btn">Return home</Link>
          </div>
        </div>
      </main>,
      language
    )
  }

  const items = Array.isArray(order.products) && order.products.length > 0
    ? order.products
    : [{ name: 'Marketplace package', qty: order.items || 1, price: order.total, id: 1, image: '/product-placeholder.svg' }]

  return translateTree(
    <main id="main-content" className="shell page order-confirmation-page">
      <div className="breadcrumbs" role="navigation" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to="/orders">Orders</Link>
        <span>/</span>
        <span aria-current="page">Confirmation #{order.id}</span>
      </div>

      <div className="confirmation-hero-banner" role="region" aria-label="Order confirmation banner">
        <div className="confirmation-badge-icon">
          <CheckCircle2 size={48} className="success-icon" />
        </div>
        <span className="eyebrow">ORDER PLACED SUCCESSFULLY</span>
        <h1>Thank you for your order!</h1>
        <p className="confirmation-lead">
          Your order reference is <strong>#{order.id}</strong>. This sample order is saved in this browser only; no seller or courier has been contacted.
        </p>
        <div className="confirmation-tags">
          <span className="badge-pill cod-badge"><ShieldCheck size={14}/> {order.payment || 'Payment preference'} · Demo</span>
          <span className="badge-pill seller-badge"><Store size={14}/> Sold by {order.seller || 'Marketplace Seller'}</span>
        </div>
      </div>

      <div className="confirmation-grid">
        <section className="confirmation-main-card">
          <div className="confirmation-card-header">
            <div>
              <span className="eyebrow">PACKAGE DETAILS</span>
              <h2>Items in this order ({items.reduce((s, i) => s + (i.qty || 1), 0)} items)</h2>
            </div>
            <button type="button" onClick={handlePrint} className="outline-btn print-receipt-btn" aria-label="Print order summary">
              <Printer size={15}/> Print order summary
            </button>
          </div>

          <div className="confirmation-item-list">
            {items.map((item, idx) => (
              <div key={`${item.id}-${idx}`} className="confirmation-item-row">
                <img
                  src={item.image || '/product-placeholder.svg'}
                  alt={item.name}
                  className="confirmation-item-thumb"
                  onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = '/product-placeholder.svg' }}
                />
                <div className="confirmation-item-details">
                  <span className="confirmation-item-title">{item.name}</span>
                  {item.selectedVariant && (
                    <span className="confirmation-variant-tag">Option: {item.selectedVariant}</span>
                  )}
                  <small className="confirmation-item-seller">Merchant: {item.sellerName || order.seller || 'Marketplace merchant'}</small>
                  <span className="confirmation-item-qty">Qty: {item.qty || 1} × {money(item.price)}</span>
                </div>
                <strong className="confirmation-item-subtotal">
                  {money((item.price || 0) * (item.qty || 1))}
                </strong>
              </div>
            ))}
          </div>

          <div className="confirmation-next-steps">
            <h3>What happens next?</h3>
            <ol className="next-steps-timeline">
              <li>
                <b>1. Merchant Review & Preparation</b>
                <p>In a live marketplace, the seller would review stock and confirm whether the items can be supplied. No seller review happens in this demo.</p>
              </li>
              <li>
                <b>2. Delivery arrangements</b>
                <p>Delivery coverage, fees and timing would need to be agreed with the seller. No courier is assigned in this demo.</p>
              </li>
              <li>
                <b>3. Payment</b>
                <p>Your selected payment preference is recorded locally. No payment is collected or processed in this demo.</p>
              </li>
            </ol>
          </div>
        </section>

        <aside className="confirmation-summary-card">
          <div className="summary-section">
            <span className="eyebrow">DELIVERY ADDRESS</span>
            <div className="recipient-summary">
              <p><strong><User size={14}/> {order.buyer || 'Customer'}</strong></p>
              <p><Phone size={14}/> {order.phone || '+216 -- --- ---'}</p>
              <p><MapPin size={14}/> {order.address || 'Delivery address'}, {order.city || 'Tunis'}</p>
              {order.notes && <p className="delivery-note-preview">Note: "{order.notes}"</p>}
            </div>
          </div>

          <div className="summary-section">
            <span className="eyebrow">PAYMENT METHOD</span>
            <p className="payment-method-pill">
              <strong>{order.payment || 'Cash on Delivery'}</strong>
              <small>Demo preference only. No payment is collected.</small>
            </p>
          </div>

          <div className="summary-section totals-breakdown">
            <span className="eyebrow">PAYMENT SUMMARY</span>
            <div className="summary-row">
              <span>Subtotal</span>
              <b>{money(order.subtotal || order.total)}</b>
            </div>
            <div className="summary-row">
              <span>Delivery</span>
              <b className="free-tag">To be confirmed by seller</b>
            </div>
            <div className="summary-total-row">
              <span>Order total (delivery not included)</span>
              <strong>{money(order.total)}</strong>
            </div>
          </div>

          <div className="confirmation-action-buttons">
            <Link to={`/orders/${order.id}`} className="primary-btn full-btn">
              View demo order status <ArrowRight size={16}/>
            </Link>
            <Link to="/search" className="outline-btn full-btn">
              <ShoppingBag size={15}/> Continue shopping
            </Link>
          </div>
        </aside>
      </div>
    </main>,
    language
  )
}
export default OrderConfirmationPage
