import { assertCheckoutQuote, assertIdempotencyKey, assertOrder, assertPage } from './contracts'
import { createApiClient } from './apiClient'

/**
 * Production adapter. It deliberately contains no local fallback:
 * a failed live request must never silently become a successful demo action.
 */
export function createPlatformApi({ client = createApiClient() } = {}) {
  return {
    mode: 'api',
    catalog: {
      listProducts: async params => assertPage(await client.get('/api/v1/catalog/products', { query: params })),
      getProduct: id => client.get(\`/api/v1/catalog/products/\${encodeURIComponent(id)}\`),
      getOffers: id => client.get(\`/api/v1/products/\${encodeURIComponent(id)}/offers\`)
    },
    checkout: {
      quote: async payload => assertCheckoutQuote(await client.post('/api/v1/checkout/quote', payload)),
      createOrder: async (payload, idempotencyKey) => {
        assertIdempotencyKey(idempotencyKey)
        return assertOrder(await client.post('/api/v1/orders', payload, { idempotencyKey }))
      }
    },
    orders: {
      list: async params => assertPage(await client.get('/api/v1/me/orders', { query: params })),
      get: id => client.get(\`/api/v1/orders/\${encodeURIComponent(id)}\`)
    },
    seller: {
      getProfile: () => client.get('/api/v1/seller/profile'),
      listListings: params => client.get('/api/v1/seller/listings', { query: params }),
      createListing: (payload, idempotencyKey) => {
        assertIdempotencyKey(idempotencyKey)
        return client.post('/api/v1/seller/listings', payload, { idempotencyKey })
      },
      updateListing: (id, payload) => client.patch(`/api/v1/seller/listings/${encodeURIComponent(id)}`, payload),
      submitListing: (id, idempotencyKey) => {
        assertIdempotencyKey(idempotencyKey)
        return client.post(`/api/v1/seller/listings/${encodeURIComponent(id)}/submit`, {}, { idempotencyKey })
      },
      adjustInventory: (payload, idempotencyKey) => {
        assertIdempotencyKey(idempotencyKey)
        return client.post('/api/v1/seller/inventory/adjustments', payload, { idempotencyKey })
      },
      getOnboardingDraft: () => client.get('/api/v1/seller/onboarding/draft'),
      saveOnboardingDraft: payload => client.put('/api/v1/seller/onboarding/draft', payload),
      submitApplication: (payload, idempotencyKey) => {
        assertIdempotencyKey(idempotencyKey)
        return client.post('/api/v1/seller/applications', payload, { idempotencyKey })
      },
      listOffers: params => client.get('/api/v1/seller/offers', { query: params }),
      listInventory: params => client.get('/api/v1/seller/inventory', { query: params }),
      listOrders: params => client.get('/api/v1/seller/orders', { query: params }),
      acceptOrder: (id, payload, idempotencyKey) => {
        assertIdempotencyKey(idempotencyKey)
        return client.post(\`/api/v1/seller/orders/\${encodeURIComponent(id)}/accept\`, payload, { idempotencyKey })
      }
    },
    logistics: {
      quote: payload => client.post('/api/v1/shipping/quotes', payload),
      getTracking: id => client.get(\`/api/v1/shipments/\${encodeURIComponent(id)}/tracking\`)
    },
    finance: {
      getSellerSummary: () => client.get('/api/v1/seller/finance/summary'),
      listSettlements: params => client.get('/api/v1/seller/settlements', { query: params }),
      listPayouts: params => client.get('/api/v1/seller/payouts', { query: params })
    }
  }
}
