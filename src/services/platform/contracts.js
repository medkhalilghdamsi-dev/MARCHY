/**
 * Runtime contracts shared by MARCHY's mock and API adapters.
 * Money uses integer millimes (1 TND = 1,000 millimes) at the API boundary.
 * UI formatting is handled separately by src/utils/format.js.
 */
export const PLATFORM_CURRENCY = 'TND'
export const API_VERSION = 'v1'

export class PlatformError extends Error {
  constructor(message, { code = 'PLATFORM_ERROR', status = 0, requestId = null, fieldErrors = null, cause = null } = {}) {
    super(message, cause ? { cause } : undefined)
    this.name = 'PlatformError'
    this.code = code
    this.status = status
    this.requestId = requestId
    this.fieldErrors = fieldErrors
  }
}

export const isRecord = value => Boolean(value) && typeof value === 'object' && !Array.isArray(value)

export function assertMoney(value, label = 'money') {
  if (!isRecord(value) || !Number.isSafeInteger(value.amountMinor) || value.amountMinor < 0 || value.currency !== PLATFORM_CURRENCY) {
    throw new PlatformError(\`Invalid \${label}: expected a non-negative integer amountMinor in TND.\`, { code: 'INVALID_MONEY' })
  }
  return value
}

export function assertCheckoutQuote(quote) {
  if (!isRecord(quote) || typeof quote.id !== 'string' || !quote.id || typeof quote.expiresAt !== 'string') {
    throw new PlatformError('Checkout quote is missing its id or expiry.', { code: 'INVALID_CHECKOUT_QUOTE' })
  }
  assertMoney(quote.total, 'checkout total')
  if (!Array.isArray(quote.lines) || !Array.isArray(quote.parcels)) {
    throw new PlatformError('Checkout quote must include lines and parcel breakdowns.', { code: 'INVALID_CHECKOUT_QUOTE' })
  }
  return quote
}

export function assertOrder(order) {
  if (!isRecord(order) || typeof order.id !== 'string' || !order.id || typeof order.status !== 'string') {
    throw new PlatformError('Order response is missing its id or status.', { code: 'INVALID_ORDER' })
  }
  return order
}

export function assertPage(page) {
  if (!isRecord(page) || !Array.isArray(page.items)) {
    throw new PlatformError('Expected a paginated response with an items array.', { code: 'INVALID_PAGE' })
  }
  return page
}

export function assertIdempotencyKey(key) {
  if (typeof key !== 'string' || key.trim().length < 12 || key.length > 128) {
    throw new PlatformError('A valid Idempotency-Key is required for this action.', { code: 'IDEMPOTENCY_KEY_REQUIRED' })
  }
  return key
}
