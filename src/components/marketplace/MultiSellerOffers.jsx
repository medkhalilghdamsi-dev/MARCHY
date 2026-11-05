import { useState } from 'react'
import { Link } from 'react-router-dom'
import { money } from '../../utils/marketplace'
import { Check, ShieldCheck, ShoppingCart, Store, Truck } from 'lucide-react'
import { useToast } from '../../providers/ToastProvider'

export function MultiSellerOffers({ offers, onSelectOffer, activeOfferId }) {
  const toast = useToast()
  const [selectedId, setSelectedId] = useState(activeOfferId || offers[0]?.id)

  if (!offers || offers.length <= 1) return null

  return (
    <section className="multi-seller-offers-panel" aria-label="Other seller offers for this product">
      <div className="multi-offers-header">
        <div>
          <span className="eyebrow">COMPARE MERCHANTS</span>
          <h3>Other Sellers on MARCHY ({offers.length} offers)</h3>
        </div>
        <span className="offers-badge">Transparent Multi-Vendor Pricing</span>
      </div>
      <p className="multi-offers-subtitle">
        Different verified Tunisian merchants carry this item. Compare prices, delivery timeframes, and merchant locations.
      </p>

      <div className="offers-list" role="radiogroup" aria-label="Available seller offers">
        {offers.map(offer => {
          const isSelected = selectedId === offer.id
          return (
            <article
              key={offer.id}
              className={`offer-card ${isSelected ? 'is-selected' : ''}`}
              onClick={() => setSelectedId(offer.id)}
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
                  <span className="offer-seller-rating">★ {offer.sellerRating}</span>
                  <span className="offer-condition-tag">{offer.condition}</span>
                </div>
              </div>

              <div className="offer-delivery-col">
                <div className="offer-delivery-row">
                  <Truck size={14} className="offer-delivery-icon" />
                  <div>
                    <b>{offer.shippingFee === 0 ? 'Free Shipping' : `${offer.shippingFee} TND Shipping`}</b>
                    <small>{offer.deliveryTime}</small>
                  </div>
                </div>
                <span className="offer-stock-pill">
                  {offer.stock > 5 ? `${offer.stock} in stock` : `Only ${offer.stock} left!`}
                </span>
              </div>

              <div className="offer-price-col">
                <div className="offer-price-block">
                  <strong>{money(offer.price)}</strong>
                  {offer.oldPrice && <del>{money(offer.oldPrice)}</del>}
                </div>
                <button
                  type="button"
                  className={`offer-select-btn ${isSelected ? 'is-active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedId(offer.id)
                    onSelectOffer?.(offer)
                    toast(`Selected ${offer.sellerName}'s offer at ${money(offer.price)}`, { type: 'success' })
                  }}
                >
                  {isSelected ? <><Check size={14}/> Selected Offer</> : <><ShoppingCart size={14}/> Buy from {offer.sellerName}</>}
                </button>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
