import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { money } from '../../utils/marketplace'
import { useDemoOrders, ORDER_STATUS_STEPS } from '../../hooks/useDemoOrders'
import { useMarketplace } from '../../providers/MarketplaceContext'
import { useToast } from '../../providers/ToastProvider'
import { Status, OpsShell } from '../shared/OperationsShared'
import {
  ArrowLeft, Check, Clock, ExternalLink, MapPin, Package, Phone,
  Printer, RefreshCw, RotateCcw, ShieldCheck, Truck, X, MessageSquare
} from 'lucide-react'

export function BuyerOrderTrackingPage(props) {
  const { language: ctxLanguage, addToCart } = useMarketplace()
  const language = props?.language || ctxLanguage
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { orders, advanceOrderStatus, cancelOrder } = useDemoOrders()

  const [invoiceOpen, setInvoiceOpen] = useState(false)
  const [contactOpen, setContactOpen] = useState(false)

  const order = orders.find(item => item.id === id)

  if (!order) {
    return (
      <OpsShell title="Order not found" eyebrow="ORDER TRACKING" language={language}>
        <section className="ops-panel">
          <p>This order could not be found in your local device records.</p>
          <Link to="/orders" className="primary-btn">Return to your orders</Link>
        </section>
      </OpsShell>
    )
  }

  const steps = ORDER_STATUS_STEPS
  const currentStepIndex = steps.indexOf(order.status)
  const isCancelled = order.status === 'Cancelled'
  const isDelivered = order.status === 'Delivered'

  const handleAdvanceStep = () => {
    const nextStatus = advanceOrderStatus(order.id)
    if (nextStatus) {
      toast(`Order status advanced to: ${nextStatus}`, { type: 'success' })
    }
  }

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      cancelOrder(order.id, 'Cancelled by customer via order tracking')
      toast('Order has been cancelled.', { type: 'info' })
    }
  }

  const handleReorder = () => {
    if (Array.isArray(order.products) && order.products.length > 0) {
      order.products.forEach(prod => {
        addToCart(prod, prod.qty || 1, prod.selectedVariant || null)
      })
      toast(`Re-added ${order.products.length} item(s) to your cart`, { type: 'success' })
      navigate('/cart')
    } else {
      toast('No product details available to re-order.', { type: 'error' })
    }
  }

  return (
    <OpsShell title={`Track Order ${order.id}`} eyebrow="BUYER ORDER HUB" language={language}>
      <section className="ops-panel buyer-tracking-panel">
        <div className="ops-panel-head">
          <div>
            <span className="eyebrow">TUNISIAN LOCAL COURIER TRACKING</span>
            <h2>Order {order.id}</h2>
            <p>
              Placed with <b>{order.seller}</b> for delivery to <b>{order.city}</b>.
            </p>
          </div>
          <Status value={order.status} language={language} />
        </div>

        <div className="tracking-demo-notice" role="note"><ShieldCheck size={16}/><div><b>Demo order timeline</b><span>Status changes are simulated locally. Courier scans, seller messaging and delivery estimates are not connected to live services.</span></div></div>

        {/* Order Progress */}
        {isCancelled ? (
          <div className="buyer-tracking-cancelled" role="alert">
            <b>✕ Order Cancelled</b>
            <p>{order.cancelReason || 'This order was cancelled. No delivery will take place.'}</p>
          </div>
        ) : (
          <div className="order-stepper-wrap" role="group" aria-label="Delivery progress">
            <ol className="buyer-tracking-steps">
              {steps.map((step, index) => {
                const isComplete = currentStepIndex >= index
                const isCurrent = currentStepIndex === index
                return (
                  <li key={step} className={`${isComplete ? 'complete' : ''} ${isCurrent ? 'is-current' : ''}`} aria-current={isCurrent ? 'step' : undefined}>
                    <span className="buyer-tracking-step-dot">
                      {isComplete ? '✓' : index + 1}
                    </span>
                    <div>
                      <b>{step}</b>
                      <small>
                        {index === 0 && 'Seller confirmed and packed items'}
                        {index === 1 && 'Courier collection scheduled'}
                        {index === 2 && 'In transit with Tunisian delivery partner'}
                        {index === 3 && 'Delivered & inspected upon payment'}
                      </small>
                    </div>
                  </li>
                )
              })}
            </ol>
          </div>
        )}

        {/* Interactive Action Bar */}
        <div className="tracking-interactive-actions" role="group" aria-label="Order actions">
          {!isCancelled && !isDelivered && (
            <button
              type="button"
              className="primary-btn advance-step-btn"
              onClick={handleAdvanceStep}
              title="Preview the next demo order status"
            >
              <RefreshCw size={15} /> Preview Next Status
            </button>
          )}

          {!isCancelled && !isDelivered && (
            <button
              type="button"
              className="outline-btn cancel-order-btn"
              onClick={handleCancel}
            >
              <X size={15} /> Cancel Order
            </button>
          )}

          <button
            type="button"
            className="outline-btn"
            onClick={handleReorder}
          >
            <RotateCcw size={15} /> Reorder Items
          </button>

          <button
            type="button"
            className="outline-btn"
            onClick={() => setInvoiceOpen(true)}
              aria-expanded={invoiceOpen}
              aria-controls="buyer-invoice-dialog"
          >
            <Printer size={15} /> View Receipt
          </button>

          <button
            type="button"
            className="outline-btn"
            onClick={() => setContactOpen(true)}
              aria-expanded={contactOpen}
              aria-controls="buyer-contact-dialog"
          >
            <MessageSquare size={15} /> Contact Merchant
          </button>
        </div>

        {/* Two Column Details: Products & Delivery Info */}
        <div className="tracking-details-columns">
          {/* Products Column */}
          <div className="tracking-products-card">
            <h3>Ordered Products ({order.items} item{order.items === 1 ? '' : 's'})</h3>
            <div className="tracking-products-list">
              {Array.isArray(order.products) && order.products.length > 0 ? (
                order.products.map(product => (
                  <div key={`${product.id}-${product.sellerSlug || order.seller}-${product.selectedVariant || 'default'}`} className="tracking-product-item">
                    <img
                      src={product.image || '/product-placeholder.svg'}
                      alt={product.name}
                      onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = '/product-placeholder.svg' }}
                    />
                    <div className="tracking-product-copy">
                      <Link to={`/product/${product.id}`} className="tracking-product-name">{product.name}</Link>
                      {product.selectedVariant && (
                        <span className="cart-item-variant-tag">{product.selectedVariant}</span>
                      )}
                      {product.sellerName && <small className="tracking-product-seller">Sold by {product.sellerName}</small>}
                      <small>Quantity: {product.qty || 1} × {money(product.price)}</small>
                    </div>
                    <strong>{money((product.price || 0) * (product.qty || 1))}</strong>
                  </div>
                ))
              ) : (
                <div className="tracking-product-item">
                  <div className="tracking-product-copy">
                    <span className="tracking-product-name">{order.seller} Packaged Items</span>
                    <small>{order.items} product(s) in this order</small>
                  </div>
                  <strong>{money(order.total)}</strong>
                </div>
              )}
            </div>

            <div className="tracking-order-totals">
              <div className="totals-row">
                <span>Subtotal</span>
                <b>{money(order.subtotal || order.total)}</b>
              </div>
              <div className="totals-row">
                <span>Delivery (COD Inspection Guarantee)</span>
                <span className="free-tag">Included</span>
              </div>
              <div className="totals-row total-highlight">
                <span>Total Amount Due</span>
                <strong>{money(order.total)}</strong>
              </div>
            </div>
          </div>

          {/* Delivery & Seller Column */}
          <div className="tracking-recipient-card">
            <h3>Delivery & Merchant Summary</h3>
            <div className="tracking-meta-box">
              <div className="meta-line">
                <span className="meta-label">Recipient:</span>
                <b>{order.buyer}</b>
              </div>
              {order.phone && (
                <div className="meta-line">
                  <span className="meta-label">Phone:</span>
                  <span>{order.phone}</span>
                </div>
              )}
              <div className="meta-line">
                <span className="meta-label">Governorate & City:</span>
                <span>{order.city}, Tunisia</span>
              </div>
              {order.address && (
                <div className="meta-line">
                  <span className="meta-label">Address:</span>
                  <span>{order.address}</span>
                </div>
              )}
              {order.notes && (
                <div className="meta-line">
                  <span className="meta-label">Instructions:</span>
                  <small>{order.notes}</small>
                </div>
              )}
              <div className="meta-line">
                <span className="meta-label">Payment Mode:</span>
                <b>{order.payment}</b>
              </div>
              <div className="meta-line">
                <span className="meta-label">Courier Partner:</span>
                <span>{order.courier || 'Tunisian Express Logistics'}</span>
              </div>
              <div className="meta-line">
                <span className="meta-label">Merchant Workshop:</span>
                <b>{order.seller}</b>
              </div>
              {order.sellerCity && (
                <div className="meta-line">
                  <span className="meta-label">Merchant location:</span>
                  <span>{order.sellerCity}, Tunisia</span>
                </div>
              )}
            </div>

            <div className="tracking-guarantee-note">
              <ShieldCheck size={20} />
              <div>
                <b>Cash on Delivery Inspection Protection</b>
                <small>You have the right to open and inspect the package before handing payment to the driver.</small>
              </div>
            </div>
          </div>
        </div>

        {/* Milestone Timeline Log */}
        {Array.isArray(order.timeline) && order.timeline.length > 0 && (
          <div className="tracking-timeline-history">
            <h3>Courier Activity Timeline</h3>
            <ul className="timeline-list">
              {order.timeline.map((entry, idx) => (
                <li key={idx} className={`timeline-entry ${entry.completed ? 'is-done' : ''}`}>
                  <span className="timeline-marker">{entry.completed ? '✓' : '•'}</span>
                  <div className="timeline-content">
                    <div className="timeline-header">
                      <b>{entry.status}</b>
                      <small>{entry.time}</small>
                    </div>
                    <p>{entry.note}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="ops-panel-footer">
          <Link to="/orders" className="text-link"><ArrowLeft size={14} /> Back to all orders</Link>
          <Link to="/" className="text-link">Continue shopping →</Link>
        </div>
      </section>

      {/* Invoice Modal Preview */}
      {invoiceOpen && (
        <div className="quick-view-backdrop" role="presentation">
          <div id="buyer-invoice-dialog" className="invoice-modal-card" role="dialog" aria-modal="true" aria-labelledby="buyer-invoice-title">
            <button
              type="button"
              className="quick-view-close"
              onClick={() => setInvoiceOpen(false)}
              aria-label="Close invoice"
            >
              ✕
            </button>
            <div className="invoice-printable" id="printable-order-receipt">
              <div className="invoice-header">
                <div>
                  <span className="invoice-brand">MARCHY.</span>
                  <p>Tunisian Multi-Merchant Marketplace</p>
                </div>
                <div className="invoice-meta-right">
                  <h2 id="buyer-invoice-title">Official Demo Receipt</h2>
                  <p>Order #{order.id}</p>
                  <small>Date: {new Date(order.createdAt || Date.now()).toLocaleDateString()}</small>
                </div>
              </div>

              <div className="invoice-parties">
                <div>
                  <small>SOLD BY</small>
                  <b>{order.seller}</b>
                  <p>{order.city}, Tunisia</p>
                </div>
                <div>
                  <small>DELIVERED TO</small>
                  <b>{order.buyer}</b>
                  <p>{order.address || order.city}, Tunisia</p>
                  <p>{order.phone || ''}</p>
                </div>
              </div>

              <table className="invoice-table">
                <thead>
                  <tr>
                    <th>Item Description</th>
                    <th>Qty</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(order.products || []).map((p, i) => (
                    <tr key={i}>
                      <td>
                        <b>{p.name}</b>
                        {p.selectedVariant && <small><br />Option: {p.selectedVariant}</small>}
                      </td>
                      <td>{p.qty || 1}</td>
                      <td>{money(p.price)}</td>
                      <td>{money((p.price || 0) * (p.qty || 1))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="invoice-summary-box">
                <div className="summary-line">
                  <span>Subtotal:</span>
                  <b>{money(order.subtotal || order.total)}</b>
                </div>
                <div className="summary-line">
                  <span>Shipping / Courier:</span>
                  <b>0.000 TND (Free Inspection)</b>
                </div>
                <div className="summary-line total-line">
                  <span>Grand Total (COD):</span>
                  <strong>{money(order.total)}</strong>
                </div>
              </div>

              <div className="invoice-footer-note">
                <p>Thank you for shopping local with MARCHY. Cash on delivery guarantee applies.</p>
              </div>
            </div>

            <div className="invoice-modal-actions">
              <button
                type="button"
                className="primary-btn"
                onClick={() => window.print()}
              >
                <Printer size={15} /> Print Receipt
              </button>
              <button
                type="button"
                className="outline-btn"
                onClick={() => setInvoiceOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Seller Modal */}
      {contactOpen && (
        <div className="quick-view-backdrop" role="presentation">
          <div id="buyer-contact-dialog" className="contact-modal-card" role="dialog" aria-modal="true" aria-labelledby="buyer-contact-title" aria-describedby="buyer-contact-description">
            <button
              type="button"
              className="quick-view-close"
              onClick={() => setContactOpen(false)}
              aria-label="Close"
            >
              ✕
            </button>
            <span className="eyebrow">DIRECT SELLER CONNECTION</span>
            <h3 id="buyer-contact-title">Contact {order.seller}</h3>
            <p id="buyer-contact-description">Seller contact is a preview only. Direct messaging and verified merchant contact details will be connected with the backend.</p>
            <div className="seller-contact-methods">
              <div className="contact-method-item">
                <Phone size={18} />
                <div>
                  <b>Phone Support</b>
                  <span>Merchant phone details are not connected in this demo.</span>
                </div>
              </div>
              <div className="contact-method-item">
                <MapPin size={18} />
                <div>
                  <b>Storefront Location</b>
                  <span>{order.city}, Tunisia</span>
                </div>
              </div>
            </div>
            <form onSubmit={e => { e.preventDefault(); toast('Messaging is not connected in this demo yet.', { type: 'info' }); }}>
              <label>
                Send a quick note regarding Order #{order.id}:
                <textarea rows="3" placeholder="e.g. Please deliver after 2 PM, or call upon arrival at building entrance..." required />
              </label>
              <button type="submit" className="primary-btn full-btn">Preview Message</button>
            </form>
          </div>
        </div>
      )}
    </OpsShell>
  )
}
