import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BadgeCheck, BarChart3, Building2, ClipboardCheck, FileText, LifeBuoy, RotateCcw, ShieldCheck, Store, Truck, Wallet } from 'lucide-react'
import { useMarketplace } from '../../providers/MarketplaceContext'
import { SellerProfileWorkspace } from '../../components/seller/SellerProfileWorkspace'
import { readSellerValue, writeSellerValue, removeSellerValue, SELLER_STORAGE_KEYS } from '../../services/seller/sellerStorage'
import { translateTree } from '../../i18n/translate'









const SellerCatalogManager = lazy(() => import('../../components/seller/SellerCatalogManager').then(m => ({ default: m.SellerCatalogManager })))
const SellerInventoryWorkspace = lazy(() => import('../../components/seller/SellerInventoryWorkspace').then(m => ({ default: m.SellerInventoryWorkspace })))
const SellerOffersManager = lazy(() => import('../../components/seller/SellerOffersManager').then(m => ({ default: m.SellerOffersManager })))
const SellerOrdersWorkspace = lazy(() => import('../../components/seller/SellerOrdersWorkspace').then(m => ({ default: m.SellerOrdersWorkspace })))
const SellerReturnsWorkspace = lazy(() => import('../../components/seller/SellerReturnsWorkspace').then(m => ({ default: m.SellerReturnsWorkspace })))
const SellerFinanceWorkspace = lazy(() => import('../../components/seller/SellerFinanceWorkspace').then(m => ({ default: m.SellerFinanceWorkspace })))
const SellerAnalyticsWorkspace = lazy(() => import('../../components/seller/SellerAnalyticsWorkspace').then(m => ({ default: m.SellerAnalyticsWorkspace })))
const SellerSupportWorkspace = lazy(() => import('../../components/seller/SellerSupportWorkspace').then(m => ({ default: m.SellerSupportWorkspace })))

const STORAGE_KEY = SELLER_STORAGE_KEYS.profile
const governorates = [
  'Ariana', 'Béja', 'Ben Arous', 'Bizerte', 'Gabès', 'Gafsa', 'Jendouba',
  'Kairouan', 'Kasserine', 'Kébili', 'Kef', 'Mahdia', 'Manouba', 'Médenine',
  'Monastir', 'Nabeul', 'Sfax', 'Sidi Bouzid', 'Siliana', 'Sousse', 'Tataouine',
  'Tozeur', 'Tunis', 'Zaghouan'
]
const categories = ['Electronics', 'Fashion', 'Home & Living', 'Beauty & Personal Care', 'Sports', 'Food & Grocery', 'Handmade', 'Other']
const initial = {
  storeName: '', legalName: '', businessType: 'Individual business', governorate: 'Tunis',
  city: '', phone: '', email: '', category: 'Electronics', description: '',
  registrationReference: '', website: '', fulfilment: 'Seller handles delivery',
  acceptsCod: true, acceptsOnlinePayment: false
}
const readDraft = () => {
  const value = readSellerValue(STORAGE_KEY, null)
  return value && typeof value === 'object' && !Array.isArray(value) ? { ...initial, ...value } : initial
}

const steps = [
  { title: 'Business profile', detail: 'Store identity, legal name and location', icon: Building2 },
  { title: 'Contact details', detail: 'A reliable phone number and email', icon: FileText },
  { title: 'Products & operations', detail: 'Category, fulfilment and payment preferences', icon: Truck },
  { title: 'Verification', detail: 'Documents and eligibility review by MARCHY', icon: ShieldCheck }
]

