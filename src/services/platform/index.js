import { createPlatformApi } from './apiAdapter'
import { createPlatformMock } from './mockAdapter'

const LIVE_MODE = import.meta.env.VITE_MARCHY_DATA_MODE === 'api'

/**
 * Explicit adapter selection. No automatic mock fallback in API mode.
 * Existing legacy pages can continue using MarketplaceService during migration.
 */
export const platform = LIVE_MODE ? createPlatformApi() : createPlatformMock()
export const platformMode = platform.mode
export { createPlatformApi } from './apiAdapter'
export { createPlatformMock } from './mockAdapter'
export * from './contracts'
