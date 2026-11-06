import { useMemo, useState } from 'react'
import { CheckCircle2, Clock3, Package, PackageCheck, Search, Truck, UserRound, MapPin, Phone, AlertCircle } from 'lucide-react'
import { useDemoOrders } from '../../hooks/useDemoOrders'
const PROFILE_KEY='marchy-seller-onboarding-draft-v1'
const readProfile=()=>{try{return JSON.parse(localStorage.getItem(PROFILE_KEY)||'{}')}catch{return {}}}
const steps=['New','Accepted','Preparing','Packed','Ready for pickup']
const stage=o=>o.sellerFulfilmentStatus||(['Delivered','In transit'].includes(o.status)?'Ready for pickup':o.status==='Ready for pickup'?'Ready for pickup':'New')
const money=n=>Number(n||0).toFixed(3)+' TND'
export function SellerOrdersWorkspace(){
 const {orders,updateOrder}=useDemoOrders()
 const [profile]=useState(readProfile),[selectedId,setSelectedId]=useState(''),[query,setQuery]=useState(''),[filter,setFilter]=useState('All'),[notice,setNotice]=useState('')
 const store=(profile.storeName||'').trim(), needle=store.toLocaleLowerCase()
 const assigned=useMemo(()=>orders.filter(o=>store&&(o.seller||'').trim().toLocaleLowerCase()===needle||(o.products||[]).some(p=>(p.sellerName||'').trim().toLocaleLowerCase()===needle)),[orders,store,needle])
 const visible=useMemo(()=>assigned.filter(o=>{const s=stage(o),match=filter==='All'||(filter==='Open'&&!['Delivered','Cancelled'].includes(o.status))||s===filter,hay=[o.id,o.buyer,o.phone,o.city,...(o.products||[]).map(p=>p.name)].join(' ').toLocaleLowerCase();return match&&hay.includes(query.trim().toLocaleLowerCase())}),[assigned,filter,query])
 const selected=assigned.find(o=>o.id===selectedId)||visible[0]||null
 const next=o=>{const i=steps.indexOf(stage(o));return i>=0&&i<steps.length-1?steps[i+1]:null}
 const advance=o=>{const target=next(o);if(!target||['Delivered','Cancelled','In transit'].includes(o.status))return;const patch={sellerFulfilmentStatus:target,sellerFulfilmentUpdatedAt:new Date().toISOString()};if(target==='Ready for pickup'){patch.status='Ready for pickup';patch.timeline=[...(o.timeline||[]),{status:'Ready for pickup',time:new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}),note:'Seller marked parcel ready for courier collection (local demo)',completed:true}]}updateOrder(o.id,patch);setSelectedId(o.id);setNotice(o.id+' updated to '+target+'. Local demo only.')}
 return <section className="sc-seller-orders">
 <header className="sc-seller-orders-head"><div><span className="eyebrow">SELLER OPERATIONS</span><h3>Orders & fulfilment</h3><p>Review orders assigned to your storefront, prepare parcels and record handoff readiness.</p></div><span>LOCAL DEMO · NOT LIVE</span></header>
 <div className="sc-order-demo-note"><AlertCircle size={16}/><span>Sample order data only. Orders are matched to the saved storefront name. No real customer, courier or payment action is performed.</span></div>
 {!store?<div className="sc-order-empty"><Package size={28}/><b>Set up your storefront first</b><p>Add your storefront name in Business profile. Seller orders are matched to that name in this demo.</p></div>:<>
 <div className="sc-order-stats"><div><b>{assigned.length}</b><span>Assigned orders</span></div><div><b>{assigned.filter(o=>!['Delivered','Cancelled'].includes(o.status)).length}</b><span>Open orders</span></div><div><b>{assigned.filter(o=>stage(o)==='Ready for pickup').length}</b><span>Ready for pickup</span></div></div>
 <div className="sc-order-workspace"><aside className="sc-order-list"><div className="sc-order-search"><Search size={15}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search order, buyer or product"/></div><div className="sc-order-filters">{['All','Open','New','Accepted','Preparing','Packed','Ready for pickup'].map(x=><button type="button" key={x} className={filter===x?'active':''} onClick={()=>setFilter(x)}>{x}</button>)}</div>
 {visible.map(o=><button type="button" key={o.id} className={'sc-order-row '+(selected?.id===o.id?'active':'')} onClick={()=>setSelectedId(o.id)}><span><b>{o.id}</b><small>{o.buyer} · {o.city}</small><small>{(o.products||[]).length} product line(s) · {money(o.total)}</small></span><i>{stage(o)}</i></button>)}{!visible.length&&<div className="sc-order-list-empty">No matching orders assigned to {store}.</div>}</aside>
 <article className="sc-order-detail">{selected?<><header><div><span className="eyebrow">ORDER DETAIL</span><h4>{selected.id}</h4><small>Placed {selected.created||selected.createdAt||'—'}</small></div><b className="sc-order-stage">{stage(selected)}</b></header>
 <div className="sc-order-customer"><div><UserRound size={15}/><b>{selected.buyer}</b></div><div><Phone size={14}/>{selected.phone||'No phone supplied'}</div><div><MapPin size={14}/>{[selected.address,selected.city].filter(Boolean).join(', ')||'No address supplied'}</div></div>
 <div className="sc-order-products"><b>Items to prepare</b>{(selected.products||[]).map((p,i)=><div key={p.id+'-'+i}><span><b>{p.name}</b><small>{p.selectedVariant||'Standard'} · Qty {p.qty||1}</small></span><strong>{money((p.price||0)*(p.qty||1))}</strong></div>)}</div>
 <div className="sc-order-total"><span>Order total</span><b>{money(selected.total)}</b></div><div className="sc-order-payment"><b>Payment & delivery instructions</b><span>{selected.payment||'Payment preference not recorded'}</span><span>{selected.deliveryMethod||'Delivery method not recorded'}</span></div>
 <div className="sc-order-progress"><b>Preparation workflow</b><ol>{steps.map((s,i)=><li key={s} className={steps.indexOf(stage(selected))>=i?'done':''}><span>{steps.indexOf(stage(selected))>=i?<CheckCircle2 size={15}/>:<Clock3 size={15}/>}</span>{s}</li>)}</ol></div>
 {notice&&<p className="sc-order-notice" role="status">{notice}</p>}{next(selected)&&!['Delivered','Cancelled','In transit'].includes(selected.status)&&<div className="sc-order-actions"><button type="button" onClick={()=>advance(selected)}>{next(selected)==='Ready for pickup'?<Truck size={16}/>:<PackageCheck size={16}/>} {next(selected)==='Ready for pickup'?'Mark ready for courier pickup':'Mark '+next(selected).toLowerCase()}</button></div>}
 <p className="sc-order-disclaimer">Status changes are stored locally for demonstration. Courier assignment, tracking, customer notifications, COD collection and settlement are not connected.</p>
 </>:<div className="sc-order-empty"><Package size={28}/><b>No assigned orders yet</b><p>Orders for this storefront will appear here once assigned by the backend.</p></div>}</article></div></>}
 </section>
}