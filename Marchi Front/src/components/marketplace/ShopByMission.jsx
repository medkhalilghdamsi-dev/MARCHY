import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { products } from '../../data/products'
import { money } from '../../utils/marketplace'
import { useMarketplace } from '../../providers/MarketplaceContext'
import { ArrowRight, Check, Sparkles, ShoppingBag, Plus } from 'lucide-react'

export const MISSIONS = [
  {
    id: 'apartment-starter',
    number: '01',
    badge: 'HOME SETUP',
    title: 'New Apartment Starter',
    subtitle: 'Move-in ready essentials',
    description: 'Minimal ceramic bedside lighting paired with a breathable woven cotton throw blanket for relaxed living.',
    productIds: [2, 7],
    bundleDiscount: 15,
    themeTag: 'warm-sand',
  },
  {
    id: 'ramadan-kitchen',
    number: '02',
    badge: 'CULINARY TRADITION',
    title: 'Ramadan Kitchen & Table',
    subtitle: 'Handcrafted hosting essentials',
    description: 'Fresh seasonal market selection alongside insulated dining accessories for authentic gathering and table sharing.',
    productIds: [9, 5],
    bundleDiscount: 10,
    themeTag: 'olive-mint',
  },
  {
    id: 'smarter-workdesk',
    number: '03',
    badge: 'PRODUCTIVITY',
    title: 'Smarter Workdesk Upgrades',
    subtitle: 'Focused, distraction-free work',
    description: 'Tactile mechanical keyboard combined with active noise-cancelling headphones for deep focus in any room.',
    productIds: [6, 1],
    bundleDiscount: 25,
    themeTag: 'slate-deep',
  },
  {
    id: 'routine-clean',
    number: '04',
    badge: 'ORGANISATION',
    title: 'Deep Clean & Storage',
    subtitle: 'Fresh spaces, structured storage',
    description: 'Heavy-duty vehicle care precision wash with multi-compartment duffel organization to keep gear spotless.',
    productIds: [10, 8],
    bundleDiscount: 18,
    themeTag: 'fresh-teal',
  },
]

export function ShopByMission() {
  const [activeMissionId, setActiveMissionId] = useState(MISSIONS[0].id)
  const [addedMissionId, setAddedMissionId] = useState(null)
  const { addToCart } = useMarketplace()
  const navigate = useNavigate()

  const currentMission = MISSIONS.find(m => m.id === activeMissionId) || MISSIONS[0]
  const missionProducts = currentMission.productIds.map(id => products.find(p => p.id === id)).filter(Boolean)
  const rawTotal = missionProducts.reduce((sum, p) => sum + p.price, 0)
  const bundlePrice = Math.max(0, rawTotal - currentMission.bundleDiscount)

  const handleAddBundle = () => {
    missionProducts.forEach(item => {
      addToCart({ ...item, qty: 1 })
    })
    setAddedMissionId(currentMission.id)
    setTimeout(() => setAddedMissionId(null), 2500)
  }

  return (
    <section className="landing-section shop-by-mission-section" aria-labelledby="mission-section-heading">
      <div className="landing-section-header">
        <div>
          <span className="eyebrow">CURATED ROUTINES · TUNISIA-FIRST</span>
          <h2 id="mission-section-heading">Shop by Mission</h2>
          <p className="muted">Cohesive, multi-item solutions designed for real moments — with guaranteed bundle savings.</p>
        </div>
        <Link to="/search" className="text-link">Browse all catalogue items <ArrowRight size={15} /></Link>
      </div>

      <div className="mission-tabs-bar" role="tablist" aria-label="Shopping missions">
        {MISSIONS.map(mission => (
          <button
            key={mission.id}
            type="button"
            role="tab"
            aria-selected={activeMissionId === mission.id}
            className={`mission-tab-button ${activeMissionId === mission.id ? 'is-active' : ''}`}
            onClick={() => setActiveMissionId(mission.id)}
          >
            <span className="mission-tab-num">{mission.number}</span>
            <div className="mission-tab-meta">
              <b>{mission.title}</b>
              <small>{mission.badge}</small>
            </div>
          </button>
        ))}
      </div>

      <div className={`mission-active-panel mission-theme-${currentMission.themeTag}`}>
        <div className="mission-editorial-column">
          <div className="mission-eyebrow-row">
            <span className="mission-pill-badge"><Sparkles size={13} /> {currentMission.badge}</span>
            <span className="mission-discount-chip">Save {money(currentMission.bundleDiscount)} on bundle</span>
          </div>

          <h3 className="mission-panel-title">{currentMission.title}</h3>
          <p className="mission-panel-subtitle">{currentMission.subtitle}</p>
          <p className="mission-panel-desc">{currentMission.description}</p>

          <div className="mission-pricing-strip">
            <div className="mission-price-block">
              <span className="mission-price-label">Bundle Price:</span>
              <strong className="mission-price-current">{money(bundlePrice)}</strong>
              <del className="mission-price-regular">{money(rawTotal)}</del>
            </div>

            <div className="mission-actions-row">
              <button
                type="button"
                className="mission-add-bundle-btn"
                onClick={handleAddBundle}
              >
                {addedMissionId === currentMission.id ? (
                  <>
                    <Check size={16} /> Bundle Added to Cart!
                  </>
                ) : (
                  <>
                    <ShoppingBag size={16} /> Add Bundle to Basket
                  </>
                )}
              </button>

              <button
                type="button"
                className="mission-view-btn"
                onClick={() => navigate(`/search?q=${encodeURIComponent(currentMission.title)}`)}
              >
                Explore Items <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>

        <div className="mission-items-column" aria-label="Items in this mission bundle">
          <div className="mission-products-card-wrap">
            {missionProducts.map((product, idx) => (
              <div key={product.id} className="mission-product-mini-card">
                <Link to={`/product/${product.id}`} className="mission-product-thumb">
                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = '/product-placeholder.svg' }}
                  />
                </Link>
                <div className="mission-product-info">
                  <span className="mission-product-cat">{product.category}</span>
                  <Link to={`/product/${product.id}`} className="mission-product-name">
                    {product.name}
                  </Link>
                  <div className="mission-product-price-row">
                    <strong>{money(product.price)}</strong>
                    <span className="mission-product-seller">by {product.seller.split('·')[0].trim()}</span>
                  </div>
                </div>
                {idx < missionProducts.length - 1 && (
                  <div className="mission-bundle-plus-indicator" aria-hidden="true">
                    <Plus size={16} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
