import { ArrowRight, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { SELLER_CENTRAL_SECTIONS } from '../../app/sellerCentralSections'

export function SellerCentralNavigation({ activeSection, onSectionChange }) {
  return (
    <aside className="sc-sidebar">
      <div className="sc-sidebar-heading"><span className="eyebrow">SELLER CENTRAL</span><b>Business workspace</b></div>
      {SELLER_CENTRAL_SECTIONS.map(({ id, label, icon: Icon }, index) => (
        <button key={id} type="button" className={activeSection === id ? 'active' : ''} aria-current={activeSection === id ? 'page' : undefined} aria-pressed={activeSection === id} onClick={() => onSectionChange(id)}>
          <Icon size={17}/> {label} <span>{String(index + 1).padStart(2, '0')}</span>
        </button>
      ))}
      <div className="sc-sidebar-note"><ShieldCheck size={17}/><span><b>Trust comes first</b>Seller access and payouts require approved verification and backend controls.</span></div>
      <Link to="/seller-help" className="sc-help-link">Seller preparation guide <ArrowRight size={15}/></Link>
    </aside>
  )
}
