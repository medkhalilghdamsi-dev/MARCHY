import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { money } from '../../utils/marketplace'
import { Check, ShoppingCart, Store } from 'lucide-react'
import { useToast } from '../../providers/ToastProvider'

export function MultiSellerOffers({ offers, onSelectOffer, activeOfferId }) {
  const toast = useToast()
  const [selectedId, setSelectedId] = useState(activeOfferId || offers[0]?.id)

  useEffect(() => {
    setSelectedId(activeOfferId || offers[0]?.id)
  }, [activeOfferId, offers])

  if (!offers || offers.length <= 1) return null

  return (
    <section className="multi-seller-offers-panel" aria-label="Other seller offers for this product">
      <div className="multi-offers-header">
        <div>
          <span className="eyebrow">SAMPLE PRICE COMPARISON</span>
          <h3>Other sample storefront offers ({offers.length})</h3>
        </div>
        <span className="offers-badge">Illustrative catalogue data</span>
      </div>
      <p className="multi-offers-subtitle">
        Compare illustrative seller offers and displayed prices. Stock, seller status and delivery terms are not live-verified.
      </p>

      <div className="offers-list" role="list" aria-label="Sample seller offers">
        {offers.map(offer => {
          const isSelected = selectedId === offer.id
          return (
            <article
              key={offer.id}
              role="listitem"
              className={`offer-card ${isSelected ? 'is-selected' : ''}`}
            >
              <div className="offer-seller-col">
                <div className="offer-seller-identity">
                  <span className="offer-seller-icon"><Store size={15} /></span>
                  <div>
                    <Link
                      to={`/seller/${offer.sellerSlug}`}
                      className="offer-seller-name"
                      onClick={e => e.stopPropagation()}
                    >
                      {offer.sellerName}
                    </Link>
                    <span className="offer-seller-location">📍 {offer.sellerCity}, Tunisia</span>
                  </div>
                </div>
                <div className="offer-seller-meta">
                  <span className="offer-seller-rating">★ {offer.sellerRating} sample rating</span>
                  <span className="offer-condition-tag">Sample · {offer.condition}</span>
                </div>
              </div>

              <div className="offer-delivery-col">
                <div className="offer-delivery-row">
                  <div>
                    <b>Delivery to confirm</b>
                    <small>Fee and timing are illustrative</small>
                  </div>
                </div>
                <span className="offer-stock-pill">
                  {offer.stock > 5 ? `Sample stock: ${offer.stock}` : offer.stock > 0 ? `Sample stock: ${offer.stock} left` : 'Sample stock: unavailable'}
                </span>
              </div>

              <div className="offer-price-col">
                <div className="offer-price-block">
                  <small className="offer-price-caption">Sample price</small>
                  <strong>{money(offer.price)}</strong>
                  {offer.oldPrice && <del>{money(offer.oldPrice)}</del>}
                </div>
                <button
                  type="button"
                  className={`offer-select-btn ${isSelected ? 'is-active' : ''}`}
                  aria-pressed={isSelected}
                  disabled={offer.stock <= 0}
                  onClick={(e) => {
                    setSelectedId(offer.id)
                    onSelectOffer?.(offer)
                    toast(`Selected sample offer from ${offer.sellerName} at ${money(offer.price)}`, { type: 'success' })
                  }}
                >
                  {isSelected ? <><Check size={14}/> Selected sample</> : <><ShoppingCart size={14}/> Select sample offer</>}
                </button>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
