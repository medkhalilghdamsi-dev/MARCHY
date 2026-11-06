import { MarketplaceService } from '../marketplaceService'
import { products as seedProducts } from '../../data/products'
import { PlatformError } from './contracts'

/**
 * Read-only demo adapter for screens that need catalogue data.
 * Mutations that imply a real transaction intentionally fail closed.
 */
export function createPlatformMock() {
  const unavailable = action => {
    throw new PlatformError(\`\${action} is a demo-only workflow and is not connected to a production backend.\`, {
      code: 'DEMO_ACTION_UNAVAILABLE'
    })
  }

  return {
    mode: 'mock',
    catalog: {
      listProducts: async ({ limit = 24 } = {}) => ({
        items: seedProducts.slice(0, Math.max(1, Number(limit) || 24)),
        nextCursor: null
      }),
      getProduct: async id => MarketplaceService.getProductById(id),
      getOffers: async id => MarketplaceService.getProductOffers(id)
    },
    checkout: {
      quote: async () => unavailable('Checkout quote'),
      createOrder: async () => unavailable('Order creation')
    },
    orders: {
      list: async () => unavailable('Order history'),
      get: async () => unavailable('Order details')
    },
    seller: {
      getProfile: async () => unavailable('Seller profile'),
      getOnboardingDraft: async () => unavailable('Seller onboarding'),
      saveOnboardingDraft: async () => unavailable('Seller onboarding'),
      submitApplication: async () => unavailable('Seller application submission'),
      listOffers: async () => unavailable('Seller offers'),
      listInventory: async () => unavailable('Seller inventory'),
      listOrders: async () => unavailable('Seller orders'),
      acceptOrder: async () => unavailable('Seller order acceptance')
    },
    logistics: {
      quote: async () => unavailable('Shipping quote'),
      getTracking: async () => unavailable('Shipment tracking')
    },
    finance: {
      getSellerSummary: async () => unavailable('Seller finance summary'),
      listSettlements: async () => unavailable('Seller settlements'),
      listPayouts: async () => unavailable('Seller payouts')
    }
  }
}
