import { Link } from 'react-router-dom'
import { money } from '../../utils/marketplace'
import { translateTree, translateText } from '../../i18n/translate'

export const statuses = ['Processing', 'Ready for pickup', 'In transit', 'Delivered', 'Cancelled']

export function Status({ value, language }) {
  return <span className={'ops-status ops-status-' + value.toLowerCase().replaceAll(' ', '-')}>{translateText(value, language)}</span>
}

export function OpsShell({ title, eyebrow, children, active, language }) {
  return translateTree(<main id="main-content" className="shell page ops-page">
    <div className="breadcrumbs"><Link to="/">Home</Link> / <span>Operations</span> / <span>{title}</span></div>
    <header className="ops-heading"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>One shared operational demo across MARCHY. Changes are saved in this browser only.</p></div><span className="ops-demo-label">DEMO DATA · NOT LIVE</span></header>
    <nav className="ops-nav" aria-label="Operations workspaces"><Link className={active==='delivery'?'active':''} to="/operations/delivery">Delivery operations</Link><Link className={active==='admin'?'active':''} to="/admin">Platform admin</Link><Link to="/seller-dashboard">Merchant workspace</Link><Link to="/">Buyer marketplace</Link></nav>
    {children}
    <p className="ops-disclaimer">Prototype only. No real customer information, courier assignment, payment, order fulfilment or platform administration is connected. The senior developer can replace this demo store with authenticated API services.</p>
  </main>, language)
}

export function OrderTable({ orders, updateOrder, delivery = false, language }) {
  return <div className="ops-table-wrap"><table className="ops-table"><thead><tr><th>{translateText('Order', language)}</th><th>{translateText('Customer', language)}</th><th>{translateText('Destination', language)}</th><th>{translateText('Merchant', language)}</th><th>{translateText('Total', language)}</th><th>{translateText('Status', language)}</th>{delivery&&<th>{translateText('Courier', language)}</th>}<th>{translateText('Update', language)}</th></tr></thead><tbody>{orders.map(order=><tr key={order.id}><td><Link className="ops-order-link" to={'/orders/' + order.id}>{order.id}</Link><small>{order.created}</small></td><td>{order.buyer}<small>{order.items} item{order.items===1?'':'s'}</small></td><td>{order.city}</td><td>{order.seller}</td><td>{money(order.total)}</td><td><Status value={order.status} language={language}/></td>{delivery&&<td><select aria-label={'Courier for '+order.id} value={order.courier} onChange={e=>updateOrder(order.id,{courier:e.target.value})}><option>Unassigned</option><option>Tunis Express</option><option>Rapid Delivery</option><option>Coastal Express</option><option>Partner courier</option></select></td>}<td><select aria-label={'Status for '+order.id} value={order.status} onChange={e=>updateOrder(order.id,{status:e.target.value})}>{statuses.map(status=><option key={status} value={status}>{translateText(status, language)}</option>)}</select></td></tr>)}</tbody></table>{orders.length===0&&<div className="ops-empty">No orders match this view.</div>}</div>
}

