import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { money } from '../../utils/marketplace'
import { useDemoOrders } from '../../hooks/useDemoOrders'
import { useMarketplace } from '../../providers/MarketplaceContext'
import { useToast } from '../../providers/ToastProvider'
import { translateTree } from '../../i18n/translate'
import { Status } from '../shared/OperationsShared'
import {
  ArrowLeft, Check, Clock, Package, RotateCcw, Search,
  ShieldCheck, Truck, X
} from 'lucide-react'

export function BuyerOrdersPage(props) {
  const { language: ctxLanguage, addToCart } = useMarketplace()
  const language = props?.language || ctxLanguage
  const { orders, cancelOrder } = useDemoOrders()
  const location = useLocation()
  const navigate = useNavigate()
  const toast = useToast()

  const createdOrderIds = Array.isArray(location.state?.justCreatedOrderIds)
    ? location.state.justCreatedOrderIds
    : []
  const createdOrders = orders.filter(order => createdOrderIds.includes(order.id))

  const [activeTab, setActiveTab] = useState('All')
  const [query, setQuery] = useState('')

  const tabs = ['All', 'Processing', 'In transit', 'Delivered', 'Cancelled']

  const visible = orders.filter(order => {
    const matchesTab = activeTab === 'All' ||
      (activeTab === 'Processing' && (order.status === 'Processing' || order.status === 'Ready for pickup')) ||
      order.status === activeTab

    const haystack = [
      order.id,
      order.buyer,
      order.seller,
      order.city,
      ...(order.products || []).map(p => p.name)
    ].join(' ').toLowerCase()

    const matchesQuery = haystack.includes(query.toLowerCase())
    return matchesTab && matchesQuery
  })

  const handleReorder = (order) => {
    if (Array.isArray(order.products) && order.products.length > 0) {
      order.products.forEach(p => {
        addToCart(p, p.qty || 1, p.selectedVariant || null)
      })
      toast(`Re-added ${order.products.length} item(s) to cart`, { type: 'success' })
      navigate('/cart')
    } else {
      toast('No items to reorder', { type: 'error' })
    }
  }

  const handleCancel = (orderId) => {
    if (window.confirm('Cancel this order?')) {
      cancelOrder(orderId, 'Cancelled from orders list')
      toast('Order cancelled.', { type: 'info' })
    }
  }

  return translateTree(
    <main id="main-content" className="shell page buyer-orders-page">
      <div className="breadcrumbs">
        <Link to="/">Home</Link> / <Link to="/account">Account</Link> / <span>Orders</span>
      </div>

      <header className="buyer-orders-heading">
        <div>
          <span className="eyebrow">ORDER MANAGEMENT & TRACKING</span>
          <h1>Your orders</h1>
          <p>Follow your purchases across Tunisian merchant storefronts with live tracking and COD protection.</p>
        </div>
        <Link to="/search" className="primary-btn">Explore new finds →</Link>
      </header>

      {createdOrders.length > 0 && (
        <section className="buyer-order-success" role="status" aria-live="polite">
          <div>
            <span className="buyer-order-success-icon"><Check size={20} /></span>
            <div>
              <b>{createdOrders.length === 1 ? 'Your order is confirmed & ready to track' : `${createdOrders.length} orders created across sellers`}</b>
              <p>Your order was saved with Cash on Delivery inspection protection. You can monitor courier milestones below.</p>
            </div>
          </div>
          <div>
            {createdOrders.map(order => (
              <Link key={order.id} to={`/orders/${order.id}`} className="primary-btn">
                Track {order.id} →
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Segmented Status Tabs */}
      <div className="order-tabs-row" role="tablist" aria-label="Filter orders">
        {tabs.map(tab => {
          const count = tab === 'All'
            ? orders.length
            : tab === 'Processing'
              ? orders.filter(o => o.status === 'Processing' || o.status === 'Ready for pickup').length
              : orders.filter(o => o.status === tab).length
          return (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={activeTab === tab}
              className={`order-tab-btn ${activeTab === tab ? 'is-active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab} <span>({count})</span>
            </button>
          )
        })}
      </div>

      {/* Toolbar Search */}
      <div className="buyer-orders-toolbar">
        <div className="order-search-input-wrap">
          <Search size={16} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by order #, merchant, item name or city…"
            aria-label="Search orders"
          />
          {query && <button type="button" onClick={() => setQuery('')}>✕</button>}
        </div>
        <span className="orders-count-label">
          Showing <b>{visible.length}</b> order{visible.length === 1 ? '' : 's'}
        </span>
      </div>

      {/* Orders List */}
      {visible.length > 0 ? (
        <div className="buyer-orders-list">
          {visible.map(order => (
            <article className="buyer-order-card" key={order.id}>
              <div className="buyer-order-card-top">
                <div>
                  <span className="eyebrow">ORDER REF</span>
                  <Link to={`/orders/${order.id}`} className="buyer-order-reference">
                    {order.id}
                  </Link>
                  <small>{order.created || 'Recently placed'} · {order.seller}</small>
                </div>
                <Status value={order.status} language={language} />
              </div>

              {/* Product Previews Row */}
              <div className="buyer-order-products-row">
                {Array.isArray(order.products) && order.products.length > 0 ? (
                  order.products.slice(0, 4).map((p, idx) => (
                    <div key={idx} className="order-prod-thumb" title={`${p.name} (Qty: ${p.qty || 1})`}>
                      <img
                        src={p.image || '/product-placeholder.svg'}
                        alt={p.name}
                        onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = '/product-placeholder.svg' }}
                      />
                      <span className="thumb-qty">×{p.qty || 1}</span>
                    </div>
                  ))
                ) : (
                  <div className="order-placeholder-thumb">
                    <Package size={22} />
                  </div>
                )}
                <div className="order-items-summary-text">
                  <b>{order.items} product{order.items === 1 ? '' : 's'}</b>
                  <small>Delivery to {order.city}, Tunisia</small>
                </div>
              </div>

              <div className="buyer-order-card-details">
                <div>
                  <small>MERCHANT</small>
                  <b>{order.seller}</b>
                </div>
                <div>
                  <small>PAYMENT</small>
                  <b>{order.payment}</b>
                </div>
                <div>
                  <small>TOTAL DUE (COD)</small>
                  <b className="order-total-price">{money(order.total)}</b>
                </div>
              </div>

              <div className="buyer-order-card-bottom">
                <div className="order-actions-left">
                  {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                    <button
                      type="button"
                      className="text-link danger-link"
                      onClick={() => handleCancel(order.id)}
                    >
                      Cancel order
                    </button>
                  )}
                  {Array.isArray(order.products) && order.products.length > 0 && (
                    <button
                      type="button"
                      className="text-link"
                      onClick={() => handleReorder(order)}
                    >
                      <RotateCcw size={13} /> Reorder items
                    </button>
                  )}
                </div>
                <Link to={`/orders/${order.id}`} className="primary-btn">
                  Track order →
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="ops-empty buyer-orders-empty">
          <Package size={36} />
          <h3>No orders match your filter</h3>
          <p>Try searching with another keyword or resetting the status tab.</p>
          <button type="button" className="outline-btn" onClick={() => { setActiveTab('All'); setQuery('') }}>
            Reset filters
          </button>
        </div>
      )}

      <div className="buyer-orders-footer-nav">
        <Link to="/account" className="text-link"><ArrowLeft size={14} /> Back to account</Link>
        <Link to="/search" className="text-link">Explore marketplace →</Link>
      </div>
    </main>,
    language
  )
}
