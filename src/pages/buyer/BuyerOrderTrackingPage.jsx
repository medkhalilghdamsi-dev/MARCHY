import { Link, useParams } from 'react-router-dom'
import { money } from '../../utils/marketplace'
import { useDemoOrders } from '../../hooks/useDemoOrders'
import { useMarketplace } from '../../providers/MarketplaceContext'
import { Status, OpsShell } from '../shared/OperationsShared'

export function BuyerOrderTrackingPage(props) {
  const { language: ctxLanguage } = useMarketplace()
  const language = props?.language || ctxLanguage
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
      <div className="buyer-tracking-meta"><div><small>PRODUCT TOTAL</small><b>{money(order.total)}</b></div><div><small>ITEMS</small><b>{order.items}</b></div><div><small>PAYMENT</small><b>{order.payment}</b></div><div><small>DELIVERY PARTNER</small><b>{order.courier}</b></div></div>
      {cancelled?<div className="buyer-tracking-cancelled"><b>This sample order is cancelled.</b><p>No delivery is expected.</p></div>:<ol className="buyer-tracking-steps">{steps.map((step,index)=><li className={current>=index?'complete':''} key={step}><span className="buyer-tracking-step-dot">{current>=index?'✓':index+1}</span><div><b>{step}</b><small>{index===0?'The merchant has received the sample order.':index===1?'The sample parcel is ready for courier collection.':index===2?'The sample parcel is with the delivery partner.':'The sample parcel has reached its destination.'}</small></div></li>)}</ol>}
      <p className="ops-disclaimer">Tracking events are illustrative and update when a merchant, delivery operator or administrator changes the shared demo order status. No live courier feed is connected.</p>
      <Link to="/account" className="text-link">← Back to account activity</Link>
    </section>
  </OpsShell>
}
