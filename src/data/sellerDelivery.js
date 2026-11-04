// Customer-facing delivery choices are owned and configured by MARCHY, never by individual sellers.
export const deliveryMethodDefaults = {
  standard: { id: 'standard', label: 'Standard delivery · 3–5 days', enabled: true, fee: 8 },
  express: { id: 'express', label: 'Express delivery · 1–2 days', enabled: true, fee: 12 }
}

export function getMarketplaceDeliveryMethods() {
  return Object.values(deliveryMethodDefaults).filter(method => method.enabled)
}

// Backwards-compatible alias for any older UI imports; seller settings are intentionally ignored.
export function getSellerDeliveryMethods() {
  return getMarketplaceDeliveryMethods()
}
