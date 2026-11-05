import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MarketplaceService } from '../../services/marketplaceService'
import { money } from '../../utils/marketplace'
import { useMarketplace } from '../../providers/MarketplaceContext'
import { useToast } from '../../providers/ToastProvider'
import { ArrowRight, Check, Eye, Plus, Scale, Trash2, X } from 'lucide-react'

export function GlobalCompareDrawer() {
  const { addToCart } = useMarketplace()
  const toast = useToast()
  const [compareIds, setCompareIds] = useState(() => MarketplaceService.getCompareIds())
  const [modalOpen, setModalOpen] = useState(false)

  // Listen for storage changes or custom compare events
  useEffect(() => {
    const handleStorage = () => {
      setCompareIds(MarketplaceService.getCompareIds())
    }
    window.addEventListener('storage', handleStorage)
    window.addEventListener('marchy-compare-changed', handleStorage)
    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('marchy-compare-changed', handleStorage)
    }
  }, [])

  if (!compareIds || compareIds.length === 0) return null

  const allProducts = MarketplaceService.getProducts()
  const comparedProducts = compareIds.map(id => allProducts.find(p => p.id === id)).filter(Boolean)

  const handleRemove = (id) => {
    const next = MarketplaceService.toggleCompare(id)
    setCompareIds(next)
    window.dispatchEvent(new Event('marchy-compare-changed'))
    if (next.length === 0) setModalOpen(false)
  }

  const handleClearAll = () => {
    MarketplaceService.clearCompare()
    setCompareIds([])
    setModalOpen(false)
    window.dispatchEvent(new Event('marchy-compare-changed'))
    toast('Product comparison tray cleared', { type: 'info' })
  }

  return (
    <>
      {/* Floating Bottom Dock Pill */}
      <div className="global-compare-dock" role="region" aria-label="Product comparison dock">
        <div className="dock-content">
          <div className="dock-pill-btn" onClick={() => setModalOpen(true)}>
            <Scale size={18} className="dock-scale-icon" />
            <div className="dock-label-group">
              <b>Compare Products</b>
              <small>{comparedProducts.length} of 3 selected</small>
            </div>
          </div>

          <div className="dock-thumbnails">
            {comparedProducts.map(p => (
              <div key={p.id} className="dock-thumb-item" title={p.name}>
                <img src={p.image} alt={p.name} onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = '/product-placeholder.svg' }} />
                <button
                  type="button"
                  className="dock-thumb-remove"
                  onClick={(e) => { e.stopPropagation(); handleRemove(p.id) }}
                  aria-label={`Remove ${p.name}`}
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>

          <div className="dock-actions">
            <button
              type="button"
              className="primary-btn dock-open-btn"
              onClick={() => setModalOpen(true)}
              disabled={comparedProducts.length < 2}
            >
              Compare Now ({comparedProducts.length})
            </button>
            <button
              type="button"
              className="dock-clear-btn"
              onClick={handleClearAll}
              title="Clear all compared products"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Comparison Modal Overlay */}
      {modalOpen && (
        <div className="compare-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="compare-modal-title">
          <div className="compare-modal-card">
            <div className="compare-modal-header">
              <div>
                <span className="eyebrow">HEAD-TO-HEAD SPECIFICATIONS</span>
                <h2 id="compare-modal-title">Product Comparison ({comparedProducts.length} items)</h2>
                <p>Compare prices, specifications, seller dispatch, and customer ratings side-by-side.</p>
              </div>
              <div className="compare-header-actions">
                <button type="button" className="outline-btn" onClick={handleClearAll}>
                  Clear All
                </button>
                <button
                  type="button"
                  className="compare-modal-close"
                  onClick={() => setModalOpen(false)}
                  aria-label="Close comparison"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="compare-matrix-scroll">
              <table className="compare-matrix-table">
                <thead>
                  <tr>
                    <th className="matrix-feature-col">Feature / Detail</th>
                    {comparedProducts.map(p => (
                      <th key={p.id} className="matrix-product-col">
                        <div className="matrix-product-header">
                          <button
                            type="button"
                            className="matrix-remove-btn"
                            onClick={() => handleRemove(p.id)}
                            title="Remove"
                          >
                            <X size={14} />
                          </button>
                          <img
                            src={p.image}
                            alt={p.name}
                            className="matrix-img"
                            onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = '/product-placeholder.svg' }}
                          />
                          <Link to={`/product/${p.id}`} className="matrix-title" onClick={() => setModalOpen(false)}>
                            {p.name}
                          </Link>
                          <div className="matrix-price">
                            <strong>{money(p.price)}</strong>
                            {p.oldPrice && <del>{money(p.oldPrice)}</del>}
                          </div>
                          <button
                            type="button"
                            className="primary-btn matrix-cart-btn"
                            onClick={() => {
                              addToCart(p, 1)
                              toast(`Added ${p.name} to cart`, { type: 'success' })
                            }}
                          >
                            Add to Cart
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="matrix-feature-col">Rating & Feedback</td>
                    {comparedProducts.map(p => (
                      <td key={p.id}>★ {p.rating || 4.5} ({p.reviewCount || 12} reviews)</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="matrix-feature-col">Category</td>
                    {comparedProducts.map(p => (
                      <td key={p.id}>{p.category}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="matrix-feature-col">Merchant / Location</td>
                    {comparedProducts.map(p => (
                      <td key={p.id}>{p.seller}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="matrix-feature-col">Availability</td>
                    {comparedProducts.map(p => (
                      <td key={p.id}><span className="matrix-instock-tag">{p.stock || 'In stock'}</span></td>
                    ))}
                  </tr>
                  <tr>
                    <td className="matrix-feature-col">Key Specifications</td>
                    {comparedProducts.map(p => (
                      <td key={p.id}>
                        {p.specs ? (
                          <ul className="matrix-specs-list">
                            {Object.entries(p.specs).slice(0, 4).map(([k, v]) => (
                              <li key={k}><b>{k}:</b> {v}</li>
                            ))}
                          </ul>
                        ) : (
                          <em>Standard manufacturer specification</em>
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="matrix-feature-col">Cash on Delivery</td>
                    {comparedProducts.map(p => (
                      <td key={p.id}>✓ Pay upon inspection</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
