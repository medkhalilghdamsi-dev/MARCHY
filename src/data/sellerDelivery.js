import { readJson } from '../utils/marketplace'

export const deliveryMethodDefaults = {
  standard: { id: 'standard', label: 'Standard delivery · 3–5 days', enabled: true, fee: 8 },
  express: { id: 'express', label: 'Express delivery · 1–2 days', enabled: true, fee: 12 },
  pickup: { id: 'pickup', label: 'Seller collection · timing to confirm', enabled: true, fee: 0 }
}

export function getSellerDeliveryMethods(sellerSlug) {
  const saved = readJson('marchy-seller-delivery-settings', {})
  const configured = saved?.[sellerSlug] || {}
  return Object.values(deliveryMethodDefaults).map(method => {
    const current = configured[method.id] || {}
    return { ...method, ...current, id: method.id, fee: Math.max(0, Number(current.fee ?? method.fee) || 0), enabled: current.enabled ?? method.enabled }
  }).filter(method => method.enabled)
}
