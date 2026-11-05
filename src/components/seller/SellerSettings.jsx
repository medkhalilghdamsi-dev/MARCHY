import { useState, useEffect } from 'react'
import { readJson, writeJson } from '../../utils/marketplace'
import { useToast } from '../../providers/ToastProvider'

export function SellerSettings({ seller }) {
  const toast = useToast()
  const storageKey = `marchy-seller-settings-${seller.slug}`

  const defaultSettings = {
    storeName: seller.name,
    tagline: seller.tagline || 'Everyday finds, carefully selected.',
    description: seller.description,
    city: seller.city,
    contactEmail: `contact@${seller.slug}.tn`,
    phone: '+216 71 890 123',
    handlingTime: '24h',
    deliveryFee: '7.000',
    freeDeliveryThreshold: '120.000',
    deliveryAreas: ['Tunis', 'Ariana', 'Ben Arous', 'Sousse', 'Sfax'],
    notifyNewOrder: true,
    notifyLowStock: true,
    notifyWeeklyDigest: true,
    bankName: 'BIAT',
    accountHolder: seller.name,
    rib: '08 000 0001234567890 45',
    payoutFrequency: 'Weekly',
  }

  const [settings, setSettings] = useState(() => readJson(storageKey, defaultSettings))
  const [savedFeedback, setSavedFeedback] = useState('')

  useEffect(() => {
    // Re-sync if seller changes
    setSettings(readJson(storageKey, defaultSettings))
    setSavedFeedback('')
  }, [seller.slug])

  function updateField(field, value) {
    setSettings(prev => ({ ...prev, [field]: value }))
    setSavedFeedback('')
  }

  function handleSave(e) {
    e.preventDefault()
    writeJson(storageKey, settings)
    setSavedFeedback('Storefront preferences and payout settings saved on this device.')
    toast('Storefront settings updated successfully!', { type: 'success' })
  }

  function handleReset() {
    setSettings(defaultSettings)
    writeJson(storageKey, defaultSettings)
    toast('Settings reset to default profile values', { type: 'info' })
  }

  return (
    <div className="seller-settings-space">
      <div className="settings-header">
        <div>
          <h3>Storefront Preferences & Configuration</h3>
          <p className="muted">Manage business identity, delivery parameters, notifications and bank payout details.</p>
        </div>
        <span className="seller-dashboard-status">LOCAL SETTINGS PREVIEW</span>
      </div>

      {savedFeedback && (
        <div className="settings-alert-banner" role="status">
          ✓ {savedFeedback}
        </div>
      )}

      <form className="seller-settings-form" onSubmit={handleSave}>
        {/* Section 1: Business Profile */}
        <fieldset className="settings-section card">
          <legend className="eyebrow">STORE IDENTITY & BRANDING</legend>
          <div className="settings-grid-2">
            <label>
              Store Public Name
              <input
                type="text"
                required
                maxLength="60"
                value={settings.storeName}
                onChange={e => updateField('storeName', e.target.value)}
              />
            </label>
            <label>
              City / Headquarters
              <select
                value={settings.city}
                onChange={e => updateField('city', e.target.value)}
              >
                {['Tunis', 'Ariana', 'Ben Arous', 'Manouba', 'Sousse', 'Sfax', 'Monastir', 'Nabeul', 'Bizerte', 'Gabès'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </label>
          </div>

          <label>
            Storefront Tagline
            <input
              type="text"
              maxLength="90"
              value={settings.tagline}
              onChange={e => updateField('tagline', e.target.value)}
              placeholder="e.g. Handmade ceramic and artisan home goods"
            />
          </label>

          <label>
            Public Store Description
            <textarea
              rows="3"
              maxLength="300"
              value={settings.description}
              onChange={e => updateField('description', e.target.value)}
            />
            <small className="muted">{settings.description.length}/300 characters</small>
          </label>

          <div className="settings-grid-2">
            <label>
              Business Email
              <input
                type="email"
                required
                value={settings.contactEmail}
                onChange={e => updateField('contactEmail', e.target.value)}
              />
            </label>
            <label>
              Customer Service Phone
              <input
                type="tel"
                value={settings.phone}
                onChange={e => updateField('phone', e.target.value)}
              />
            </label>
          </div>
        </fieldset>

        {/* Section 2: Fulfilment & Shipping Policies */}
        <fieldset className="settings-section card">
          <legend className="eyebrow">FULFILMENT & DELIVERY POLICIES</legend>
          <div className="settings-grid-3">
            <label>
              Order Handling Time
              <select
                value={settings.handlingTime}
                onChange={e => updateField('handlingTime', e.target.value)}
              >
                <option value="Same day">Same day dispatch</option>
                <option value="24h">Within 24 hours</option>
                <option value="48h">Within 48 hours</option>
                <option value="3-5 days">3 to 5 business days</option>
              </select>
            </label>
            <label>
              Standard Delivery Fee (TND)
              <input
                type="number"
                step="0.500"
                min="0"
                value={settings.deliveryFee}
                onChange={e => updateField('deliveryFee', e.target.value)}
              />
            </label>
            <label>
              Free Delivery Threshold (TND)
              <input
                type="number"
                step="1.000"
                min="0"
                value={settings.freeDeliveryThreshold}
                onChange={e => updateField('freeDeliveryThreshold', e.target.value)}
              />
            </label>
          </div>
          <p className="settings-hint">
            Buyers within Tunisia will see your standard delivery pricing and free delivery conditions during checkout preview.
          </p>
        </fieldset>

        {/* Section 3: Notification Preferences */}
        <fieldset className="settings-section card">
          <legend className="eyebrow">NOTIFICATIONS & ALERTS</legend>
          <div className="settings-checkbox-list">
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={settings.notifyNewOrder}
                onChange={e => updateField('notifyNewOrder', e.target.checked)}
              />
              <div>
                <b>New Order Instant Notifications</b>
                <small>Receive an alert whenever a buyer places an order with your storefront.</small>
              </div>
            </label>

            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={settings.notifyLowStock}
                onChange={e => updateField('notifyLowStock', e.target.checked)}
              />
              <div>
                <b>Low Stock Warning</b>
                <small>Alert when product inventory falls below 3 units in your active listings.</small>
              </div>
            </label>

            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={settings.notifyWeeklyDigest}
                onChange={e => updateField('notifyWeeklyDigest', e.target.checked)}
              />
              <div>
                <b>Weekly Performance Digest</b>
                <small>Summary email with revenue trends, top items and customer reviews.</small>
              </div>
            </label>
          </div>
        </fieldset>

        {/* Section 4: Bank Payout Information */}
        <fieldset className="settings-section card">
          <legend className="eyebrow">BANKING & PAYOUT SETTINGS</legend>
          <div className="settings-grid-2">
            <label>
              Bank Name (Tunisia)
              <select
                value={settings.bankName}
                onChange={e => updateField('bankName', e.target.value)}
              >
                <option value="BIAT">BIAT (Banque Internationale Arabe de Tunisie)</option>
                <option value="Attijari Bank">Attijari Bank</option>
                <option value="BNA">BNA (Banque Nationale Agricole)</option>
                <option value="Amen Bank">Amen Bank</option>
                <option value="STB">STB (Société Tunisienne de Banque)</option>
                <option value="UBCI">UBCI</option>
                <option value="UIB">UIB (Union Internationale de Banques)</option>
                <option value="BH Bank">BH Bank</option>
                <option value="Poste Tunisienne">La Poste Tunisienne (CCP)</option>
              </select>
            </label>
            <label>
              Payout Frequency
              <select
                value={settings.payoutFrequency}
                onChange={e => updateField('payoutFrequency', e.target.value)}
              >
                <option value="Weekly">Weekly (Every Monday)</option>
                <option value="Bi-weekly">Bi-weekly (1st & 15th)</option>
                <option value="Monthly">Monthly</option>
              </select>
            </label>
          </div>

          <div className="settings-grid-2">
            <label>
              Account Holder Name
              <input
                type="text"
                required
                value={settings.accountHolder}
                onChange={e => updateField('accountHolder', e.target.value)}
              />
            </label>
            <label>
              RIB (Relevé d'Identité Bancaire - 20 digits)
              <input
                type="text"
                required
                maxLength="25"
                value={settings.rib}
                onChange={e => updateField('rib', e.target.value)}
                placeholder="XX XXX XXXXXXXXXXXXX XX"
              />
            </label>
          </div>
          <p className="settings-hint">
            🔒 Bank account details are stored locally in this prototype for demonstration purposes and are never transmitted.
          </p>
        </fieldset>

        {/* Action buttons */}
        <div className="settings-actions">
          <button type="button" className="outline-btn" onClick={handleReset}>
            Reset Defaults
          </button>
          <button type="submit" className="primary-btn">
            Save Storefront Settings <span>→</span>
          </button>
        </div>
      </form>
    </div>
  )
}