export function SellerCentralPage() {
  const { language } = useMarketplace()
  const [form, setForm] = useState(readDraft)
  const [savedAt, setSavedAt] = useState('')
  const [notice, setNotice] = useState('')
  const [activeSection, setActiveSection] = useState('profile')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    document.title = 'Seller Central | MARCHY'
  }, [])

  const completion = useMemo(() => {
    const checks = [
      Boolean(form.storeName.trim()), Boolean(form.legalName.trim()),
      Boolean(form.city.trim()), Boolean(form.phone.trim()),
      Boolean(form.email.trim()), Boolean(form.description.trim()),
      Boolean(form.category), Boolean(form.fulfilment)
    ]
    return Math.round(checks.filter(Boolean).length / checks.length * 100)
  }, [form])

  const update = (key, value) => setForm(current => ({ ...current, [key]: value }))

  const saveDraft = () => {
    setIsSaving(true)
    try {
      if (!writeSellerValue(STORAGE_KEY, { ...form, savedAt: new Date().toISOString() })) throw new Error('Storage unavailable')
      setSavedAt(new Date().toLocaleString())
      setNotice('Your preparation draft is saved on this device. It has not been submitted to MARCHY.')
    } catch {
      setNotice('This browser could not save the draft. Check available storage and try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const clearDraft = () => {
    if (!window.confirm('Clear the seller preparation draft saved on this device?')) return
    if (!removeSellerValue(STORAGE_KEY)) return setNotice('This browser could not clear the seller draft.')
    setForm(initial)
    setSavedAt('')
    setNotice('Local preparation draft cleared.')
  }

  const readyForReview = Boolean(
    form.storeName.trim() && form.legalName.trim() && form.city.trim() &&
    form.phone.trim() && form.email.trim() && form.description.trim()
  )

  return translateTree(
    <main id="main-content" className="shell page seller-central-page">
      <div className="breadcrumbs" role="navigation" aria-label="Breadcrumb">
        <Link to="/sell">Seller home</Link> / <span>Seller Central</span>
      </div>

      <section className="sc-hero">
        <div className="sc-hero-copy">
          <span className="eyebrow">MARCHY SELLER CENTRAL · TUNISIA</span>
          <h1>One workspace for your business on MARCHY.</h1>
          <p>Prepare your seller profile, organise your operations and understand the steps required before your shop can start receiving orders.</p>
          <div className="sc-hero-meta">
            <span><ShieldCheck size={15}/> Verification-first onboarding</span>
            <span><span className="sc-dot"/> Tunisia launch preparation</span>
          </div>
        </div>
        <div className="sc-hero-card">
          <div className="sc-hero-card-icon"><Store size={23}/></div>
          <span className="eyebrow">SELLER SETUP</span>
          <strong>{completion}%</strong>
          <div className="sc-progress"><span style={{ width: completion + '%' }}/></div>
          <small>Profile preparation progress</small>
          <span className="sc-local-label">LOCAL DRAFT · NOT SUBMITTED</span>
        </div>
      </section>

      <div className="sc-layout">
        <aside className="sc-sidebar">
          <div className="sc-sidebar-heading"><span className="eyebrow">SELLER CENTRAL</span><b>Business workspace</b></div>
          <button type="button" className={activeSection === 'profile' ? 'active' : ''} onClick={() => setActiveSection('profile')}><Building2 size={17}/> Business profile <span>01</span></button>
          <button type="button" className={activeSection === 'catalog' ? 'active' : ''} onClick={() => setActiveSection('catalog')}><Store size={17}/> Product catalogue <span>02</span></button>
          <button type="button" className={activeSection === 'inventory' ? 'active' : ''} onClick={() => setActiveSection('inventory')}><Truck size={17}/> Inventory <span>03</span></button>
          <button type="button" className={activeSection === 'offers' ? 'active' : ''} onClick={() => setActiveSection('offers')}><BadgeCheck size={17}/> Offers & pricing <span>04</span></button>
          <button type="button" className={activeSection === 'orders' ? 'active' : ''} onClick={() => setActiveSection('orders')}><ClipboardCheck size={17}/> Orders & fulfilment <span>05</span></button>
          <button type="button" className={activeSection === 'returns' ? 'active' : ''} onClick={() => setActiveSection('returns')}><RotateCcw size={17}/> Returns & refunds <span>06</span></button>
          <button type="button" className={activeSection === 'finance' ? 'active' : ''} onClick={() => setActiveSection('finance')}><Wallet size={17}/> Finance & settlements <span>07</span></button>
          <button type="button" className={activeSection === 'analytics' ? 'active' : ''} onClick={() => setActiveSection('analytics')}><BarChart3 size={17}/> Analytics <span>08</span></button>
          <button type="button" className={activeSection === 'support' ? 'active' : ''} onClick={() => setActiveSection('support')}><LifeBuoy size={17}/> Support & disputes <span>09</span></button>
          <button type="button" className={activeSection === 'operations' ? 'active' : ''} onClick={() => setActiveSection('operations')}><Truck size={17}/> Operations preferences <span>10</span></button>
          <button type="button" className={activeSection === 'verification' ? 'active' : ''} onClick={() => setActiveSection('verification')}><ShieldCheck size={17}/> Verification readiness <span>11</span></button>
          <div className="sc-sidebar-note"><ShieldCheck size={17}/><span><b>Trust comes first</b>Seller access and payouts require approved verification and backend controls.</span></div>
          <Link to="/seller-help" className="sc-help-link">Seller preparation guide <ArrowRight size={15}/></Link>
        </aside>

        <section className="sc-main">
          <div className="sc-main-heading">
            <div><span className="eyebrow">{activeSection === 'catalog' ? 'SELLER PRODUCT CATALOGUE' : 'YOUR BUSINESS PROFILE'}</span><h2>{activeSection === 'profile' ? 'Tell us about your business' : activeSection === 'catalog' ? 'Manage your product catalogue' : activeSection === 'inventory' ? 'Control seller stock and variants' : activeSection === 'offers' ? 'Configure seller-specific offers and pricing' : activeSection === 'orders' ? 'Manage incoming orders and parcel preparation' : activeSection === 'returns' ? 'Review return requests and inspection outcomes' : activeSection === 'finance' ? 'Review seller proceeds, COD reconciliation and settlement records' : activeSection === 'analytics' ? 'Understand order activity, product demand and business performance' : activeSection === 'support' ? 'Track seller support requests, return disputes and case history' : activeSection === 'operations' ? 'How will you fulfil orders?' : 'Verification readiness'}</h2><p>{activeSection === 'profile' ? 'These details help establish the identity and location of your future storefront.' : activeSection === 'catalog' ? 'Create listings with seller SKUs, prices, variants and stock. Customer publishing remains locked until real seller approval.' : activeSection === 'inventory' ? 'Review SKU-level quantities, record stock movements and configure low-stock thresholds.' : activeSection === 'offers' ? 'Set prices, promotions, delivery and payment preferences for each listing.' : activeSection === 'orders' ? 'Review orders assigned to your storefront, prepare parcels and record courier handoff readiness.' : activeSection === 'returns' ? 'Handle buyer return requests, record receipt and inspection, and refer refunds for platform review.' : activeSection === 'finance' ? 'Review illustrative transaction activity and understand the future finance workflow. No real money movement is connected.' : activeSection === 'analytics' ? 'Explore order trends, delivered sales, top products and customer locations using local demo records.' : activeSection === 'support' ? 'Create local cases, record notes, track statuses and organise return or operational disputes.' : activeSection === 'operations' ? 'Set realistic expectations for delivery and payment handling in Tunisia.' : 'Prepare accurate business information. Document collection and verification are not yet enabled in this prototype.'}</p></div>
            <span className="sc-status"><i/> Local preview</span>
          </div>

          <Suspense fallback={<div className="sc-module-loading" role="status">Loading seller workspace…</div>}>
            {activeSection === 'catalog' && <SellerCatalogManager />}
            {activeSection === 'inventory' && <SellerInventoryWorkspace />}
            {activeSection === 'offers' && <SellerOffersManager />}
            {activeSection === 'orders' && <SellerOrdersWorkspace />}
            {activeSection === 'returns' && <SellerReturnsWorkspace />}
            {activeSection === 'finance' && <SellerFinanceWorkspace />}
            {activeSection === 'analytics' && <SellerAnalyticsWorkspace />}
            {activeSection === 'support' && <SellerSupportWorkspace />}
          </Suspense>
          <SellerProfileWorkspace section={activeSection} form={form} update={update} governorates={governorates} categories={categories} steps={steps} />

          <div className="sc-form-footer">
            <div><b>{readyForReview ? 'Core business details prepared' : 'Complete the required business details'}</b><small>Draft is stored only in this browser. Saving does not submit an application.</small></div>
            <div className="sc-actions"><button type="button" className="sc-clear" onClick={clearDraft}>Clear draft</button><button type="button" className="sc-save" onClick={saveDraft} disabled={isSaving}>{isSaving ? 'Saving…' : 'Save preparation draft'} <ArrowRight size={16}/></button></div>
          </div>
          {notice && <p className="sc-notice" role="status">{notice}</p>}
          {savedAt && <p className="sc-saved-at">Last saved in this browser: {savedAt}</p>}
        </section>
      </div>

      <section className="sc-next-steps">
        <div><ClipboardCheck size={22}/><span><b>What happens after preparation?</b><small>When seller applications open, the real process will include account access, business verification, agreement acceptance, catalog approval and seller training.</small></span></div>
        <Link to="/sell">Explore the storefront planner <ArrowRight size={15}/></Link>
      </section>
      <p className="catalogue-note">Seller Central preparation prototype. No account is created, no application is submitted, and no verification, payment or fulfilment service is activated.</p>
    </main>,
    language
  )
}
