import { useState } from 'react'
import { Link } from 'react-router-dom'
import { money } from '../utils/marketplace'
import { useDemoOrders } from '../hooks/useDemoOrders'
import { translateText } from '../i18n/translate'
import { OpsShell, OrderTable, statuses } from './OperationsShared'

function AdminOperationsPage({ language }) {
  const { orders, updateOrder, reset } = useDemoOrders()
  const [query,setQuery] = useState('')
  const [filter,setFilter] = useState('All')
  const visible = orders.filter(order=>(filter==='All'||order.status===filter)&&[order.id,order.buyer,order.seller,order.city].join(' ').toLowerCase().includes(query.toLowerCase()))
  const gross = orders.filter(order=>order.status!=='Cancelled').reduce((sum,order)=>sum+order.total,0)
  return <OpsShell title="Platform overview" eyebrow="MARCHY CONTROL CENTRE" active="admin" language={language}>
    <section className="ops-stat-grid"><article><span>DEMO ORDERS</span><b>{orders.length}</b><small>Across all sample merchants</small></article><article><span>GROSS ORDER VALUE</span><b>{money(gross)}</b><small>Excludes cancelled orders</small></article><article><span>NEEDS ATTENTION</span><b>{orders.filter(x=>['Processing','Ready for pickup'].includes(x.status)).length}</b><small>Orders not yet in transit</small></article><article><span>COMPLETION RATE</span><b>{orders.length?Math.round(orders.filter(x=>x.status==='Delivered').length/orders.length*100):0}%</b><small>Illustrative demo metric</small></article></section>
    <section className="ops-panel"><div className="ops-panel-head"><div><span className="eyebrow">MARKETPLACE OPERATIONS</span><h2>All marketplace orders</h2><p>Review order flow across buyers, merchants and delivery operations.</p></div><button className="ops-reset" type="button" onClick={reset}>Reset demo data</button></div><div className="ops-toolbar"><label>Search orders<input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Order, customer, merchant or city"/></label><label>Order status<select value={filter} onChange={e=>setFilter(e.target.value)}><option>All</option>{statuses.map(status=><option key={status} value={status}>{translateText(status, language)}</option>)}</select></label></div><OrderTable orders={visible} updateOrder={updateOrder} language={language}/></section>
    <section className="ops-shortcuts"><Link to="/seller-dashboard"><b>Merchant workspace</b><span>Product catalogue and storefront preview →</span></Link><Link to="/operations/delivery"><b>Delivery operations</b><span>Courier assignment and fulfilment stages →</span></Link><Link to="/"><b>Buyer marketplace</b><span>Browse the customer shopping experience →</span></Link></section>
  </OpsShell>
}

export { AdminOperationsPage }
