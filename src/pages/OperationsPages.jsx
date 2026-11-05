import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { money } from '../utils/marketplace'
import { useDemoOrders } from '../hooks/useDemoOrders'
import { translateTree, translateText } from '../i18n/translate'

const statuses = ['Processing', 'Ready for pickup', 'In transit', 'Delivered', 'Cancelled']

function Status({ value, language }) {
  return <span className={'ops-status ops-status-' + value.toLowerCase().replaceAll(' ', '-')}>{translateText(value, language)}</span>
}
function OpsShell({ title, eyebrow, children, active, language }) {
  return translateTree(<main id="main-content" className="shell page ops-page">
    <div className="breadcrumbs"><Link to="/">Home</Link> / <span>Operations</span> / <span>{title}</span></div>
    <header className="ops-heading"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>One shared operational demo across MARCHY. Changes are saved in this browser only.</p></div><span className="ops-demo-label">DEMO DATA · NOT LIVE</span></header>
    <nav className="ops-nav" aria-label="Operations workspaces"><Link className={active==='delivery'?'active':''} to="/operations/delivery">Delivery operations</Link><Link className={active==='admin'?'active':''} to="/admin">Platform admin</Link><Link to="/seller-dashboard">Merchant workspace</Link><Link to="/">Buyer marketplace</Link></nav>
    {children}
    <p className="ops-disclaimer">Prototype only. No real customer information, courier assignment, payment, order fulfilment or platform administration is connected. The senior developer can replace this demo store with authenticated API services.</p>
  </main>, language)
}
function OrderTable({ orders, updateOrder, delivery = false, language }) {
  return <div className="ops-table-wrap"><table className="ops-table"><thead><tr><th>{translateText('Order', language)}</th><th>{translateText('Customer', language)}</th><th>{translateText('Destination', language)}</th><th>{translateText('Merchant', language)}</th><th>{translateText('Total', language)}</th><th>{translateText('Status', language)}</th>{delivery&&<th>{translateText('Courier', language)}</th>}<th>{translateText('Update', language)}</th></tr></thead><tbody>{orders.map(order=><tr key={order.id}><td><b>{order.id}</b><small>{order.created}</small></td><td>{order.buyer}<small>{order.items} item{order.items===1?'':'s'}</small></td><td>{order.city}</td><td>{order.seller}</td><td>{money(order.total)}</td><td><Status value={order.status} language={language}/></td>{delivery&&<td><select aria-label={'Courier for '+order.id} value={order.courier} onChange={e=>updateOrder(order.id,{courier:e.target.value})}><option>Unassigned</option><option>Tunis Express</option><option>Rapid Delivery</option><option>Coastal Express</option><option>Partner courier</option></select></td>}<td><select aria-label={'Status for '+order.id} value={order.status} onChange={e=>updateOrder(order.id,{status:e.target.value})}>{statuses.map(status=><option key={status}>{status}</option>)}</select></td></tr>)}</tbody></table>{orders.length===0&&<div className="ops-empty">No orders match this view.</div>}</div>
}
export function DeliveryOperationsPage({ language }) {
  const { orders, updateOrder, reset } = useDemoOrders()
  const [filter,setFilter] = useState('Active')
  const visible = useMemo(()=>orders.filter(order=>filter==='All'||(filter==='Active'&&!['Delivered','Cancelled'].includes(order.status))||order.status===filter),[orders,filter])
  const active = orders.filter(order=>!['Delivered','Cancelled'].includes(order.status))
  return <OpsShell title="Delivery operations" eyebrow="MARCHY FULFILMENT" active="delivery" language={language}>
    <section className="ops-stat-grid"><article><span>ACTIVE SHIPMENTS</span><b>{active.length}</b><small>Orders still being fulfilled</small></article><article><span>READY FOR PICKUP</span><b>{orders.filter(x=>x.status==='Ready for pickup').length}</b><small>Awaiting courier collection</small></article><article><span>IN TRANSIT</span><b>{orders.filter(x=>x.status==='In transit').length}</b><small>Assigned delivery journeys</small></article><article><span>DELIVERED</span><b>{orders.filter(x=>x.status==='Delivered').length}</b><small>Completed demo orders</small></article></section>
    <section className="ops-panel"><div className="ops-panel-head"><div><span className="eyebrow">FULFILMENT QUEUE</span><h2>Order handover and tracking</h2><p>Assign a demo courier and move an order through its fulfilment stages.</p></div><button className="ops-reset" type="button" onClick={reset}>Reset demo data</button></div><div className="ops-filters">{['Active','All',...statuses].map(item=><button type="button" key={item} className={filter===item?'active':''} onClick={()=>setFilter(item)}>{item}</button>)}</div><OrderTable orders={visible} updateOrder={updateOrder} delivery language={language}/></section>
  </OpsShell>
}
export function AdminOperationsPage({ language }) {
  const { orders, updateOrder, reset } = useDemoOrders()
  const [query,setQuery] = useState('')
  const [filter,setFilter] = useState('All')
  const visible = orders.filter(order=>(filter==='All'||order.status===filter)&&[order.id,order.buyer,order.seller,order.city].join(' ').toLowerCase().includes(query.toLowerCase()))
  const gross = orders.filter(order=>order.status!=='Cancelled').reduce((sum,order)=>sum+order.total,0)
  return <OpsShell title="Platform overview" eyebrow="MARCHY CONTROL CENTRE" active="admin" language={language}>
    <section className="ops-stat-grid"><article><span>DEMO ORDERS</span><b>{orders.length}</b><small>Across all sample merchants</small></article><article><span>GROSS ORDER VALUE</span><b>{money(gross)}</b><small>Excludes cancelled orders</small></article><article><span>NEEDS ATTENTION</span><b>{orders.filter(x=>['Processing','Ready for pickup'].includes(x.status)).length}</b><small>Orders not yet in transit</small></article><article><span>COMPLETION RATE</span><b>{orders.length?Math.round(orders.filter(x=>x.status==='Delivered').length/orders.length*100):0}%</b><small>Illustrative demo metric</small></article></section>
    <section className="ops-panel"><div className="ops-panel-head"><div><span className="eyebrow">MARKETPLACE OPERATIONS</span><h2>All marketplace orders</h2><p>Review order flow across buyers, merchants and delivery operations.</p></div><button className="ops-reset" type="button" onClick={reset}>Reset demo data</button></div><div className="ops-toolbar"><label>Search orders<input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Order, customer, merchant or city"/></label><label>Order status<select value={filter} onChange={e=>setFilter(e.target.value)}><option>All</option>{statuses.map(status=><option key={status}>{status}</option>)}</select></label></div><OrderTable orders={visible} updateOrder={updateOrder} language={language}/></section>
    <section className="ops-shortcuts"><Link to="/seller-dashboard"><b>Merchant workspace</b><span>Product catalogue and storefront preview →</span></Link><Link to="/operations/delivery"><b>Delivery operations</b><span>Courier assignment and fulfilment stages →</span></Link><Link to="/"><b>Buyer marketplace</b><span>Browse the customer shopping experience →</span></Link></section>
  </OpsShell>
}

