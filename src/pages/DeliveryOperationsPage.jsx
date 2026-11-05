import { useMemo, useState } from 'react'
import { useDemoOrders } from '../hooks/useDemoOrders'
import { OpsShell, OrderTable, statuses } from './OperationsShared'

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

export { DeliveryOperationsPage }
