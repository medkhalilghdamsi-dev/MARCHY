import { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowRight, Building2, ClipboardCheck, FileText, ShieldCheck, Store, Truck } from 'lucide-react'
import { useMarketplace } from '../../providers/MarketplaceContext'
import { SellerCentralWorkspace } from '../../components/seller/SellerCentralWorkspace'
import { SellerCentralNavigation } from '../../components/seller/SellerCentralNavigation'
import { SELLER_CENTRAL_SECTIONS, SELLER_CENTRAL_SECTION_IDS } from '../../app/sellerCentralSections'
import { useSellerOnboardingDraft } from '../../hooks/useSellerOnboardingDraft'
import { translateTree } from '../../i18n/translate'


const governorates = [
  'Ariana', 'Béja', 'Ben Arous', 'Bizerte', 'Gabès', 'Gafsa', 'Jendouba',
  'Kairouan', 'Kasserine', 'Kébili', 'Kef', 'Mahdia', 'Manouba', 'Médenine',
  'Monastir', 'Nabeul', 'Sfax', 'Sidi Bouzid', 'Siliana', 'Sousse', 'Tataouine',
  'Tozeur', 'Tunis', 'Zaghouan'
]
const categories = ['Electronics', 'Fashion', 'Home & Living', 'Beauty & Personal Care', 'Sports', 'Food & Grocery', 'Handmade', 'Other']

const steps = [
  { title: 'Business profile', detail: 'Store identity, legal name and location', icon: Building2 },
  { title: 'Contact details', detail: 'A reliable phone number and email', icon: FileText },
  { title: 'Products & operations', detail: 'Category, fulfilment and payment preferences', icon: Truck },
  { title: 'Verification', detail: 'Documents and eligibility review by MARCHY', icon: ShieldCheck }
]

export function SellerCentralPage() {
  const { language } = useMarketplace()
  const { form, savedAt, notice, isSaving, completion, readyForReview, update, saveDraft, clearDraft } = useSellerOnboardingDraft()
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedSection = searchParams.get('section')
  const activeSection = SELLER_CENTRAL_SECTION_IDS.has(requestedSection) ? requestedSection : 'profile'
  const setActiveSection = section => setSearchParams(section === 'profile' ? {} : { section })
  const activeSectionMeta = SELLER_CENTRAL_SECTIONS.find(section => section.id === activeSection) || SELLER_CENTRAL_SECTIONS[0]

  useEffect(() => {
    document.title = 'Seller Central | MARCHY'
  }, [])

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
        <SellerCentralNavigation activeSection={activeSection} onSectionChange={setActiveSection} />

        <section className="sc-main">
          <div className="sc-main-heading">
            <div><span className="eyebrow">{activeSectionMeta.eyebrow}</span><h2>{activeSectionMeta.title}</h2><p>{activeSectionMeta.description}</p></div>
            <span className="sc-status"><i/> Local preview</span>
          </div>

          <SellerCentralWorkspace section={activeSection} form={form} update={update} governorates={governorates} categories={categories} steps={steps} />

          {['profile', 'operations', 'verification'].includes(activeSection) && (
            <>
              <div className="sc-form-footer">
                <div><b>{readyForReview ? 'Core business details prepared' : 'Complete the required business details'}</b><small>Draft is stored only in this browser. Saving does not submit an application.</small></div>
                <div className="sc-actions"><button type="button" className="sc-clear" onClick={clearDraft}>Clear draft</button><button type="button" className="sc-save" onClick={saveDraft} disabled={isSaving}>{isSaving ? 'Saving…' : 'Save preparation draft'} <ArrowRight size={16}/></button></div>
              </div>
              {notice && <p className="sc-notice" role="status">{notice}</p>}
              {savedAt && <p className="sc-saved-at">Last saved in this browser: {savedAt}</p>}
            </>
          )}
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