export function BuyerOrderTrackingPage({ language }) {
  const { id } = useParams()
  const { orders } = useDemoOrders()
  const order = orders.find(item => item.id === id)
  if (!order) return <OpsShell title="Order not found" eyebrow="ORDER TRACKING" language={language}><section className="ops-panel"><p>This sample order could not be found in this browser.</p><Link to="/account">Return to your account</Link></section></OpsShell>
  const steps = ['Processing', 'Ready for pickup', 'In transit', 'Delivered']
  const current = steps.indexOf(order.status)
  const cancelled = order.status === 'Cancelled'
  return <OpsShell title={'Track ' + order.id} eyebrow="BUYER ORDER PREVIEW" language={language}>
    <section className="ops-panel buyer-tracking-panel">
      <div className="ops-panel-head"><div><span className="eyebrow">ORDER STATUS · SAMPLE DATA</span><h2>{order.status}</h2><p>Example order placed by {order.buyer} for delivery to {order.city}. This is not a real customer order.</p></div><Status value={order.status} language={language}/></div>
      <div className="buyer-tracking-meta"><div><small>ORDER TOTAL</small><b>{money(order.total)}</b></div><div><small>ITEMS</small><b>{order.items}</b></div><div><small>PAYMENT</small><b>{order.payment}</b></div><div><small>DELIVERY PARTNER</small><b>{order.courier}</b></div></div>
      {cancelled?<div className="buyer-tracking-cancelled"><b>This sample order is cancelled.</b><p>No delivery is expected.</p></div>:<ol className="buyer-tracking-steps">{steps.map((step,index)=><li className={current>=index?'complete':''} key={step}><span className="buyer-tracking-step-dot">{current>=index?'✓':index+1}</span><div><b>{step}</b><small>{index===0?'The merchant has received the sample order.':index===1?'The sample parcel is ready for courier collection.':index===2?'The sample parcel is with the delivery partner.':'The sample parcel has reached its destination.'}</small></div></li>)}</ol>}
      <p className="ops-disclaimer">Tracking events are illustrative and update when a merchant, delivery operator or administrator changes the shared demo order status. No live courier feed is connected.</p>
      <Link to="/account" className="text-link">← Back to account activity</Link>
    </section>
  </OpsShell>
}
