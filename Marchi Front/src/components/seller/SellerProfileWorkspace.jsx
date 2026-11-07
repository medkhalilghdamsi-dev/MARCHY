import { ShieldCheck, Truck } from 'lucide-react'

export function SellerProfileWorkspace({ section, form, update, governorates, categories, steps }) {
  return (
    <>
          {section === 'profile' && <div className="sc-form-grid">
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

          {section === 'operations' && <div className="sc-operations-content">
            <div className="sc-choice-card"><div><b>Fulfilment preference</b><p>Choose how you expect to prepare and dispatch customer orders.</p></div><label className="sc-radio"><input type="radio" name="fulfilment" checked={form.fulfilment === 'Seller handles delivery'} onChange={() => update('fulfilment', 'Seller handles delivery')}/> I store and dispatch my products</label><label className="sc-radio"><input type="radio" name="fulfilment" checked={form.fulfilment === 'MARCHY fulfilment interest'} onChange={() => update('fulfilment', 'MARCHY fulfilment interest')}/> I am interested in MARCHY fulfilment</label><small>MARCHY fulfilment is a future service and is not currently available.</small></div>
            <div className="sc-choice-card"><div><b>Payment methods you can support</b><p>These are preferences only. Availability depends on approved provider and platform integrations.</p></div><label className="sc-check"><input type="checkbox" checked={form.acceptsCod} onChange={e => update('acceptsCod', e.target.checked)}/> Cash on delivery (COD)</label><label className="sc-check"><input type="checkbox" checked={form.acceptsOnlinePayment} onChange={e => update('acceptsOnlinePayment', e.target.checked)}/> Domestic online payment</label><small>Actual payment methods will be configured by MARCHY after operational and provider checks.</small></div>
            <div className="sc-info-panel"><Truck size={20}/><span><b>Tunisia delivery readiness</b>Before launch, sellers will need to confirm service areas, parcel preparation times, packaging standards, delivery exceptions and return handling.</span></div>
          </div>}

          {section === 'verification' && <div className="sc-verification-content">
            <div className="sc-verification-banner"><ShieldCheck size={23}/><div><b>Verification is not open yet</b><p>This prototype does not collect identity documents, validate registration numbers or approve seller accounts.</p></div></div>
            <div className="sc-verification-list">{steps.map((step, index) => { const Icon = step.icon; return <article key={step.title}><span className="sc-step-icon"><Icon size={18}/></span><div><b>{step.title}</b><p>{step.detail}</p></div><span className="sc-step-state">{index === 0 && form.storeName.trim() && form.legalName.trim() ? 'Prepared' : 'To prepare'}</span></article> })}</div>
            <p className="sc-legal-note">Required documents and eligibility criteria must be approved by MARCHY operations and Tunisian legal advisers before applications open. Do not upload sensitive documents to this demo.</p>
          </div>}
    </>
  )
}
