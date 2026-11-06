import { ArrowRight, BadgeCheck, BarChart3, Building2, ClipboardCheck, LifeBuoy, RotateCcw, ShieldCheck, Store, Truck, Wallet } from 'lucide-react'
import { Link } from 'react-router-dom'

const sections = [
  ['profile', 'Business profile', Building2],
  ['catalog', 'Product catalogue', Store],
  ['inventory', 'Inventory', Truck],
  ['offers', 'Offers & pricing', BadgeCheck],
  ['orders', 'Orders & fulfilment', ClipboardCheck],
  ['returns', 'Returns & refunds', RotateCcw],
  ['finance', 'Finance & settlements', Wallet],
  ['analytics', 'Analytics', BarChart3],
  ['support', 'Support & disputes', LifeBuoy],
  ['operations', 'Operations preferences', Truck],
  ['verification', 'Verification readiness', ShieldCheck]
]

export function SellerCentralNavigation({ activeSection, onSectionChange }) {
  return (
    <aside className="sc-sidebar">
          <div className="sc-sidebar-heading"><span className="eyebrow">SELLER CENTRAL</span><b>Business workspace</b></div>
          {sections.map(([id, label, Icon], index) => (
            <button key={id} type="button" className={activeSection === id ? 'active' : ''} aria-current={activeSection === id ? 'page' : undefined} onClick={() => onSectionChange(id)}>
              <Icon size={17}/> {label} <span>{String(index + 1).padStart(2, '0')}</span>
            </button>
          ))}
          <div className="sc-sidebar-note"><ShieldCheck size={17}/><span><b>Trust comes first</b>Seller access and payouts require approved verification and backend controls.</span></div>
          <Link to="/seller-help" className="sc-help-link">Seller preparation guide <ArrowRight size={15}/></Link>
    </aside>
  )
}
