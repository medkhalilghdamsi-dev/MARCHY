import { useState } from 'react'
import { Link } from 'react-router-dom'
import { money } from '../../utils/marketplace'
import { Check, Plus, ShoppingBag } from 'lucide-react'
import { useToast } from '../../providers/ToastProvider'

export function FrequentlyBoughtTogether({ currentProduct, bundleProducts, onAddBundle }) {
  const toast = useToast()
  const [selectedIds, setSelectedIds] = useState(() => [
    currentProduct.id,
    ...(bundleProducts?.slice(0, 2).map(p => p.id) || [])
  ])

  if (!bundleProducts || bundleProducts.length === 0) return null

  const items = [currentProduct, ...bundleProducts.slice(0, 2)]
  const activeItems = items.filter(item => selectedIds.includes(item.id))
  const bundleSubtotal = activeItems.reduce((sum, item) => sum + item.price, 0)
  const bundleDiscount = activeItems.length >= 3 ? Math.round(bundleSubtotal * 0.08) : 0
  const finalPrice = bundleSubtotal - bundleDiscount

  const toggleItem = (id) => {
    if (id === currentProduct.id) return // Main product is always included
    setSelectedIds(current =>
      current.includes(id) ? current.filter(i => i !== id) : [...current, id]
    )
  }

  const handleAddAll = () => {
    onAddBundle?.(activeItems)
    toast(`Added bundle (${activeItems.length} items) to your cart!`, { type: 'success' })
  }

  return (
    <section className="frequently-bought-card card" aria-label="Frequently bought together bundle">
      <span className="eyebrow">SMART BUNDLE SAVINGS</span>
      <h3>Frequently Bought Together</h3>
      <p className="bundle-subhead">
        Customers who viewed this item also paired it with these recommended essentials:
      </p>

      <div className="bundle-layout">
        <div className="bundle-thumbnails">
          {items.map((item, idx) => {
            const isChecked = selectedIds.includes(item.id)
            return (
              <div key={item.id} className="bundle-thumb-wrap">
                {idx > 0 && <span className="bundle-plus-icon"><Plus size={18} /></span>}
                <div className={`bundle-thumb ${isChecked ? 'is-checked' : 'is-unchecked'}`}>
                  <img
                    src={item.image}
                    alt={item.name}
                    onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = '/product-placeholder.svg' }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        <div className="bundle-selection-list">
          {items.map(item => {
            const isMain = item.id === currentProduct.id
            const isChecked = selectedIds.includes(item.id)
            return (
              <label key={item.id} className="bundle-checkbox-row">
                <input
                  type="checkbox"
                  disabled={isMain}
                  checked={isChecked}
                  onChange={() => toggleItem(item.id)}
                />
                <span className="bundle-item-name">
                  {isMain ? <b>This item: {item.name}</b> : <Link to={`/product/${item.id}`}>{item.name}</Link>}
                </span>
                <strong className="bundle-item-price">{money(item.price)}</strong>
              </label>
            )
          })}
        </div>

        <div className="bundle-action-box">
          <div className="bundle-price-summary">
            <span>Bundle price ({activeItems.length} items):</span>
            <div className="bundle-total-prices">
              <strong>{money(finalPrice)}</strong>
              {bundleDiscount > 0 && (
                <span className="bundle-discount-badge">Save {money(bundleDiscount)} (8% bundle off)</span>
              )}
            </div>
          </div>
          <button
            type="button"
            className="primary-btn bundle-add-btn"
            onClick={handleAddAll}
          >
            <ShoppingBag size={16} /> Add all {activeItems.length} to Cart
          </button>
        </div>
      </div>
    </section>
  )
}
