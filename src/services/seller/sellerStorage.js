export const SELLER_STORAGE_KEYS = Object.freeze({
  profile: 'marchy-seller-onboarding-draft-v1',
  catalog: 'marchy-seller-catalog-v1',
  inventoryMovements: 'marchy-seller-inventory-movements-v1',
  offers: 'marchy-seller-offers-workspace-v1',
  returns: 'marchy-return-requests-v1',
  supportCases: 'marchy-seller-support-cases-v1',
  financeDemo: 'marchy-finance-demo-ledger',
  analyticsDemo: 'marchy-seller-analytics-demo'
})

const CHANGE_EVENT = 'marchy:seller-storage-changed'

function storage() {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null
  } catch {
    return null
  }
}

export function readSellerValue(key, fallback = null) {
  try {
    const raw = storage()?.getItem(key)
    if (raw === null || raw === undefined) return fallback
    const value = JSON.parse(raw)
    return value === null ? fallback : value
  } catch {
    return fallback
  }
}

export function readSellerList(key) {
  const value = readSellerValue(key, [])
  return Array.isArray(value) ? value : []
}

export function readSellerProfile() {
  const value = readSellerValue(SELLER_STORAGE_KEYS.profile, {})
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {}
}

function announceChange(key) {
  if (typeof window === 'undefined') return
  try {
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: { key } }))
  } catch {
    // Storage is already persisted; event delivery is a best-effort UI refresh.
  }
}

export function writeSellerValue(key, value) {
  try {
    const target = storage()
    if (!target) return false
    target.setItem(key, JSON.stringify(value))
    announceChange(key)
    return true
  } catch {
    return false
  }
}

// Persist related seller records together. If a write fails, restore the previous
// values for keys already attempted so the UI never reports a partial update.
export function writeSellerValues(entries) {
  if (!Array.isArray(entries) || entries.length === 0) return false
  let target
  const prepared = []
  const seen = new Set()
  try {
    target = storage()
    if (!target) return false
    for (const entry of entries) {
      if (!entry || typeof entry.key !== 'string' || !entry.key.trim() || seen.has(entry.key)) return false
      const serialized = JSON.stringify(entry.value)
      if (typeof serialized !== 'string') return false
      seen.add(entry.key)
      prepared.push({ key: entry.key, serialized, previous: target.getItem(entry.key) })
    }
  } catch {
    return false
  }

  const attempted = []
  try {
    for (const entry of prepared) {
      attempted.push(entry)
      target.setItem(entry.key, entry.serialized)
    }
  } catch {
    for (const entry of attempted.reverse()) {
      try {
        if (entry.previous === null) target.removeItem(entry.key)
        else target.setItem(entry.key, entry.previous)
      } catch {
        // Best-effort rollback; callers still receive failure and must not update UI state.
      }
    }
    return false
  }

  prepared.forEach(entry => announceChange(entry.key))
  return true
}

export function removeSellerValue(key) {
  try {
    const target = storage()
    if (!target) return false
    target.removeItem(key)
    announceChange(key)
    return true
  } catch {
    return false
  }
}

export function subscribeSellerStorage(keys, onChange) {
  if (typeof window === 'undefined' || typeof onChange !== 'function') return () => {}
  const watched = keys ? new Set(Array.isArray(keys) ? keys : [keys]) : null
  const matches = key => !watched || key === null || watched.has(key)
  const onLocalChange = event => {
    const key = event.detail?.key
    if (matches(key)) onChange(key)
  }
  const onExternalChange = event => {
    if (matches(event.key)) onChange(event.key)
  }
  window.addEventListener(CHANGE_EVENT, onLocalChange)
  window.addEventListener('storage', onExternalChange)
  return () => {
    window.removeEventListener(CHANGE_EVENT, onLocalChange)
    window.removeEventListener('storage', onExternalChange)
  }
}
