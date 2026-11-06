import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BadgeCheck, Building2, ClipboardCheck, FileText, RotateCcw, ShieldCheck, Store, Truck, Wallet } from 'lucide-react'
import { useMarketplace } from '../../providers/MarketplaceContext'
import { translateTree } from '../../i18n/translate'
import { SellerCatalogManager } from '../../components/seller/SellerCatalogManager'
import { SellerInventoryWorkspace } from '../../components/seller/SellerInventoryWorkspace'
import { SellerOffersManager } from '../../components/seller/SellerOffersManager'
import { SellerOrdersWorkspace } from '../../components/seller/SellerOrdersWorkspace'
import { SellerReturnsWorkspace } from '../../components/seller/SellerReturnsWorkspace'\nimport { SellerFinanceWorkspace } from '../../components/seller/SellerFinanceWorkspace'

const STORAGE_KEY = 'marchy-seller-onboarding-draft-v1'
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
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
    return value && typeof value === 'object' ? { ...initial, ...value } : initial
  } catch { return initial }
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
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...form, savedAt: new Date().toISOString() }))
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
    localStorage.removeItem(STORAGE_KEY)
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
        <Link to="/">Home</Link> / <span>Seller Central</span>
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
          <div className="sc-sidebar-heading"><span className="eyebrow">SELLER CENTRAL</span><b>Setup workspace</b></div>
          <button type="button" className={activeSection === 'profile' ? 'active' : ''} onClick={() => setActiveSection('profile')}><Building2 size={17}/> Business profile <span>01</span></button>
          <button type="button" className={activeSection === 'catalog' ? 'active' : ''} onClick={() => setActiveSection('catalog')}><Store size={17}/> Products <span>02</span></button>
          <button type="button" className={activeSection === 'inventory' ? 'active' : ''} onClick={() => setActiveSection('inventory')}><Truck size={17}/> Inventory <span>03</span></button>
          <button type="button" className={activeSection === 'returns' ? 'active' : ''} onClick={() => setActiveSection('returns')}><RotateCcw size={17}/> Returns & refunds <span>06</span></button>\n          <button type="button" className={activeSection === 'finance' ? 'active' : ''} onClick={() => setActiveSection('finance')}><Wallet size={17}/> Finance & settlements <span>07</span></button>
          <button type="button" className={activeSection === 'orders' ? 'active' : ''} onClick={() => setActiveSection('orders')}><ClipboardCheck size={17}/> Orders & fulfilment <span>05</span></button>
          <button type="button" className={activeSection === 'offers' ? 'active' : ''} onClick={() => setActiveSection('offers')}><BadgeCheck size={17}/> Offers & pricing <span>04</span></button>
          <button type="button" className={activeSection === 'operations' ? 'active' : ''} onClick={() => setActiveSection('operations')}><Truck size={17}/> Operations <span>04</span></button>
          <button type="button" className={activeSection === 'verification' ? 'active' : ''} onClick={() => setActiveSection('verification')}><BadgeCheck size={17}/> Verification <span>05</span></button>
          <div className="sc-sidebar-note"><ShieldCheck size={17}/><span><b>Trust comes first</b>Seller access and payouts require approved verification and backend controls.</span></div>
          <Link to="/seller-help" className="sc-help-link">Seller preparation guide <ArrowRight size={15}/></Link>
        </aside>

        <section className="sc-main">
          <div className="sc-main-heading">
            <div><span className="eyebrow">{activeSection === 'catalog' ? 'SELLER PRODUCT CATALOGUE' : 'YOUR BUSINESS PROFILE'}</span><h2>{activeSection === 'profile' ? 'Tell us about your business' : activeSection === 'catalog' ? 'Manage your product catalogue' : activeSection === 'inventory' ? 'Control seller stock and variants' : activeSection === 'offers' ? 'Configure seller-specific offers and pricing' : activeSection === 'orders' ? 'Manage incoming orders and parcel preparation' : activeSection === 'returns' ? 'Review return requests and inspection outcomes' : activeSection === 'finance' ? 'Review seller proceeds, COD reconciliation and settlement records' : activeSection === 'operations' ? 'How will you fulfil orders?' : 'Verification readiness'}</h2><p>{activeSection === 'profile' ? 'These details help establish the identity and location of your future storefront.' : activeSection === 'catalog' ? 'Create listings with seller SKUs, prices, variants and stock. Customer publishing remains locked until real seller approval.' : activeSection === 'inventory' ? 'Review SKU-level quantities, record stock movements and configure low-stock thresholds.' : activeSection === 'offers' ? 'Set prices, promotions, delivery and payment preferences for each listing.' : activeSection === 'orders' ? 'Review orders assigned to your storefront, prepare parcels and record courier handoff readiness.' : activeSection === 'returns' ? 'Handle buyer return requests, record receipt and inspection, and refer refunds for platform review.' : activeSection === 'finance' ? 'Review illustrative transaction activity and understand the future finance workflow. No real money movement is connected.' : activeSection === 'operations' ? 'Set realistic expectations for delivery and payment handling in Tunisia.' : 'Prepare accurate business information. Document collection and verification are not yet enabled in this prototype.'}</p></div>
            <span className="sc-status"><i/> Preparation draft</span>
          </div>

          {activeSection === 'catalog' && <SellerCatalogManager />}
          {activeSection === 'inventory' && <SellerInventoryWorkspace />}
          {activeSection === 'offers' && <SellerOffersManager />}
          {activeSection === 'orders' && <SellerOrdersWorkspace />}
          {activeSection === 'returns' && <SellerReturnsWorkspace />}\n          {activeSection === 'finance' && <SellerFinanceWorkspace />}
          {activeSection === 'profile' && <div className="sc-form-grid">
            <label>Storefront name <span>Customer-facing shop name</span><input value={form.storeName} onChange={e => update('storeName', e.target.value)} placeholder="e.g. Maison Medina" maxLength={80}/></label>
            <label>Legal / registered name <span>Name used for business documentation</span><input value={form.legalName} onChange={e => update('legalName', e.target.value)} placeholder="Business or owner legal name" maxLength={120}/></label>
            <label>Business type <span>Choose the closest description</span><select value={form.businessType} onChange={e => update('businessType', e.target.value)}><option>Individual business</option><option>Registered company</option><option>Self-employed / artisan</option><option>Other — to be reviewed</option></select></label>
            <label>Governorate <span>Primary business location</span><select value={form.governorate} onChange={e => update('governorate', e.target.value)}>{governorates.map(g => <option key={g}>{g}</option>)}</select></label>
            <label>City / locality <span>Town or locality within the governorate</span><input value={form.city} onChange={e => update('city', e.target.value)} placeholder="e.g. Le Bardo" maxLength={80}/></label>
            <label>Primary product category <span>Choose your main business category</span><select value={form.category} onChange={e => update('category', e.target.value)}>{categories.map(c => <option key={c}>{c}</option>)}</select></label>
            <label>Business phone <span>Use a number you can answer</span><input type="tel" inputMode="tel" value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="+216 XX XXX XXX" maxLength={30}/></label>
            <label>Business email <span>Used for seller communications</span><input type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="you@business.tn" maxLength={120}/></label>
            <label className="sc-full">Business description <span>Describe what you sell and what makes your business reliable</span><textarea rows={4} maxLength={700} value={form.description} onChange={e => update('description', e.target.value)} placeholder="A clear, factual description of your business and products."/><small className="sc-char-count">{form.description.length}/700</small></label>
            <label className="sc-full">Website or social storefront <span>Optional public business reference</span><input type="url" value={form.website} onChange={e => update('website', e.target.value)} placeholder="https://..."/></label>
          </div>}

          {activeSection === 'operations' && <div className="sc-operations-content">
            <div className="sc-choice-card"><div><b>Fulfilment preference</b><p>Choose how you expect to prepare and dispatch customer orders.</p></div><label className="sc-radio"><input type="radio" name="fulfilment" checked={form.fulfilment === 'Seller handles delivery'} onChange={() => update('fulfilment', 'Seller handles delivery')}/> I store and dispatch my products</label><label className="sc-radio"><input type="radio" name="fulfilment" checked={form.fulfilment === 'MARCHY fulfilment interest'} onChange={() => update('fulfilment', 'MARCHY fulfilment interest')}/> I am interested in MARCHY fulfilment</label><small>MARCHY fulfilment is a future service and is not currently available.</small></div>
            <div className="sc-choice-card"><div><b>Payment methods you can support</b><p>These are preferences only. Availability depends on approved provider and platform integrations.</p></div><label className="sc-check"><input type="checkbox" checked={form.acceptsCod} onChange={e => update('acceptsCod', e.target.checked)}/> Cash on delivery (COD)</label><label className="sc-check"><input type="checkbox" checked={form.acceptsOnlinePayment} onChange={e => update('acceptsOnlinePayment', e.target.checked)}/> Domestic online payment</label><small>Actual payment methods will be configured by MARCHY after operational and provider checks.</small></div>
            <div className="sc-info-panel"><Truck size={20}/><span><b>Tunisia delivery readiness</b>Before launch, sellers will need to confirm service areas, parcel preparation times, packaging standards, delivery exceptions and return handling.</span></div>
          </div>}

          {activeSection === 'verification' && <div className="sc-verification-content">
            <div className="sc-verification-banner"><ShieldCheck size={23}/><div><b>Verification is not open yet</b><p>This prototype does not collect identity documents, validate registration numbers or approve seller accounts.</p></div></div>
            <div className="sc-verification-list">{steps.map((step, index) => { const Icon = step.icon; return <article key={step.title}><span className="sc-step-icon"><Icon size={18}/></span><div><b>{step.title}</b><p>{step.detail}</p></div><span className="sc-step-state">{index === 0 && form.storeName.trim() && form.legalName.trim() ? 'Prepared' : 'To prepare'}</span></article> })}</div>
            <p className="sc-legal-note">Required documents and eligibility criteria must be approved by MARCHY operations and Tunisian legal advisers before applications open. Do not upload sensitive documents to this demo.</p>
          </div>}

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
