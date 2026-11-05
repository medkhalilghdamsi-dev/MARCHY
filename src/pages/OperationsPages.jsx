import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { readJson, writeJson, money } from '../utils/marketplace'

const STORAGE_KEY = 'marchy-demo-operations-v1'
const seedOrders = [
  { id: 'MC-1048', buyer: 'Amira Ben Salem', city: 'Tunis', seller: 'Atlas Tech Tunis', items: 2, total: 489.900, payment: 'Cash on delivery', status: 'Ready for pickup', created: 'Today, 09:20', courier: 'Tunis Express' },
  { id: 'MC-1047', buyer: 'Youssef Trabelsi', city: 'Ariana', seller: 'Medina Home Studio', items: 1, total: 129.000, payment: 'Cash on delivery', status: 'In transit', created: 'Today, 08:45', courier: 'Rapid Delivery' },
  { id: 'MC-1046', buyer: 'Sarra Gharbi', city: 'Sousse', seller: 'Northstar Market', items: 3, total: 276.500, payment: 'Online payment · demo', status: 'Delivered', created: 'Yesterday, 16:10', courier: 'Coastal Express' },
  { id: 'MC-1045', buyer: 'Malek Karray', city: 'Sfax', seller: 'Atlas Tech Tunis', items: 1, total: 899.000, payment: 'Cash on delivery', status: 'Processing', created: 'Yesterday, 13:32', courier: 'Unassigned' },
  { id: 'MC-1044', buyer: 'Nour Jaziri', city: 'Nabeul', seller: 'Medina Home Studio', items: 2, total: 84.000, payment: 'Cash on delivery', status: 'Cancelled', created: 'Yesterday, 11:05', courier: 'Unassigned' },
]
const statuses = ['Processing', 'Ready for pickup', 'In transit', 'Delivered', 'Cancelled']
function useDemoOrders() {
  const [orders, setOrders] = useState(() => readJson(STORAGE_KEY, seedOrders))
  useEffect(() => writeJson(STORAGE_KEY, orders), [orders])
  useEffect(() => {
    const sync = event => { if (event.key === STORAGE_KEY && event.newValue) { try { setOrders(JSON.parse(event.newValue)) } catch {} } }
    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [])
  const updateOrder = (id, patch) => setOrders(current => current.map(order => order.id === id ? { ...order, ...patch, updatedAt: new Date().toISOString() } : order))
  return { orders, updateOrder, reset: () => setOrders(seedOrders) }
}
function Status({ value }) {
  return <span className={'ops-status ops-status-' + value.toLowerCase().replaceAll(' ', '-')}>{value}</span>
}
function OpsShell({ title, eyebrow, children, active }) {
  return <main id="main-content" className="shell page ops-page">
    <div className="breadcrumbs"><Link to="/">Home</Link> / <span>Operations</span> / <span>{title}</span></div>
    <header className="ops-heading"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>One shared operational demo across MARCHY. Changes are saved in this browser only.</p></div><span className="ops-demo-label">DEMO DATA · NOT LIVE</span></header>
    <nav className="ops-nav" aria-label="Operations workspaces"><Link className={active==='delivery'?'active':''} to="/operations/delivery">Delivery operations</Link><Link className={active==='admin'?'active':''} to="/admin">Platform admin</Link><Link to="/seller-dashboard">Merchant workspace</Link><Link to="/">Buyer marketplace</Link></nav>
    {children}
    <p className="ops-disclaimer">Prototype only. No real customer information, courier assignment, payment, order fulfilment or platform administration is connected. The senior developer can replace this demo store with authenticated API services.</p>
  </main>
}
function OrderTable({ orders, updateOrder, delivery = false }) {
  return <div className="ops-table-wrap"><table className="ops-table"><thead><tr><th>Order</th><th>Customer</th><th>Destination</th><th>Merchant</th><th>Total</th><th>Status</th>{delivery&&<th>Courier</th>}<th>Update</th></tr></thead><tbody>{orders.map(order=><tr key={order.id}><td><b>{order.id}</b><small>{order.created}</small></td><td>{order.buyer}<small>{order.items} item{order.items===1?'':'s'}</small></td><td>{order.city}</td><td>{order.seller}</td><td>{money(order.total)}</td><td><Status value={order.status}/></td>{delivery&&<td><select aria-label={'Courier for '+order.id} value={order.courier} onChange={e=>updateOrder(order.id,{courier:e.target.value})}><option>Unassigned</option><option>Tunis Express</option><option>Rapid Delivery</option><option>Coastal Express</option><option>Partner courier</option></select></td>}<td><select aria-label={'Status for '+order.id} value={order.status} onChange={e=>updateOrder(order.id,{status:e.target.value})}>{statuses.map(status=><option key={status}>{status}</option>)}</select></td></tr>)}</tbody></table>{orders.length===0&&<div className="ops-empty">No orders match this view.</div>}</div>
}
export function DeliveryOperationsPage() {
  const { orders, updateOrder, reset } = useDemoOrders()
  const [filter,setFilter] = useState('Active')
  const visible = useMemo(()=>orders.filter(order=>filter==='All'||(filter==='Active'&&!['Delivered','Cancelled'].includes(order.status))||order.status===filter),[orders,filter])
  const active = orders.filter(order=>!['Delivered','Cancelled'].includes(order.status))
  return <OpsShell title="Delivery operations" eyebrow="MARCHY FULFILMENT" active="delivery">
    <section className="ops-stat-grid"><article><span>ACTIVE SHIPMENTS</span><b>{active.length}</b><small>Orders still being fulfilled</small></article><article><span>READY FOR PICKUP</span><b>{orders.filter(x=>x.status==='Ready for pickup').length}</b><small>Awaiting courier collection</small></article><article><span>IN TRANSIT</span><b>{orders.filter(x=>x.status==='In transit').length}</b><small>Assigned delivery journeys</small></article><article><span>DELIVERED</span><b>{orders.filter(x=>x.status==='Delivered').length}</b><small>Completed demo orders</small></article></section>
    <section className="ops-panel"><div className="ops-panel-head"><div><span className="eyebrow">FULFILMENT QUEUE</span><h2>Order handover and tracking</h2><p>Assign a demo courier and move an order through its fulfilment stages.</p></div><button className="ops-reset" type="button" onClick={reset}>Reset demo data</button></div><div className="ops-filters">{['Active','All',...statuses].map(item=><button type="button" key={item} className={filter===item?'active':''} onClick={()=>setFilter(item)}>{item}</button>)}</div><OrderTable orders={visible} updateOrder={updateOrder} delivery/></section>
  </OpsShell>
}
export function AdminOperationsPage() {
  const { orders, updateOrder, reset } = useDemoOrders()
  const [query,setQuery] = useState('')
  const [filter,setFilter] = useState('All')
  const visible = orders.filter(order=>(filter==='All'||order.status===filter)&&[order.id,order.buyer,order.seller,order.city].join(' ').toLowerCase().includes(query.toLowerCase()))
  const gross = orders.filter(order=>order.status!=='Cancelled').reduce((sum,order)=>sum+order.total,0)
  return <OpsShell title="Platform overview" eyebrow="MARCHY CONTROL CENTRE" active="admin">
    <section className="ops-stat-grid"><article><span>DEMO ORDERS</span><b>{orders.length}</b><small>Across all sample merchants</small></article><article><span>GROSS ORDER VALUE</span><b>{money(gross)}</b><small>Excludes cancelled orders</small></article><article><span>NEEDS ATTENTION</span><b>{orders.filter(x=>['Processing','Ready for pickup'].includes(x.status)).length}</b><small>Orders not yet in transit</small></article><article><span>COMPLETION RATE</span><b>{orders.length?Math.round(orders.filter(x=>x.status==='Delivered').length/orders.length*100):0}%</b><small>Illustrative demo metric</small></article></section>
    <section className="ops-panel"><div className="ops-panel-head"><div><span className="eyebrow">MARKETPLACE OPERATIONS</span><h2>All marketplace orders</h2><p>Review order flow across buyers, merchants and delivery operations.</p></div><button className="ops-reset" type="button" onClick={reset}>Reset demo data</button></div><div className="ops-toolbar"><label>Search orders<input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Order, customer, merchant or city"/></label><label>Order status<select value={filter} onChange={e=>setFilter(e.target.value)}><option>All</option>{statuses.map(status=><option key={status}>{status}</option>)}</select></label></div><OrderTable orders={visible} updateOrder={updateOrder}/></section>
    <section className="ops-shortcuts"><Link to="/seller-dashboard"><b>Merchant workspace</b><span>Product catalogue and storefront preview →</span></Link><Link to="/operations/delivery"><b>Delivery operations</b><span>Courier assignment and fulfilment stages →</span></Link><Link to="/"><b>Buyer marketplace</b><span>Browse the customer shopping experience →</span></Link></section>
  </OpsShell>
}
