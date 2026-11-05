import { useState } from 'react'
import { Link } from 'react-router-dom'
import { money } from '../../utils/marketplace'
import { useDemoOrders } from '../../hooks/useDemoOrders'
import { useMarketplace } from '../../providers/MarketplaceContext'
import { translateTree, translateText } from '../../i18n/translate'
import { statuses, Status } from '../shared/OperationsShared'

export function BuyerOrdersPage(props) {
  const { language: ctxLanguage } = useMarketplace()
  const language = props?.language || ctxLanguage
  const { orders } = useDemoOrders()
  const [filter, setFilter] = useState('All')
  const [query, setQuery] = useState('')
  const visible = orders.filter(order =>
    (filter === 'All' || order.status === filter) &&
    [order.id, order.buyer, order.seller, order.city].join(' ').toLowerCase().includes(query.toLowerCase())
  )
  return translateTree(<main id="main-content" className="shell page buyer-orders-page">
    <div className="breadcrumbs"><Link to="/">Home</Link> / <Link to="/account">Account</Link> / <span>Orders</span></div>
    <header className="buyer-orders-heading"><div><span className="eyebrow">YOUR MARCHY ACTIVITY</span><h1>Your orders</h1><p>Review sample purchases and follow each merchant order through delivery.</p></div><span className="ops-demo-label">DEMO DATA · NOT LIVE</span></header>
    <div className="buyer-orders-toolbar">
      <label>Search orders<input value={query} onChange={event => setQuery(event.target.value)} placeholder="Order ID, seller or city"/></label>
      <label>Order status<select value={filter} onChange={event => setFilter(event.target.value)}><option value="All">All</option>{statuses.map(status=><option key={status} value={status}>{translateText(status, language)}</option>)}</select></label>
    </div>
    <div className="buyer-orders-results"><b>{visible.length} orders</b><span>Sample activity stored in this browser only</span></div>
    {visible.length ? <div className="buyer-orders-list">{visible.map(order=><article className="buyer-order-card" key={order.id}>
      <div className="buyer-order-card-top"><div><span className="eyebrow">ORDER REFERENCE</span><Link to={'/orders/' + order.id} className="buyer-order-reference">{order.id}</Link><small>{order.created}</small></div><Status value={order.status} language={language}/></div>
      <div className="buyer-order-card-details"><div><small>MERCHANT</small><b>{order.seller}</b></div><div><small>DESTINATION</small><b>{order.city}</b></div><div><small>ITEMS</small><b>{order.items}</b></div><div><small>PRODUCT TOTAL</small><b>{money(order.total)}</b></div></div>
      <div className="buyer-order-card-bottom"><span>{order.payment}</span><Link to={'/orders/' + order.id} className="primary-btn">Track order →</Link></div>
    </article>)}</div> : <div className="ops-empty buyer-orders-empty">No orders match your search. Try another order ID, seller or status.</div>}
    <p className="ops-disclaimer">Prototype only. These sample orders are not linked to a verified buyer account, payment or live courier feed.</p>
    <Link to="/account" className="text-link">← Back to account</Link>
  </main>, language)
}
