// Locale-aware formatting. Digits stay Latin in every language (the convention in Tunisia).
// Values are TND by default. Millime conversion must be explicit at the data boundary;
// magnitude-based guessing breaks legitimate high-value prices (for example 1,500 DT).
const LOCALES = { en: 'en-GB', fr: 'fr-TN-u-nu-latn', ar: 'ar-TN-u-nu-latn' }
const normalizeTnd = (value, unit = 'TND') => {
  const n = Number(value) || 0
  return unit === 'millimes' ? n / 1000 : n
}
const loc = lang => LOCALES[lang] || LOCALES.en

export function formatMoney(value, lang = 'en', { compact = false, unit = 'TND' } = {}) {
  const n = normalizeTnd(value, unit)
  const unit = lang === 'ar' ? 'د.ت' : 'DT'
  if (compact && Math.abs(n) >= 10000) {
    return `${new Intl.NumberFormat(loc(lang), { notation: 'compact', maximumFractionDigits: 1 }).format(n)} ${unit}`
  }
  const num = new Intl.NumberFormat(loc(lang), { minimumFractionDigits: 0, maximumFractionDigits: 3 }).format(n)
  return `${num} ${unit}`
}
// Backwards compatible English formatter used where no language is available.
export const money = value => formatMoney(value, 'en')

export function formatNumber(value, lang = 'en', options) {
  return new Intl.NumberFormat(loc(lang), options).format(Number(value) || 0)
}
export function formatPercent(value, lang = 'en', digits = 0) {
  return new Intl.NumberFormat(loc(lang), { style: 'percent', maximumFractionDigits: digits }).format(value)
}
export function formatDate(value, lang = 'en', options = { day: 'numeric', month: 'short', year: 'numeric' }) {
  const d = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return new Intl.DateTimeFormat(loc(lang), options).format(d)
}
export function formatDateTime(value, lang = 'en') {
  return formatDate(value, lang, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}
export function formatRelativeDays(value, lang = 'en') {
  const d = value instanceof Date ? value : new Date(value)
  const diff = Math.round((d.getTime() - Date.now()) / 86400000)
  return new Intl.RelativeTimeFormat(loc(lang), { numeric: 'auto' }).format(diff, 'day')
}
export function discountPercent(price, oldPrice) {
  return oldPrice && oldPrice > price ? Math.round((1 - price / oldPrice) * 100) : 0
}
export const clamp = (n, min, max) => Math.min(max, Math.max(min, n))

