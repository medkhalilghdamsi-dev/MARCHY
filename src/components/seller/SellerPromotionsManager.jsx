import { useState } from 'react'
import { MarketplaceService } from '../../services/marketplaceService'
import { money } from '../../utils/marketplace'
import { Check, Plus, Tag, Ticket, Trash2 } from 'lucide-react'
import { useToast } from '../../providers/ToastProvider'

export function SellerPromotionsManager({ sellerName }) {
  const toast = useToast()
  const [promotions, setPromotions] = useState(() => MarketplaceService.getPromotions())
  const [showCreate, setShowCreate] = useState(false)
  const [code, setCode] = useState('')
  const [type, setType] = useState('percentage')
  const [value, setValue] = useState(10)
  const [minSpend, setMinSpend] = useState(40)
  const [label, setLabel] = useState('')

  const handleCreatePromo = (e) => {
    e.preventDefault()
    if (!code.trim() || !value) return

    const newPromo = MarketplaceService.createPromotion({
      code: code.trim().toUpperCase(),
      type,
      value: Number(value),
      minSpend: Number(minSpend) || 0,
      label: label.trim() || `${code.trim().toUpperCase()} Campaign by ${sellerName}`,
      seller: sellerName
    })

    setPromotions(MarketplaceService.getPromotions())
    setShowCreate(false)
    setCode('')
    setLabel('')
    toast(`Promo code ${newPromo.code} created! Buyers can now use it at checkout.`, { type: 'success' })
  }

  return (
    <section className="seller-promotions-section" aria-label="Promotions and coupon management">
      <div className="seller-dashboard-products-heading">
        <div>
          <b>Discounts & Promotional Campaigns</b>
          <small>Create promotional voucher codes that apply directly in buyer shopping carts.</small>
        </div>
        <button
          type="button"
          className="primary-btn"
          onClick={() => setShowCreate(v => !v)}
        >
          {showCreate ? 'Close Form' : '＋ Create Campaign'}
        </button>
      </div>

      {showCreate && (
        <form className="seller-promo-form card" onSubmit={handleCreatePromo}>
          <div className="promo-form-header">
            <span className="eyebrow">NEW CAMPAIGN</span>
            <h4>Create a Merchant Coupon Code</h4>
          </div>

          <div className="promo-fields-grid">
            <label>
              Coupon Code
              <input
                required
                type="text"
                maxLength={15}
                placeholder="e.g. FLASH20"
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
              />
            </label>

            <label>
              Discount Type
              <select value={type} onChange={e => setType(e.target.value)}>
                <option value="percentage">Percentage Discount (%)</option>
                <option value="fixed">Fixed Amount Off (TND)</option>
              </select>
            </label>

            <label>
              Discount Value {type === 'percentage' ? '(%)' : '(TND)'}
              <input
                required
                type="number"
                min="1"
                max={type === 'percentage' ? 90 : 500}
                value={value}
                onChange={e => setValue(e.target.value)}
              />
            </label>

            <label>
              Minimum Cart Spend (TND)
              <input
                type="number"
                min="0"
                value={minSpend}
                onChange={e => setMinSpend(e.target.value)}
              />
            </label>

            <label className="promo-form-wide">
              Public Description / Label
              <input
                required
                type="text"
                placeholder="e.g. 20% off all artisan home pieces over 50 TND"
                value={label}
                onChange={e => setLabel(e.target.value)}
              />
            </label>
          </div>

          <div className="promo-form-actions">
            <button type="button" className="outline-btn" onClick={() => setShowCreate(false)}>
              Cancel
            </button>
            <button type="submit" className="primary-btn">
              Publish Coupon Code
            </button>
          </div>
        </form>
      )}

      <div className="promotions-grid">
        {promotions.map(promo => (
          <article key={promo.code} className="promo-card">
            <div className="promo-card-top">
              <span className="promo-code-pill">
                <Ticket size={14} /> {promo.code}
              </span>
              <span className="promo-active-chip">Active</span>
            </div>
            <h4 className="promo-card-value">
              {promo.type === 'percentage' ? `${promo.value}% OFF` : `${promo.value} TND OFF`}
            </h4>
            <p className="promo-card-desc">{promo.label}</p>
            <div className="promo-card-meta">
              <small>Min Spend: {promo.minSpend ? `${promo.minSpend} TND` : 'No minimum'}</small>
              <small>Sponsor: {promo.seller || 'Marketplace'}</small>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
