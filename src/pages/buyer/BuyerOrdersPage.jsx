import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { money } from '../../utils/marketplace'
import { useDemoOrders } from '../../hooks/useDemoOrders'
import { useMarketplace } from '../../providers/MarketplaceContext'
import { useToast } from '../../providers/ToastProvider'
import { translateTree } from '../../i18n/translate'
import { Status } from '../shared/OperationsShared'
import { ArrowLeft, Check, Package, RotateCcw, Search, X } from 'lucide-react'

const ORDER_TABS = ['All', 'Processing', 'In transit', 'Delivered', 'Cancelled']
const canCancelOrder = status => status === 'Processing' || status === 'Ready for pickup'

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

  const counts = useMemo(() => ({
    All: orders.length,
    Processing: orders.filter(order => ['Processing', 'Ready for pickup'].includes(order.status)).length,
    'In transit': orders.filter(order => order.status === 'In transit').length,
    Delivered: orders.filter(order => order.status === 'Delivered').length,
    Cancelled: orders.filter(order => order.status === 'Cancelled').length,
  }), [orders])

  const visible = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase()
    return orders.filter(order => {
      const matchesTab = activeTab === 'All' ||
        (activeTab === 'Processing'
          ? ['Processing', 'Ready for pickup'].includes(order.status)
          : order.status === activeTab)
      const searchable = [
        order.id, order.buyer, order.seller, order.city, order.address,
        order.status, ...(order.products || []).map(product => product.name)
      ].filter(Boolean).join(' ').toLocaleLowerCase()
      return matchesTab && (!normalizedQuery || searchable.includes(normalizedQuery))
    })
  }, [orders, activeTab, query])

  const handleReorder = order => {
    if (!Array.isArray(order.products) || order.products.length === 0) {
      toast('This order has no item details available to reorder.', { type: 'error' })
      return
    }
    order.products.forEach(product => {
      addToCart({
        ...product,
        sellerSlug: product.sellerSlug || order.sellerSlug || null,
        sellerName: product.sellerName || order.seller || null,
        sellerCity: product.sellerCity || order.sellerCity || null,
      }, product.qty || 1, product.selectedVariant || null)
    })
    toast(`Re-added ${order.products.length} item line(s) to your cart`, { type: 'success' })
    navigate('/cart')
  }

  const handleCancel = order => {
    if (!canCancelOrder(order.status)) return
    if (window.confirm(`Cancel order ${order.id}? This changes the local demo order only.`)) {
      cancelOrder(order.id, 'Cancelled from buyer orders list')
      toast('Order cancelled in this demo.', { type: 'info' })
    }
  }

  const resetFilters = () => {
    setActiveTab('All')
    setQuery('')
  }

  return translateTree(
    <main id="main-content" className="shell page buyer-orders-page">
      <div className="breadcrumbs">
        <Link to="/">Home</Link> / <Link to="/account">Account</Link> / <span>Orders</span>
      </div>

      <header className="buyer-orders-heading">
        <div>
          <span className="eyebrow">YOUR PURCHASES</span>
          <h1>Orders</h1>
          <p>Review order details, check the current demo status and return to a previous purchase.</p>
        </div>
        <Link to="/search" className="primary-btn">Explore marketplace <span aria-hidden="true">→</span></Link>
      </header>

      <div className="buyer-orders-demo-note" role="note">
        <span className="buyer-orders-demo-mark"><Package size={16} /></span>
        <p><strong>Demo order history</strong><span>Orders and status changes are stored in this browser. Live courier tracking, payments and merchant updates are not connected.</span></p>
      </div>

      {createdOrders.length > 0 && (
        <section className="buyer-order-success" role="status" aria-live="polite">
          <div>
            <span className="buyer-order-success-icon"><Check size={20} /></span>
            <div>
              <b>{createdOrders.length === 1 ? 'Your demo order has been created' : `${createdOrders.length} demo orders have been created`}</b>
              <p>Your order details are saved locally. Open an order to review its status and item information.</p>
            </div>
          </div>
          <div className="buyer-order-success-links">
            {createdOrders.map(order => (
              <Link key={order.id} to={`/orders/${order.id}`} className="primary-btn">View {order.id} <span aria-hidden="true">→</span></Link>
            ))}
          </div>
        </section>
      )}

      <section className="buyer-orders-workspace" aria-label="Order history">
        <div className="buyer-orders-section-heading">
          <div>
            <h2>Order history</h2>
            <p>{orders.length} order{orders.length === 1 ? '' : 's'} in this browser</p>
          </div>
          <span className="buyer-orders-local-label">LOCAL DEMO DATA</span>
        </div>

        <div className="order-tabs-row" role="tablist" aria-label="Filter orders by status">
          {ORDER_TABS.map(tab => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={activeTab === tab}
              aria-controls="buyer-orders-results"
              className={`order-tab-btn ${activeTab === tab ? 'is-active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}<span className="order-tab-count">{counts[tab]}</span>
            </button>
          ))}
        </div>

        <div className="buyer-orders-toolbar">
          <label className="order-search-input-wrap">
            <Search size={17} aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Search order number, merchant, item or destination"
              aria-label="Search orders"
            />
            {query && (
              <button type="button" aria-label="Clear search" onClick={() => setQuery('')}>
                <X size={15} />
              </button>
            )}
          </label>
          <span className="orders-count-label">
            <strong>{visible.length}</strong> of {orders.length} order{orders.length === 1 ? '' : 's'}
          </span>
        </div>

        <div id="buyer-orders-results" className="buyer-orders-results" role="tabpanel">
          {visible.length > 0 ? (
            <div className="buyer-orders-list">
              {visible.map(order => {
                const products = Array.isArray(order.products) ? order.products : []
                const itemCount = Number.isFinite(Number(order.items))
                  ? Number(order.items)
                  : products.reduce((sum, product) => sum + (product.qty || 1), 0)
                return (
                  <article className="buyer-order-card" key={order.id}>
                    <div className="buyer-order-card-top">
                      <div className="buyer-order-reference-block">
                        <span className="eyebrow">ORDER NUMBER</span>
                        <Link to={`/orders/${order.id}`} className="buyer-order-reference">{order.id}</Link>
                        <small>{order.created || 'Recently placed'} <span aria-hidden="true">·</span> {order.seller || 'MARCHY marketplace'}</small>
                      </div>
                      <Status value={order.status} language={language} />
                    </div>

                    <div className="buyer-order-products-row">
                      {products.length > 0 ? (
                        <div className="buyer-order-thumbnails" aria-label={`${products.length} product lines`}>
                          {products.slice(0, 4).map((product, index) => (
                            <div key={`${product.id || product.name}-${index}`} className="order-prod-thumb" title={`${product.name} (Qty: ${product.qty || 1})`}>
                              <img
                                src={product.image || '/product-placeholder.svg'}
                                alt={product.name || 'Ordered product'}
                                loading="lazy"
                                onError={event => { event.currentTarget.onerror = null; event.currentTarget.src = '/product-placeholder.svg' }}
                              />
                              <span className="thumb-qty">×{product.qty || 1}</span>
                            </div>
                          ))}
                          {products.length > 4 && <span className="buyer-order-more-items">+{products.length - 4}</span>}
                        </div>
                      ) : (
                        <div className="order-placeholder-thumb"><Package size={22} /></div>
                      )}
                      <div className="order-items-summary-text">
                        <b>{itemCount} item{itemCount === 1 ? '' : 's'}</b>
                        <small>Delivery destination: {order.city || 'Not provided'}{order.city ? ', Tunisia' : ''}</small>
                      </div>
                    </div>

                    <div className="buyer-order-card-details">
                      <div><small>MERCHANT</small><b>{order.seller || 'Not specified'}</b></div>
                      <div><small>PAYMENT METHOD</small><b>{order.payment || 'Not specified'}</b></div>
                      <div><small>{order.payment?.toLowerCase().includes('cash') ? 'AMOUNT DUE ON DELIVERY' : 'ORDER TOTAL'}</small><b className="order-total-price">{money(order.total)}</b></div>
                    </div>

                    <div className="buyer-order-card-bottom">
                      <div className="order-actions-left">
                        {canCancelOrder(order.status) && (
                          <button type="button" className="text-link danger-link" onClick={() => handleCancel(order)}>
                            Cancel order
                          </button>
                        )}
                        {products.length > 0 && (
                          <button type="button" className="text-link" onClick={() => handleReorder(order)}>
                            <RotateCcw size={13} /> Reorder
                          </button>
                        )}
                      </div>
                      <Link to={`/orders/${order.id}`} className="primary-btn">View order <span aria-hidden="true">→</span></Link>
                    </div>
                  </article>
                )
              })}
            </div>
          ) : (
            <div className="ops-empty buyer-orders-empty">
              <span className="buyer-orders-empty-icon"><Package size={28} /></span>
              <h3>{orders.length === 0 ? 'No orders yet' : 'No orders found'}</h3>
              <p>{orders.length === 0
                ? 'When you place an order, it will appear here with its items and status.'
                : 'Try a different search term or choose another status filter.'}</p>
              {orders.length === 0
                ? <Link to="/search" className="primary-btn">Discover products <span aria-hidden="true">→</span></Link>
                : <button type="button" className="outline-btn" onClick={resetFilters}>Clear filters</button>}
            </div>
          )}
        </div>
      </section>

      <div className="buyer-orders-footer-nav">
        <Link to="/account" className="text-link"><ArrowLeft size={14} /> Back to account</Link>
        <Link to="/search" className="text-link">Continue shopping <span aria-hidden="true">→</span></Link>
      </div>
    </main>,
    language
  )
}
