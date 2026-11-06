import { useMemo, useState } from 'react'
import { AlertTriangle, ArrowDownRight, ArrowUpRight, Boxes, History, Package, Search, SlidersHorizontal } from 'lucide-react'
const LISTINGS_KEY = 'marchy-seller-catalog-v1'
const MOVEMENTS_KEY = 'marchy-seller-inventory-movements-v1'
const read = key => { try { const value = JSON.parse(localStorage.getItem(key) || '[]'); return Array.isArray(value) ? value : [] } catch { return [] } }
const write = (key, value) => localStorage.setItem(key, JSON.stringify(value))
const makeId = () => globalThis.crypto?.randomUUID?.() || 'movement-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7)
function normalise(item) {
  if (item.inventory?.variants?.length) return item
  const names = item.variants?.length ? item.variants : ['Default']
  const total = Math.max(0, Number(item.stock) || 0)
  const base = Math.floor(total / names.length)
  let remainder = total - base * names.length
  return { ...item, inventory: { lowStockThreshold: 5, variants: names.map((name, index) => ({
    id: item.id + '-variant-' + index, name, sku: names.length === 1 ? item.sku : item.sku + '-' + (index + 1),
    available: base + (remainder-- > 0 ? 1 : 0)
  })) } }
}
export function SellerInventoryWorkspace() {
  const [listings, setListings] = useState(() => read(LISTINGS_KEY).map(normalise))
  const [movements, setMovements] = useState(() => read(MOVEMENTS_KEY))
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState('')
  const [variantId, setVariantId] = useState('')
  const [direction, setDirection] = useState('in')
  const [quantity, setQuantity] = useState('1')
  const [reason, setReason] = useState('Restock')
  const [thresholdDraft, setThresholdDraft] = useState({})
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const stockRows = useMemo(() => listings.flatMap(item => item.inventory.variants.map(variant => ({
    ...variant, listingId: item.id, product: item.name, category: item.category, image: item.image, threshold: item.inventory.lowStockThreshold
  }))), [listings])
  const totals = useMemo(() => ({
    products: listings.length, units: stockRows.reduce((sum, row) => sum + row.available, 0),
    low: stockRows.filter(row => row.available > 0 && row.available <= row.threshold).length,
    out: stockRows.filter(row => row.available === 0).length
  }), [listings, stockRows])
  const visible = stockRows.filter(row => {
    const match = [row.product, row.sku, row.name, row.category].some(value => String(value || '').toLowerCase().includes(query.toLowerCase()))
    const status = filter === 'all' || (filter === 'low' ? row.available > 0 && row.available <= row.threshold : filter === 'out' ? row.available === 0 : row.available > row.threshold)
    return match && status
  })
  const selectedListing = listings.find(item => item.id === selected)
  const selectedVariant = selectedListing?.inventory.variants.find(item => item.id === variantId)
  const persist = (nextListings, nextMovements = movements) => {
    try { write(LISTINGS_KEY, nextListings); write(MOVEMENTS_KEY, nextMovements); setListings(nextListings); setMovements(nextMovements); setError(''); return true }
    catch { setError('Could not save inventory changes in this browser. No stock change was confirmed.'); return false }
  }
  const adjust = () => {
    const amount = Number(quantity)
    if (!selectedListing || !selectedVariant) return setError('Choose a product and variant first.')
    if (!Number.isInteger(amount) || amount < 1 || amount > 100000) return setError('Enter a whole-number adjustment between 1 and 100,000.')
    if (!reason.trim()) return setError('Choose an adjustment reason.')
    const nextAvailable = selectedVariant.available + (direction === 'in' ? amount : -amount)
    if (nextAvailable < 0) return setError('This adjustment would make available stock negative.')
    const nextListings = listings.map(item => item.id !== selected ? item : {
      ...item,
      stock: item.inventory.variants.reduce((sum, variant) => sum + (variant.id === variantId ? nextAvailable : variant.available), 0),
      inventory: { ...item.inventory, variants: item.inventory.variants.map(variant => variant.id === variantId ? { ...variant, available: nextAvailable } : variant) }
    })
    const movement = { id: makeId(), listingId: selected, product: selectedListing.name, variant: selectedVariant.name, sku: selectedVariant.sku, direction, quantity: amount, reason: reason.trim(), before: selectedVariant.available, after: nextAvailable, createdAt: new Date().toISOString() }
    if (persist(nextListings, [movement, ...movements].slice(0, 250))) {
      setNotice(`${amount} unit(s) ${direction === 'in' ? 'added to' : 'removed from'} ${selectedListing.name}. Local demo inventory updated.`)
      setQuantity('1')
    }
  }
  const saveThreshold = listing => {
    const threshold = Number(thresholdDraft[listing.id] ?? listing.inventory.lowStockThreshold)
    if (!Number.isInteger(threshold) || threshold < 0 || threshold > 100000) return setError('Low-stock threshold must be a whole number from 0 to 100,000.')
    const next = listings.map(item => item.id === listing.id ? { ...item, inventory: { ...item.inventory, lowStockThreshold: threshold } } : item)
    if (persist(next)) setNotice(`Low-stock alert threshold saved for ${listing.name} on this device.`)
  }
  return (
    <section className="sc-inventory-workspace" aria-label="Seller inventory workspace">
      <div className="sc-inventory-intro"><div><span className="eyebrow">STOCK CONTROL</span><h3>Inventory & stock movements</h3><p>Track available quantities by seller SKU and variant, adjust stock with a reason, and review a local movement history.</p></div><span className="sc-inventory-demo">LOCAL DEMO INVENTORY</span></div>
      <div className="sc-inventory-metrics">
        <article><Package size={17}/><span>Products tracked</span><b>{totals.products}</b></article><article><Boxes size={17}/><span>Available units</span><b>{totals.units.toLocaleString()}</b></article><article><AlertTriangle size={17}/><span>Low-stock variants</span><b>{totals.low}</b></article><article><AlertTriangle size={17}/><span>Out of stock</span><b>{totals.out}</b></article>
      </div>
      <div className="sc-inventory-controls"><label><Search size={16}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search product, variant or SKU"/></label><div><SlidersHorizontal size={15}/>{[['all','All stock'],['low','Low stock'],['out','Out of stock'],['healthy','Healthy']].map(([key,label]) => <button key={key} type="button" className={filter === key ? 'active' : ''} onClick={() => setFilter(key)}>{label}</button>)}</div></div>
      {error && <p className="sc-inventory-error" role="alert">{error}</p>}{notice && <p className="sc-inventory-notice" role="status">{notice}</p>}
      <div className="sc-inventory-grid">
        <div className="sc-inventory-table-wrap"><table className="sc-inventory-table"><thead><tr><th>Product / variant</th><th>Seller SKU</th><th>Available</th><th>Stock health</th></tr></thead><tbody>
          {visible.map(row => <tr key={row.id}><td><div className="sc-inventory-product">{row.image ? <img src={row.image} alt="" onError={e => { e.currentTarget.style.display = 'none' }}/> : <span><Package size={18}/></span>}<div><b>{row.product}</b><small>{row.name === 'Default' ? 'Standard offer' : row.name}</small></div></div></td><td><code>{row.sku}</code></td><td><b>{row.available}</b> <small>units</small></td><td><span className={'sc-inventory-health ' + (row.available === 0 ? 'out' : row.available <= row.threshold ? 'low' : 'good')}>{row.available === 0 ? 'Out of stock' : row.available <= row.threshold ? 'Low stock' : 'Healthy'}</span></td></tr>)}
          {!visible.length && <tr><td colSpan="4" className="sc-inventory-empty">{listings.length ? 'No stock records match your filters.' : 'Create a product listing first. Its seller SKU and variants will appear here.'}</td></tr>}
        </tbody></table></div>
        <aside className="sc-inventory-adjust"><span className="eyebrow">MANUAL STOCK MOVEMENT</span><h4>Adjust inventory</h4><p>Every adjustment records the before/after quantity, reason and timestamp.</p>
          <label>Product<select value={selected} onChange={e => { setSelected(e.target.value); setVariantId('') }}><option value="">Select a product</option>{listings.map(item => <option key={item.id} value={item.id}>{item.name} · {item.sku}</option>)}</select></label>
          <label>Variant / SKU<select value={variantId} onChange={e => setVariantId(e.target.value)} disabled={!selectedListing}><option value="">Select a variant</option>{selectedListing?.inventory.variants.map(variant => <option key={variant.id} value={variant.id}>{variant.name} · {variant.sku} ({variant.available})</option>)}</select></label>
          {selectedVariant && <div className="sc-inventory-current">Current available <b>{selectedVariant.available} units</b></div>}
          <div className="sc-inventory-direction"><button type="button" className={direction === 'in' ? 'active' : ''} onClick={() => setDirection('in')}><ArrowDownRight size={15}/> Stock in</button><button type="button" className={direction === 'out' ? 'active' : ''} onClick={() => setDirection('out')}><ArrowUpRight size={15}/> Stock out</button></div>
          <label>Quantity<input type="number" min="1" step="1" value={quantity} onChange={e => setQuantity(e.target.value)}/></label>
          <label>Reason<select value={reason} onChange={e => setReason(e.target.value)}><option>Restock</option><option>Damaged goods</option><option>Lost / missing</option><option>Cycle count correction</option><option>Supplier return</option><option>Other operational adjustment</option></select></label>
          <button type="button" className="sc-inventory-submit" onClick={adjust} disabled={!selectedVariant}>Save stock movement</button><small>Demo only: changes are local and are not reserved against customer orders or synchronised to a live storefront.</small>
        </aside>
      </div>
      <div className="sc-inventory-thresholds"><div><span className="eyebrow">LOW-STOCK ALERT RULES</span><h4>Set thresholds per product</h4></div>{listings.map(item => <div className="sc-inventory-threshold-row" key={item.id}><span><b>{item.name}</b><small>{item.sku}</small></span><label><input type="number" min="0" max="100000" step="1" value={thresholdDraft[item.id] ?? item.inventory.lowStockThreshold} onChange={e => setThresholdDraft(curr => ({ ...curr, [item.id]: e.target.value }))}/> units</label><button type="button" onClick={() => saveThreshold(item)}>Save</button></div>)}{!listings.length && <p className="sc-inventory-empty">No products to configure yet.</p>}</div>
      <div className="sc-inventory-history"><div><History size={17}/><h4>Recent stock movements</h4><span>{movements.length} recorded</span></div>{movements.length ? <div className="sc-inventory-movement-list">{movements.slice(0,12).map(movement => <article key={movement.id}><span className={movement.direction === 'in' ? 'in' : 'out'}>{movement.direction === 'in' ? <ArrowDownRight size={16}/> : <ArrowUpRight size={16}/>}</span><div><b>{movement.product} · {movement.variant}</b><small>{movement.sku} · {movement.reason} · {new Date(movement.createdAt).toLocaleString()}</small></div><strong className={movement.direction === 'in' ? 'in' : 'out'}>{movement.direction === 'in' ? '+' : '−'}{movement.quantity}</strong></article>)}</div> : <p className="sc-inventory-empty">No stock movements yet. Your first saved adjustment will appear here.</p>}</div>
      <p className="sc-inventory-disclaimer">Inventory is stored locally in this prototype. Production inventory requires organization-level access, atomic reservations, immutable server-side movements and audited adjustments.</p>
    </section>
  )
}
