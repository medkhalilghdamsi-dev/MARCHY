import { cp, mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'

// Render static sites do not read Netlify-style _redirects files. Generate
// directory index fallbacks so React Router URLs work on direct visits/reloads.
const routes = [
  'search', 'cart', 'checkout', 'wishlist', 'categories', 'sellers', 'account',
  'login', 'signup', 'help', 'delivery', 'returns', 'seller-help', 'sell', 'seller-dashboard',
  ...Array.from({ length: 15 }, (_, index) => `product/${index + 1}`),
  ...['Electronics', 'Groceries', 'Home', 'Fashion', 'Beauty', 'Sports', 'Accessories', 'Automotive', 'Books', 'Toys & Games', 'Baby & Kids', 'Pets', 'Garden & DIY'].map(category => `category/${encodeURIComponent(category.toLowerCase())}`),
  ...['atlas-tech-tunis', 'maison-sousse', 'urban-steps-sfax', 'nour-beauty-tunis', 'daily-essentials-monastir', 'active-life-bizerte', 'souks-frais-tunis', 'autocare-sfax', 'paper-trail-tunis', 'playbox-sousse'].map(slug => `seller/${slug}`),
]
const indexFile = resolve('dist/index.html')
for (const route of routes) {
  const destination = resolve('dist', route, 'index.html')
  await mkdir(resolve(destination, '..'), { recursive: true })
  await cp(indexFile, destination)
}
console.log(`Generated SPA entry points for ${routes.length} buyer-facing routes.`)
