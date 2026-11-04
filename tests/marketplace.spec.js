import { test, expect } from '@playwright/test'

const routes = [
  '/',
  '/search',
  '/category/electronics',
  '/product/1',
  '/cart',
  '/checkout',
  '/wishlist',
  '/categories',
  '/sellers',
  '/seller/atlas-tech-tunis',
  '/account',
  '/help',
  '/delivery',
  '/returns',
  '/seller-help',
  '/sell',
  '/seller-dashboard',
  '/this-page-does-not-exist',
]

test('all public frontend routes render a page and a page-specific title', async ({ page }) => {
  for (const route of routes) {
    await page.goto(route)
    await expect(page.locator('main').first()).toBeVisible()
    await expect(page).toHaveTitle(/\| MARCHY$/)
  }
})

const responsiveRoutes = ['/', '/search', '/category/electronics', '/product/1', '/cart', '/checkout', '/wishlist', '/categories', '/sellers', '/seller/atlas-tech-tunis', '/account', '/help', '/delivery', '/returns', '/seller-help', '/sell', '/seller-dashboard']
const viewports = [
  { width: 360, height: 800 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1440, height: 900 },
]

for (const viewport of viewports) {
  test(`critical pages fit the viewport at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport)
    for (const route of responsiveRoutes) {
      await page.goto(route)
      await expect(page.locator('main').first()).toBeVisible()
      const dimensions = await page.evaluate(() => ({
        viewport: document.documentElement.clientWidth,
        document: document.documentElement.scrollWidth,
        offenders: Array.from(document.querySelectorAll('body *')).map(el => {
          const rect = el.getBoundingClientRect()
          return { tag: el.tagName, className: typeof el.className === 'string' ? el.className : '', width: Math.round(rect.width), left: Math.round(rect.left), right: Math.round(rect.right), scrollWidth: el.scrollWidth, clientWidth: el.clientWidth }
        }).filter(item => (item.right > window.innerWidth + 1 || item.left < -1) && item.width > 0).sort((a,b) => Math.max(b.right-window.innerWidth,-b.left)-Math.max(a.right-window.innerWidth,-a.left)).slice(0,12),
      }))
      expect(
        dimensions.document,
        `Unexpected horizontal page overflow on ${route}: ${JSON.stringify(dimensions)}`,
      ).toBeLessThanOrEqual(dimensions.viewport + 1)
    }
  })
}

test('Arabic RTL layout remains within the viewport on key marketplace routes', async ({ page }) => {
  for (const width of [360, 390, 768]) {
    await page.setViewportSize({ width, height: 844 })
    for (const route of ['/search', '/product/1', '/seller/atlas-tech-tunis', '/account', '/seller-dashboard']) {
      await page.goto(route)
      await page.locator('.language-picker select').selectOption('ar')
      await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
      const dimensions = await page.evaluate(() => ({
        viewport: document.documentElement.clientWidth,
        document: document.documentElement.scrollWidth,
        offenders: Array.from(document.querySelectorAll('body *')).map(el => {
          const rect = el.getBoundingClientRect()
          return { tag: el.tagName, className: typeof el.className === 'string' ? el.className : '', width: Math.round(rect.width), left: Math.round(rect.left), right: Math.round(rect.right), scrollWidth: el.scrollWidth, clientWidth: el.clientWidth }
        }).filter(item => (item.right > window.innerWidth + 1 || item.left < -1) && item.width > 0).sort((a,b) => Math.max(b.right-window.innerWidth,-b.left)-Math.max(a.right-window.innerWidth,-a.left)).slice(0,12),
      }))
      expect(dimensions.document, `Unexpected Arabic RTL overflow on ${route} at ${width}px: ${JSON.stringify(dimensions)}`).toBeLessThanOrEqual(dimensions.viewport + 1)
    }
  }
})

test('mobile navigation opens and closes after route selection', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  const openMenu = page.getByRole('button', { name: 'Open navigation menu' })
  await expect(openMenu).toBeVisible()
  await openMenu.click()
  const navigation = page.getByRole('navigation', { name: 'Primary navigation' })
  await expect(navigation).toBeVisible()
  await navigation.locator('a[href="/categories"]').click()
  await expect(page).toHaveURL(/\/categories$/)
  await expect(page.getByRole('button', { name: 'Open navigation menu' })).toBeVisible()
})

test('product quantity, cart updates and wishlist persist across routes', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/product/1')
  await page.getByRole('button', { name: 'Increase quantity' }).click()
  await expect(page.getByLabel('Selected quantity')).toHaveText('2')
  await page.locator('.product-purchase-row').getByRole('button', { name: 'Add to cart', exact: true }).click()
  await expect(page.locator('.product-added-feedback')).toContainText('Added to your demo cart')
  await page.locator('.mobile-tabbar a[href="/cart"]').click()
  await expect(page.getByRole('heading', { name: 'Your shopping cart' })).toBeVisible()
  await expect(page.getByText('2 items', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Increase Wireless noise-cancelling headphones quantity' }).click()
  await expect(page.locator('.cart-item-quantity output')).toHaveText('3')
  await page.goto('/product/1')
  await page.getByRole('button', { name: 'Save for later' }).click()
  await page.goto('/wishlist')
  await expect(page.locator('.wishlist-product-grid')).toContainText('Wireless noise-cancelling headphones')
})

test('product comparisons persist when navigating away and returning', async ({ page }) => {
  await page.goto('/search')
  const cards = page.locator('.product-card')
  await cards.nth(0).getByRole('button', { name: /Compare/ }).click()
  await cards.nth(1).getByRole('button', { name: /Compare/ }).click()
  await expect(page.getByRole('region', { name: 'Product comparison' })).toBeVisible()
  await page.goto('/product/1')
  await page.goto('/search')
  await expect(page.getByRole('region', { name: 'Product comparison' })).toContainText('2 of 3 selected')
})

test('product grid and list preferences persist across marketplace navigation', async ({ page }) => {
  await page.goto('/search')
  await page.getByRole('button', { name: 'List view' }).click()
  await expect(page.locator('.listing-results .product-grid')).toHaveClass(/product-list-view/)
  await expect(page.getByRole('button', { name: 'List view' })).toHaveAttribute('aria-pressed', 'true')
  await page.goto('/product/1')
  await page.goto('/search')
  await expect(page.locator('.listing-results .product-grid')).toHaveClass(/product-list-view/)
  await page.getByRole('button', { name: 'Grid view' }).click()
  await expect(page.locator('.listing-results .product-grid')).not.toHaveClass(/product-list-view/)
})

test('homepage hero search submits queries and popular shortcuts navigate to search', async ({ page }) => {
  await page.goto('/')
  const heroSearch = page.getByRole('search').getByRole('searchbox', { name: 'Search products and categories' })
  await heroSearch.fill('headphones')
  await page.locator('.hero-search-form').getByRole('button', { name: /Search/ }).click()
  await expect(page).toHaveURL(/\/search\?q=headphones/)
  await expect(page.locator('.listing-results')).toContainText('headphones')
  await page.goto('/')
  await page.locator('.hero-trending').getByRole('button', { name: 'Fashion' }).click()
  await expect(page).toHaveURL(/\/search\?q=Fashion/)
})

test('recently viewed products appear on the homepage', async ({ page }) => {
  await page.goto('/product/1')
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Recently viewed' })).toBeVisible()
  await expect(page.locator('.home-recently-viewed')).toContainText('Wireless noise-cancelling headphones')
})


test('cart groups products by seller and keeps each seller subtotal visible', async ({ page }) => {
  await page.goto('/product/1')
  await page.locator('.product-purchase-row').getByRole('button', { name: 'Add to cart', exact: true }).click()
  await page.goto('/product/2')
  await page.locator('.product-purchase-row').getByRole('button', { name: 'Add to cart', exact: true }).click()
  await page.goto('/cart')
  const sellerGroups = page.locator('.cart-seller-group')
  await expect(sellerGroups).toHaveCount(2)
  await expect(sellerGroups.nth(0)).toContainText('Atlas Tech')
  await expect(sellerGroups.nth(0)).toContainText('189.000 TND')
  await expect(sellerGroups.nth(1)).toContainText('Maison & Co')
  await expect(sellerGroups.nth(1)).toContainText('79.000 TND')
  await expect(page.locator('.cart-summary')).toContainText('268.000 TND')
})


test('customer account shows and clears recently viewed products', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('marchy-recently-viewed', JSON.stringify([1, 2])))
  await page.goto('/account')
  await expect(page.locator('.account-recently-viewed')).toBeVisible()
  await expect(page.locator('.account-recent-grid')).toContainText('Wireless noise-cancelling headphones')
  await page.getByRole('button', { name: 'Clear history' }).click()
  await expect(page.locator('.account-recently-viewed')).toHaveCount(0)
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('marchy-recently-viewed')))).toEqual([])
})

test('seller workspace can save and delete a local product draft without publishing it', async ({ page }) => {
  await page.goto('/seller-dashboard')
  await page.getByRole('button', { name: 'Products' }).click()
  await page.getByRole('button', { name: /Create draft/ }).click()
  await page.getByLabel('Product name').fill('Handmade test vase')
  await page.getByLabel('Category').first().fill('Home & Living')
  await page.getByLabel('Indicative price (TND)').fill('45')
  await page.getByLabel('Description').last().fill('A locally saved draft for testing')
  await page.getByRole('button', { name: 'Save draft on this device' }).click()
  await expect(page.getByRole('status')).toContainText('Draft saved on this device')
  await expect(page.locator('.seller-local-drafts')).toContainText('Handmade test vase')
  await expect(page.locator('.seller-local-drafts')).toContainText('LOCAL DRAFT')
  await page.getByRole('button', { name: 'Delete draft Handmade test vase' }).click()
  await expect(page.locator('.seller-local-drafts')).toHaveCount(0)
})

test('seller can edit a saved local product draft without changing other drafts', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('marchy-seller-drafts', JSON.stringify([
    {id:'draft-a',sellerSlug:'atlas-tech-tunis',title:'First local draft',category:'Electronics',price:25,description:'First description',status:'Draft',createdAt:'2026-01-01T00:00:00.000Z'},
    {id:'draft-b',sellerSlug:'atlas-tech-tunis',title:'Second local draft',category:'Accessories',price:35,description:'Second description',status:'Draft',createdAt:'2026-01-02T00:00:00.000Z'}
  ])))
  await page.goto('/seller-dashboard')
  await page.getByRole('button', { name: 'Products' }).click()
  await page.getByRole('button', { name: 'Edit draft First local draft' }).click()
  await expect(page.getByRole('heading', { name: 'Update product information' })).toBeVisible()
  await page.getByLabel('Product name').fill('Updated first draft')
  await page.getByRole('button', { name: 'Update local draft' }).click()
  await expect(page.getByRole('status')).toContainText('Draft updated on this device')
  await expect(page.locator('.seller-local-drafts')).toContainText('Updated first draft')
  await expect(page.locator('.seller-local-drafts')).toContainText('Second local draft')
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('marchy-seller-drafts')))
  expect(saved).toHaveLength(2)
  expect(saved.find(d => d.id === 'draft-a').title).toBe('Updated first draft')
  expect(saved.find(d => d.id === 'draft-b').title).toBe('Second local draft')
})

test('seller storefront offers a share action without inventing seller contact details', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.addInitScript(() => Object.defineProperty(navigator, 'share', { configurable: true, value: undefined }))
  await page.goto('/seller/atlas-tech-tunis')
  await page.getByRole('button', { name: /Share storefront/ }).click()
  await expect(page.getByRole('status').filter({ hasText: 'Storefront link copied' })).toBeVisible()
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('/seller/atlas-tech-tunis')
  await expect(page.getByText(/Seller information requires confirmation/)).toBeVisible()
})

test('seller storefront exposes active filters and can clear them', async ({ page }) => {
  await page.goto('/seller/atlas-tech-tunis')
  await page.getByRole('button', { name: 'Electronics', exact: true }).click()
  await expect(page.locator('.store-active-filters')).toContainText('Electronics')
  await page.getByRole('button', { name: 'Clear all' }).click()
  await expect(page.locator('.store-active-filters')).toHaveCount(0)
  await page.getByRole('textbox', { name: 'Search this storefront' }).fill('headphones')
  await expect(page.locator('.store-active-filters')).toContainText('headphones')
  await page.getByRole('button', { name: /Search:/ }).click()
  await expect(page.locator('.store-active-filters')).toHaveCount(0)
})

test('seller storefront supports persistent grid and list product layouts', async ({ page }) => {
  await page.goto('/seller/atlas-tech-tunis')
  await page.getByRole('button', { name: 'List view' }).click()
  await expect(page.locator('.seller-store-page .product-grid')).toHaveClass(/product-list-view/)
  await page.goto('/seller/atlas-tech-tunis')
  await expect(page.locator('.seller-store-page .product-grid')).toHaveClass(/product-list-view/)
  await page.getByRole('button', { name: 'Grid view' }).click()
  await expect(page.locator('.seller-store-page .product-grid')).not.toHaveClass(/product-list-view/)
})

test('product detail can add a listing to the cross-page comparison tray', async ({ page }) => {
  await page.goto('/product/1')
  await page.getByRole('button', { name: '＋ Compare' }).click()
  await expect(page.getByRole('status').filter({ hasText: 'Added to comparison' })).toBeVisible()
  await page.getByRole('link', { name: 'Open comparison' }).click()
  await expect(page).toHaveURL(/\/search$/)
  await expect(page.locator('.compare-tray')).toContainText('1 of 3 selected')
  await expect(page.locator('.compare-tray')).toContainText('Wireless noise-cancelling headphones')
})

test('product detail buyer checklist adapts to listing category', async ({ page }) => {
  await page.goto('/product/1')
  await expect(page.locator('.product-order-checklist')).toContainText('Exact model, technical specifications and compatibility')
  await expect(page.locator('.product-order-checklist')).toContainText('Warranty coverage and proof of purchase')
  await page.goto('/product/3')
  await expect(page.locator('.product-order-checklist')).toContainText('Size measurements, fit and available variants')
  await expect(page.locator('.product-order-checklist')).toContainText('Material composition and care instructions')
})

test('product comparison button reflects the current product after related-item navigation', async ({ page }) => {
  await page.goto('/product/1')
  await page.getByRole('button', { name: '＋ Compare' }).click()
  await page.locator('.related-products .product-card a').first().click()
  await expect(page).toHaveURL(/\/product\//)
  await expect(page.getByRole('button', { name: '＋ Compare' })).toHaveAttribute('aria-pressed', 'false')
})

test('product page can copy a shareable listing link', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.addInitScript(() => Object.defineProperty(navigator, 'share', { configurable: true, value: undefined }))
  await page.goto('/product/1')
  await page.getByRole('button', { name: /Share/ }).click()
  await expect(page.getByRole('status').filter({ hasText: 'Listing link copied' })).toBeVisible()
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('/product/1')
})

test('checkout preview validates contact details and reviews each seller without submitting an order', async ({ page }) => {
  await page.goto('/product/1')
  await page.locator('.product-purchase-row').getByRole('button', { name: 'Add to cart', exact: true }).click()
  await page.goto('/product/2')
  await page.locator('.product-purchase-row').getByRole('button', { name: 'Add to cart', exact: true }).click()
  await page.goto('/cart')
  await page.getByRole('link', { name: /Continue to checkout/ }).click()
  await expect(page).toHaveURL(/\/checkout$/)
  await page.getByRole('button', { name: 'Review order' }).click()
  expect(await page.locator('.checkout-form').evaluate(form => form.checkValidity())).toBe(false)
  await page.getByRole('textbox', { name: 'Full name' }).fill('Demo Customer')
  await page.getByRole('textbox', { name: 'Phone number' }).fill('+216 20 000 000')
  await page.getByRole('textbox', { name: 'City' }).fill('Tunis')
  await page.getByRole('textbox', { name: 'Delivery address' }).fill('10 Demo Street')
  await page.getByRole('button', { name: 'Review order' }).click()
  await expect(page.getByRole('heading', { name: 'Review before proceeding' })).toBeVisible()
  await expect(page.locator('.checkout-seller-review')).toHaveCount(2)
  await expect(page.locator('.checkout-summary')).toContainText('268.000 TND')
  await page.getByRole('button', { name: 'Continue to final preview' }).click()
  await expect(page.getByRole('heading', { name: 'Your checkout flow is ready for a live integration' })).toBeVisible()
  await expect(page.getByText('No order has been created', { exact: false })).toBeVisible()
})

test('seller directory search matches accented French category terms', async ({ page }) => {
  await page.goto('/sellers')
  await page.getByRole('textbox', { name: 'Search sellers' }).fill('électronique')
  await expect(page.locator('.seller-directory-card')).toHaveCount(1)
  await expect(page.locator('.seller-directory-card').first()).toContainText('Atlas Tech')
})

test('core shopping pages have no serious or critical accessibility violations', async ({ page }) => {
  const { default: AxeBuilder } = await import('@axe-core/playwright')
  const routesToAudit = ['/', '/search', '/product/1', '/cart', '/checkout', '/wishlist', '/categories', '/seller/atlas-tech-tunis', '/sell']
  for (const route of routesToAudit) {
    if (route === '/checkout') await page.addInitScript(() => localStorage.setItem('marchy-cart', JSON.stringify([{ id: 1, name: 'Wireless noise-cancelling headphones', category: 'Electronics', price: 189, qty: 1, image: '/product-placeholder.svg' }])))
    await page.goto(route)
    await expect(page.locator('main').first()).toBeVisible()
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()
    const highImpact = results.violations.filter(issue => ['serious', 'critical'].includes(issue.impact))
    expect(
      highImpact,
      `Serious accessibility violations on ${route}: ${JSON.stringify(highImpact.map(issue => ({ id: issue.id, impact: issue.impact, help: issue.help, nodes: issue.nodes.map(node => node.target) }))) }`,
    ).toEqual([])
  }
})


test('buyer routes update browser titles and descriptions', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle('Discover more, closer to home | MARCHY')
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /Discover products and local storefronts/)

  await page.goto('/search?q=headphones')
  await expect(page).toHaveTitle('Search results for headphones | MARCHY')
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /sample marketplace results for headphones/)

  await page.goto('/product/1')
  await expect(page).toHaveTitle('Wireless noise-cancelling headphones | MARCHY')
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', 'Wireless noise-cancelling headphones | MARCHY')
  await expect(page.locator('meta[name="twitter:description"]')).toHaveAttribute('content', /sample listing for Wireless noise-cancelling headphones/)

  await page.goto('/seller/atlas-tech-tunis')
  await expect(page).toHaveTitle('Atlas Tech | MARCHY')
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /demo storefront for Atlas Tech/)

  await page.goto('/checkout')
  await expect(page).toHaveTitle('Checkout preview | MARCHY')
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /No order or payment is submitted/)
})


test('buyer search filters restore from a shareable URL', async ({ page }) => {
  await page.goto('/search?q=headphones&category=Electronics&city=Tunis&min=100&max=200&sort=price-high')
  await expect(page.getByRole('textbox', { name: 'Search marketplace' })).toHaveValue('headphones')
  await expect(page.getByRole('radio', { name: /Electronics/ })).toBeChecked()
  await expect(page.getByRole('combobox', { name: 'Seller location' })).toHaveValue('Tunis')
  await expect(page.getByRole('spinbutton', { name: 'Minimum price in TND' })).toHaveValue('100')
  await expect(page.getByRole('spinbutton', { name: 'Maximum price in TND' })).toHaveValue('200')
  await expect(page.getByRole('combobox', { name: 'Sort products' })).toHaveValue('price-high')
  await expect(page.locator('.product-card')).toHaveCount(1)

  await page.getByRole('button', { name: 'Clear all' }).first().click()
  await expect(page).toHaveURL('/search')
  await expect(page.getByRole('textbox', { name: 'Search marketplace' })).toHaveValue('')
  await expect(page.getByRole('combobox', { name: 'Seller location' })).toHaveValue('All')
})


test('mobile product page keeps the purchase action reachable in the sticky buy bar', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/product/1')
  const buyBar = page.locator('.product-mobile-buybar')
  await expect(buyBar).toBeVisible()
  await expect(page.getByText('Delivery details to confirm')).toBeVisible()
  await expect(buyBar.getByText('189.000 TND')).toBeVisible()
  await buyBar.getByRole('button', { name: 'Add to cart' }).click()
  await expect(buyBar.getByRole('button', { name: 'Added ✓' })).toBeVisible()
  await expect(page.locator('.mobile-tabbar a[href="/cart"]')).toContainText('1')
})


test('seller storefront empty state clears search, category and sort together', async ({ page }) => {
  await page.goto('/seller/atlas-tech-tunis?q=does-not-exist&category=Electronics&sort=high')
  await expect(page.getByRole('heading', { name: 'No matching products' })).toBeVisible()
  await page.getByRole('button', { name: 'Clear storefront filters' }).click()
  await expect(page).toHaveURL('http://127.0.0.1:4173/seller/atlas-tech-tunis')
  await expect(page.getByRole('textbox', { name: 'Search this storefront' })).toHaveValue('')
  await expect(page.getByRole('combobox', { name: 'Sort storefront products' })).toHaveValue('featured')
  await expect(page.getByRole('button', { name: 'All', exact: true })).toHaveAttribute('aria-pressed', 'true')
})

test('seller storefront filters restore from a shareable URL and clear together', async ({ page }) => {
  await page.goto('/seller/atlas-tech-tunis?q=keyboard&category=Electronics&sort=low')
  await expect(page.getByRole('textbox', { name: 'Search this storefront' })).toHaveValue('keyboard')
  await expect(page.getByRole('button', { name: 'Electronics', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('combobox', { name: 'Sort storefront products' })).toHaveValue('low')
  await expect(page.getByRole('button', { name: /Sort: Price low to high/ })).toBeVisible()
  await expect(page.locator('.product-grid')).toContainText('Compact mechanical keyboard')
  await page.getByRole('button', { name: 'Clear all' }).click()
  await expect(page).toHaveURL('http://127.0.0.1:4173/seller/atlas-tech-tunis')
  await expect(page.getByRole('textbox', { name: 'Search this storefront' })).toHaveValue('')
  await expect(page.getByRole('combobox', { name: 'Sort storefront products' })).toHaveValue('featured')
})

test('theme preference toggles and persists across route navigation and reload', async ({ page }) => {
  await page.goto('/')
  const themeToggle = page.getByRole('button', { name: 'Switch to dark mode' })
  await expect(themeToggle).toBeVisible()
  await themeToggle.click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await expect(page.getByRole('button', { name: 'Switch to light mode' })).toHaveAttribute('aria-pressed', 'true')
  await expect.poll(() => page.evaluate(() => localStorage.getItem('marchy-theme'))).toBe('dark')
  await page.goto('/product/1')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await page.getByRole('button', { name: 'Switch to light mode' }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await expect.poll(() => page.evaluate(() => localStorage.getItem('marchy-theme'))).toBe('light')
})

test('product quick view traps keyboard focus and closes with Escape', async ({ page }) => {
  await page.goto('/search')
  const card = page.locator('.product-card').first()
  const productName = await card.locator('.product-name').innerText()
  const trigger = card.getByRole('button', { name: /^Quick view/ })
  await trigger.click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('heading', { name: productName })).toBeVisible()
  const close = dialog.getByRole('button', { name: 'Close quick view' })
  const finalAction = dialog.getByRole('link', { name: /View full details/ })
  await expect(close).toBeFocused()
  await page.keyboard.press('Shift+Tab')
  await expect(finalAction).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(close).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  await expect(trigger).toBeFocused()
})


test('sample catalogue avoids implying popularity or verified listing recency', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Featured sample listings' })).toBeVisible()
  await expect(page.getByText('Explore:', { exact: true })).toBeVisible()
  await page.goto('/search')
  await expect(page.getByRole('combobox', { name: 'Sort products' })).toContainText('Catalogue order')
  await expect(page.getByText('Quick budget filters')).toHaveCount(1)
})


test('product add-to-cart confirmation resets when the selected quantity changes', async ({ page }) => {
  await page.goto('/product/1')
  const addButton = page.locator('.product-purchase-row').getByRole('button', { name: 'Add to cart', exact: true })
  await addButton.click()
  await expect(page.locator('.product-added-feedback')).toBeVisible()
  await page.getByRole('button', { name: 'Increase quantity' }).click()
  await expect(page.locator('.product-added-feedback')).toHaveCount(0)
  await expect(page.locator('.product-purchase-row').getByRole('button', { name: 'Add to cart', exact: true })).toBeVisible()
})


test('quick view lets buyers choose quantity before adding to cart', async ({ page }) => {
  await page.goto('/search')
  const card = page.locator('.product-card').first()
  const productName = await card.locator('.product-name').innerText()
  await card.getByRole('button', { name: /^Quick view/ }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog.getByRole('heading', { name: productName })).toBeVisible()
  await expect(dialog).toBeVisible()
  const initialSubtotal = await dialog.locator('.quick-view-quantity-total').innerText()
  const unitPrice = Number(initialSubtotal.replace(/[^0-9.]/g, ''))
  await dialog.getByRole('button', { name: 'Increase quick-view quantity' }).click()
  await expect(dialog.getByLabel('Quick-view selected quantity')).toHaveText('2')
  await expect(dialog.locator('.quick-view-quantity-total')).toHaveText(`${(unitPrice * 2).toFixed(3)} TND`)
  await dialog.getByRole('button', { name: 'Add 2 to demo cart' }).click()
  await expect(dialog.getByRole('button', { name: 'Added to cart ✓' })).toBeVisible()
  await page.goto('/cart')
  await expect(page.getByRole('heading', { name: 'Your shopping cart' })).toBeVisible()
  await expect(page.getByText('2 items', { exact: true })).toBeVisible()
})


test('dedicated comparison page presents selected products side by side and supports removal', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('marchy-compare', JSON.stringify([1, 2, 6])))
  await page.goto('/compare')
  await expect(page.getByRole('heading', { name: 'Compare products' })).toBeVisible()
  await expect(page.locator('.compare-page-count')).toContainText('3/3')
  await expect(page.locator('.compare-product-card')).toHaveCount(3)
  await expect(page.locator('.compare-full-table')).toBeVisible()
  await expect(page.locator('.compare-full-table')).toContainText('Displayed price')
  await expect(page.locator('.compare-full-table')).toContainText('Seller location')
  await page.getByRole('button', { name: 'Remove Minimal ceramic table lamp from comparison' }).click()
  await expect(page.locator('.compare-product-card')).toHaveCount(2)
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('marchy-compare')))).toEqual([1, 6])
})

test('comparison page guides buyers when only one product is selected', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('marchy-compare', JSON.stringify([1])))
  await page.goto('/compare')
  await expect(page.locator('.compare-product-card')).toHaveCount(1)
  await expect(page.getByText('One more product makes comparison possible.')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Find another product →' })).toHaveAttribute('href', '/search')
  await expect(page.locator('.compare-full-table')).toHaveCount(0)
})

test('comparison page has a useful empty state when no products are selected', async ({ page }) => {
  await page.goto('/compare')
  await expect(page.getByRole('heading', { name: 'No products selected' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Explore products →' })).toHaveAttribute('href', '/search')
})
