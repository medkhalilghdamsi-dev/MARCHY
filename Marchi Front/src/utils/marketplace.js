import { formatMoney } from './format'
import { readText as readStoredText, readJson, writeJson } from './storage'

// Shared marketplace formatter: display TND values as buyer-friendly DT prices.
const money = value => formatMoney(value, 'en')
const searchSynonyms = {
  headphones: ['headphone','earphones','earbuds','headset','casque','ecouteurs','سماعات'],
  lamp: ['light','lighting','lampe','مصباح'],
  sneakers: ['shoes','trainers','chaussures','حذاء','أحذية'],
  skincare: ['skin care','beauty','soin','عناية بالبشرة'],
  bottle: ['flask','gourde','bouteille','قارورة'],
  keyboard: ['clavier','لوحة مفاتيح'],
  blanket: ['throw','cover','couverture','بطانية'],
  sports: ['fitness','training','sport','رياضة'],
  electronics: ['tech','technology','électronique','electronique','إلكترونيات'],
  fashion: ['clothing','apparel','mode','ملابس'],
  home: ['household','maison','منزل']
}
const normalizeSearchText = value => String(value || '').toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim()
const searchTextMatches = (text, query) => {
  const normalized = normalizeSearchText(text)
  const cleanedQuery = normalizeSearchText(query)
  if (!cleanedQuery) return true
  if (normalized.includes(cleanedQuery)) return true
  const words = cleanedQuery.split(/\s+/).filter(Boolean)
  return words.every(word => {
    const variants = [word, ...Object.entries(searchSynonyms).filter(([key, values]) => key === word || values.some(value => normalizeSearchText(value) === word)).flatMap(([key, values]) => [key, ...values].map(normalizeSearchText))]
    return variants.some(variant => normalized.split(' ').some(token => token === variant || token.startsWith(variant) || (token.length >= 3 && variant.startsWith(token))))
  })
}
const readText = (key, fallback) => readStoredText(key, '') || fallback

export { money, searchSynonyms, normalizeSearchText, searchTextMatches, readText, readJson, writeJson }
