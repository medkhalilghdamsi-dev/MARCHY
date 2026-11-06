import { useMemo, useState } from 'react'
import { AlertCircle, Archive, CheckCircle2, ClipboardList, Edit3, PackagePlus, Search, Send, Trash2 } from 'lucide-react'

const STORAGE_KEY = 'marchy-seller-catalog-v1'
const categories = ['Electronics', 'Groceries', 'Home', 'Fashion', 'Beauty', 'Sports', 'Accessories', 'Automotive', 'Books', 'Toys & Games', 'Baby & Kids', 'Pets', 'Garden & DIY']
const emptyForm = { name: '', sku: '', category: 'Electronics', price: '', compareAtPrice: '', stock: '0', description: '', variants: '', image: '' }

function readListings() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    return Array.isArray(value) ? value : []
  } catch { return [] }
}
function writeListings(value) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
}
function makeId() {
  return globalThis.crypto?.randomUUID?.() || 'listing-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8)
}
const statusLabel = status => ({
  draft: 'Draft', submitted: 'Submitted for review', needs_changes: 'Changes requested',
  approved: 'Approved', active: 'Active'
}[status] || 'Draft')

export function SellerCatalogManager() {
  const [listings, setListings] = useState(readListings)
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [feedback, setFeedback] = useState('')
  const [error, setError] = useState('')

  const counts = useMemo(() => ({
    all: listings.length,
    draft: listings.filter(x => x.status === 'draft').length,
    submitted: listings.filter(x => x.status === 'submitted').length,
    active: listings.filter(x => x.status === 'active').length
  }), [listings])

  const visible = useMemo(() => listings.filter(item => {
    const matchesQuery = [item.name, item.sku, item.category].some(v => String(v || '').toLowerCase().includes(query.toLowerCase()))
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'submitted' ? item.status === 'submitted' : item.status === statusFilter)
    return matchesQuery && matchesStatus
  }), [listings, query, statusFilter])

  const update = (key, value) => setForm(current => ({ ...current, [key]: value }))
  const reset = () => { setForm(emptyForm); setEditingId(null); setShowForm(false); setError('') }
  const persist = next => {
    try {
      writeListings(next)
      setListings(next)
      return true
    } catch {
      setError('Could not save to this browser. Check storage availability and try again.')
      return false
    }
  }

  const startEdit = item => {
    setForm({
      name: item.name, sku: item.sku, category: item.category,
      price: String(item.price), compareAtPrice: item.compareAtPrice ? String(item.compareAtPrice) : '',
      stock: String(item.stock), description: item.description || '',
      variants: (item.variants || []).join('\n'), image: item.image || ''
    })
    setEditingId(item.id)
    setShowForm(true)
    setFeedback('')
    setError('')
  }

  const save = (submit = false) => {
    setError('')
    const price = Number(form.price)
    const compareAtPrice = form.compareAtPrice === '' ? null : Number(form.compareAtPrice)
    const stock = Number(form.stock)
    const sku = form.sku.trim().toUpperCase()
    if (!form.name.trim() || !sku || !form.description.trim()) return setError('Product name, seller SKU and description are required.')
    if (!Number.isFinite(price) || price <= 0) return setError('Enter a valid selling price greater than 0 TND.')
    if (compareAtPrice !== null && (!Number.isFinite(compareAtPrice) || compareAtPrice <= price)) return setError('Compare-at price must be higher than the selling price.')
    if (!Number.isInteger(stock) || stock < 0) return setError('Stock must be a whole number of 0 or more.')
    if (form.image.trim() && !/^https?:\/\/\S+$/i.test(form.image.trim())) return setError('Product image must be a valid HTTP or HTTPS URL.')
    const duplicate = listings.find(item => item.sku.toUpperCase() === sku && item.id !== editingId)
    if (duplicate) return setError('This seller SKU is already used by another listing.')
    const existing = listings.find(item => item.id === editingId)
    const variants = form.variants.split('\n').map(v => v.trim()).filter(Boolean).slice(0, 40)
    const nextItem = {
      ...(existing || {}), id: editingId || makeId(), name: form.name.trim(),
      sku, category: form.category, price, compareAtPrice, stock,
      description: form.description.trim(), variants, image: form.image.trim(),
      status: submit ? 'submitted' : 'draft',
      updatedAt: new Date().toISOString(),
      submittedAt: submit ? new Date().toISOString() : null
    }
    const next = existing ? listings.map(item => item.id === editingId ? nextItem : item) : [nextItem, ...listings]
    if (persist(next)) {
      setFeedback(submit
        ? 'Listing placed in the local review queue. No real moderation request was sent.'
        : 'Listing draft saved on this device.')
      reset()
    }
  }

  const remove = item => {
    if (!window.confirm('Delete "' + item.name + '" from this local seller catalogue?')) return
    if (persist(listings.filter(x => x.id !== item.id))) setFeedback('Local listing deleted.')
  }

  const reopen = item => {
    const next = listings.map(x => x.id === item.id ? { ...x, status: 'draft', submittedAt: null, updatedAt: new Date().toISOString() } : x)
    if (persist(next)) setFeedback('Listing returned to draft so you can edit it.')
  }

  return (
    <section className="seller-catalog-manager" aria-label="Seller product catalogue">
      <div className="sc-catalog-head">
        <div><span className="eyebrow">CATALOGUE MANAGEMENT</span><h3>Products & listings</h3><p>Create product records, manage seller SKUs, pricing, variants and stock. A listing is not purchasable until a real moderation and activation workflow exists.</p></div>
        <button type="button" className="sc-catalog-primary" onClick={() => { reset(); setShowForm(true) }}><PackagePlus size={16}/> Add product</button>
      </div>

      <div className="sc-catalog-stats">
        <button type="button" className={statusFilter === 'all' ? 'selected' : ''} onClick={() => setStatusFilter('all')}><span>All listings</span><b>{counts.all}</b></button>
        <button type="button" className={statusFilter === 'draft' ? 'selected' : ''} onClick={() => setStatusFilter('draft')}><span>Drafts</span><b>{counts.draft}</b></button>
        <button type="button" className={statusFilter === 'submitted' ? 'selected' : ''} onClick={() => setStatusFilter('submitted')}><span>Submitted</span><b>{counts.submitted}</b></button>
        <button type="button" className={statusFilter === 'active' ? 'selected' : ''} onClick={() => setStatusFilter('active')}><span>Active</span><b>{counts.active}</b></button>
      </div>

      {showForm && <div className="sc-catalog-form">
        <div className="sc-catalog-form-heading"><div><span className="eyebrow">{editingId ? 'EDIT PRODUCT' : 'NEW PRODUCT'}</span><h4>{editingId ? 'Update listing details' : 'Create a product listing'}</h4></div><button type="button" onClick={reset} aria-label="Close product form">×</button></div>
        <div className="sc-catalog-fields">
          <label>Product title *<input value={form.name} onChange={e => update('name', e.target.value)} maxLength={120} placeholder="Clear customer-facing product name"/></label>
          <label>Seller SKU *<input value={form.sku} onChange={e => update('sku', e.target.value)} maxLength={48} placeholder="e.g. MED-LAMP-001"/><small>Unique within this local seller catalogue.</small></label>
          <label>Category<select value={form.category} onChange={e => update('category', e.target.value)}>{categories.map(c => <option key={c}>{c}</option>)}</select></label>
          <label>Selling price (TND) *<input type="number" min="0.01" step="0.01" value={form.price} onChange={e => update('price', e.target.value)} placeholder="0.00"/></label>
          <label>Compare-at price (TND)<input type="number" min="0.01" step="0.01" value={form.compareAtPrice} onChange={e => update('compareAtPrice', e.target.value)} placeholder="Optional; must exceed selling price"/></label>
          <label>Available stock *<input type="number" min="0" step="1" value={form.stock} onChange={e => update('stock', e.target.value)}/></label>
          <label className="sc-catalog-wide">Product image URL <span>Optional public image URL; upload storage is not connected.</span><input type="url" value={form.image} onChange={e => update('image', e.target.value)} placeholder="https://..."/></label>
          <label className="sc-catalog-wide">Product description *<textarea rows={4} maxLength={2000} value={form.description} onChange={e => update('description', e.target.value)} placeholder="Materials, dimensions, compatibility, included items, warranty and other factual details."/></label>
          <label className="sc-catalog-wide">Variants <span>One option per line, for example: Black / 128 GB / Size 42</span><textarea rows={3} maxLength={1200} value={form.variants} onChange={e => update('variants', e.target.value)} placeholder={'Black / 128 GB\nWhite / 256 GB'}/></label>
        </div>
        {error && <p className="sc-catalog-error" role="alert"><AlertCircle size={15}/>{error}</p>}
        <div className="sc-catalog-form-actions"><button type="button" className="sc-catalog-secondary" onClick={reset}>Cancel</button><button type="button" className="sc-catalog-secondary" onClick={() => save(false)}>Save draft</button><button type="button" className="sc-catalog-primary" onClick={() => save(true)}><Send size={15}/> Submit for review</button></div>
        <p className="sc-catalog-disclaimer">Submission changes the local demo status only. No listing is sent to MARCHY, approved or published.</p>
      </div>}

      <div className="sc-catalog-toolbar"><label><Search size={16}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by product, SKU or category"/></label><span>{visible.length} of {listings.length} listings</span></div>
      {feedback && <p className="sc-catalog-feedback" role="status"><CheckCircle2 size={15}/>{feedback}</p>}

      {visible.length ? <div className="sc-catalog-list">{visible.map(item => <article className="sc-catalog-item" key={item.id}>
        <div className="sc-catalog-product-image">{item.image ? <img src={item.image} alt="" onError={e => { e.currentTarget.style.display = 'none' }}/> : <Archive size={22}/>}</div>
        <div className="sc-catalog-product-main"><b>{item.name}</b><span>{item.category} · SKU {item.sku}</span><small>{item.variants?.length ? item.variants.length + ' variant option(s)' : 'No variants'} · {item.stock} units</small></div>
        <div className="sc-catalog-price"><b>{item.price.toFixed(2)} TND</b>{item.compareAtPrice && <del>{item.compareAtPrice.toFixed(2)} TND</del>}</div>
        <span className={'sc-catalog-status sc-catalog-status-' + item.status}>{statusLabel(item.status)}</span>
        <div className="sc-catalog-item-actions">{(item.status === 'draft' || item.status === 'needs_changes') && <button type="button" onClick={() => startEdit(item)} aria-label={'Edit ' + item.name}><Edit3 size={15}/></button>}{item.status === 'submitted' && <button type="button" onClick={() => reopen(item)} aria-label={'Return ' + item.name + ' to draft'}>Reopen</button>}<button type="button" onClick={() => remove(item)} aria-label={'Delete ' + item.name}><Trash2 size={15}/></button></div>
      </article>)}</div> : <div className="sc-catalog-empty"><ClipboardList size={27}/><b>{listings.length ? 'No listings match these filters' : 'Your catalogue is ready for its first product'}</b><p>{listings.length ? 'Try a different search or status.' : 'Add a product to organise its SKU, price, variants and stock in one place.'}</p>{listings.length === 0 && <button type="button" className="sc-catalog-primary" onClick={() => setShowForm(true)}><PackagePlus size={15}/> Add your first product</button>}</div>}

      <div className="sc-catalog-note"><AlertCircle size={16}/><span><b>Demo catalogue only</b>Records are saved in this browser and are not linked to an authenticated seller, shared inventory, customer storefront or backend moderation queue.</span></div>
    </section>
  )
}
