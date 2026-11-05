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
  '/orders',
  '/orders/MC-1048',
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

const responsiveRoutes = ['/', '/search', '/category/electronics', '/product/1', '/cart', '/checkout', '/wishlist', '/categories', '/sellers', '/seller/atlas-tech-tunis', '/account', '/help', '/delivery', '/returns', '/seller-help', '/sell', '/seller-dashboard', '/operations/delivery', '/admin', '/orders', '/orders/MC-1048']
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
    for (const route of ['/search', '/product/1', '/seller/atlas-tech-tunis', '/account', '/seller-dashboard', '/operations/delivery', '/admin', '/orders/MC-1048']) {
      await page.goto(route)
      await page.locator('.language-picker select').selectOption('ar')
      await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
      const dimensions = await page.evaluate(() => ({
        viewport: document.documentElement.clientWidth,
        document: document.documentElement.scrollWidth,
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


test('marketplace filters can be bookmarked and restored from the URL', async ({ page }) => {
  await page.goto('/search?q=headphones')
  await page.locator('input[name="marketplace-category"]').nth(1).check()
  await page.getByLabel('Seller location').selectOption({ index: 1 })
  await page.getByLabel('Minimum price in TND').fill('30')
  await page.getByLabel('Maximum price in TND').fill('250')
  await page.getByLabel('Sort products').selectOption('price-high')
  await expect(page).toHaveURL(/q=headphones/)
  await expect(page).toHaveURL(/category=Electronics/)
  await expect(page).toHaveURL(/city=/)
  await expect(page).toHaveURL(/min=30/)
  await expect(page).toHaveURL(/max=250/)
  await expect(page).toHaveURL(/sort=price-high/)
  const savedUrl = page.url()
  await page.reload()
  await expect(page.locator('input[name="marketplace-category"]').nth(1)).toBeChecked()
  await expect(page.getByLabel('Seller location')).not.toHaveValue('All')
  await expect(page.getByLabel('Minimum price in TND')).toHaveValue('30')
  await expect(page.getByLabel('Maximum price in TND')).toHaveValue('250')
  await expect(page.getByLabel('Sort products')).toHaveValue('price-high')
  expect(page.url()).toBe(savedUrl)
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

test('checkout creates shared demo seller orders and opens buyer tracking', async ({ page }) => {
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
  await page.getByRole('button', { name: 'Place demo order' }).click()
  await expect(page).toHaveURL(new RegExp('/orders/MC-'))
  await expect(page.getByRole('heading', { name: /Track MC-/ })).toBeVisible()
  await expect(page.locator('.buyer-tracking-panel')).toContainText('Demo Customer')
  const trackingPath = new URL(page.url()).pathname
  const orderId = trackingPath.split('/').pop()
  await page.goto('/account')
  await expect(page.locator('.account-demo-order[href="' + trackingPath + '"]')).toHaveCount(1)
  await page.goto('/seller-dashboard')
  await page.getByRole('button', { name: 'Orders' }).click()
  await expect(page.locator('.seller-order-row').filter({ hasText: 'Demo Customer' })).toHaveCount(1)
  await page.goto('/operations/delivery')
  const deliveryOrder = page.locator('.ops-table tbody tr').filter({ hasText: orderId })
  await expect(deliveryOrder).toContainText('Demo Customer')
  await deliveryOrder.getByLabel('Status for ' + orderId).selectOption('In transit')
  await page.goto('/admin')
  await expect(page.locator('.ops-table tbody tr').filter({ hasText: orderId })).toContainText('In transit')
  await page.goto(trackingPath)
  await expect(page.locator('.buyer-tracking-panel')).toContainText('In transit')
  await page.goto('/cart')
  await expect(page.locator('.cart-empty-state')).toBeVisible()
})

test('seller directory search matches accented French category terms', async ({ page }) => {
  await page.goto('/sellers')
  await page.getByRole('textbox', { name: 'Search sellers' }).fill('électronique')
  await expect(page.locator('.seller-directory-card')).toHaveCount(1)
  await expect(page.locator('.seller-directory-card').first()).toContainText('Atlas Tech')
})

test('core shopping pages have no serious or critical accessibility violations', async ({ page }) => {
  const { default: AxeBuilder } = await import('@axe-core/playwright')
  const routesToAudit = ['/', '/search', '/product/1', '/cart', '/checkout', '/wishlist', '/categories', '/seller/atlas-tech-tunis', '/sell', '/seller-dashboard', '/operations/delivery', '/admin', '/orders/MC-1048']
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


test('delivery operations and platform admin share order status and courier changes', async ({ page }) => {
  await page.goto('/operations/delivery')
  await expect(page.getByRole('heading', { name: 'Delivery operations' })).toBeVisible()
  const orderRow = page.locator('.ops-table tbody tr').filter({ hasText: 'MC-1048' })
  await expect(orderRow).toContainText('Atlas Tech')
  await orderRow.getByLabel('Courier for MC-1048').selectOption('Partner courier')
  await orderRow.getByLabel('Status for MC-1048').selectOption('In transit')
  await page.getByRole('link', { name: 'Platform admin' }).click()
  const adminRow = page.locator('.ops-table tbody tr').filter({ hasText: 'MC-1048' })
  await expect(adminRow).toContainText('In transit')
  await adminRow.getByLabel('Status for MC-1048').selectOption('Delivered')
  await page.getByRole('link', { name: 'Delivery operations', exact: true }).click()
  await page.getByRole('button', { name: 'All', exact: true }).click()
  await expect(page.locator('.ops-table tbody tr').filter({ hasText: 'MC-1048' })).toContainText('Delivered')
})

test('merchant order workspace shares order updates with delivery operations', async ({ page }) => {
  await page.goto('/seller-dashboard')
  await page.getByRole('button', { name: 'Orders' }).click()
  const order = page.locator('.seller-order-row').filter({ hasText: 'MC-1048' })
  await expect(order).toContainText('Amira Ben Salem')
  await order.getByLabel('Update status for MC-1048').selectOption('Processing')
  await page.getByRole('link', { name: '↗ Delivery operations' }).click()
  const deliveryRow = page.locator('.ops-table tbody tr').filter({ hasText: 'MC-1048' })
  await expect(deliveryRow).toContainText('Processing')
})


test('buyer account can follow shared demo order status changes', async ({ page }) => {
  await page.goto('/account')
  await page.getByRole('link', { name: /MC-1048/ }).click()
  await expect(page.getByRole('heading', { name: 'Track MC-1048' })).toBeVisible()
  await expect(page.locator('.buyer-tracking-panel')).toContainText('Ready for pickup')
  await page.getByRole('link', { name: 'Delivery operations', exact: true }).click()
  const deliveryRow = page.locator('.ops-table tbody tr').filter({ hasText: 'MC-1048' })
  await deliveryRow.getByLabel('Status for MC-1048').selectOption('In transit')
  await page.getByRole('link', { name: 'Buyer marketplace' }).click()
  await page.goto('/orders/MC-1048')
  await expect(page.locator('.buyer-tracking-panel')).toContainText('In transit')
})


test('connected operations workspaces respect French and Arabic interface language', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('marchy-language', 'fr'))
  await page.goto('/operations/delivery')
  await expect(page.getByRole('heading', { name: 'Opérations de livraison' })).toBeVisible()
  await page.locator('.language-picker select').selectOption('ar')
  await expect(page.getByRole('heading', { name: 'عمليات التوصيل' })).toBeVisible()
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
})


test('buyer order history searches, filters and opens tracking', async ({ page }) => {
  await page.goto('/orders')
  await expect(page.getByRole('heading', { name: 'Your orders' })).toBeVisible()
  await expect(page.locator('.buyer-order-card')).toHaveCount(5)
  await page.getByLabel('Search orders').fill('Amira')
  await expect(page.locator('.buyer-order-card')).toHaveCount(1)
  await expect(page.locator('.buyer-order-card')).toContainText('MC-1048')
  await page.getByLabel('Search orders').fill('')
  await page.getByLabel('Order status').selectOption('Delivered')
  await expect(page.locator('.buyer-order-card')).toHaveCount(1)
  await page.getByRole('link', { name: 'Track order' }).click()
  await expect(page.getByRole('heading', { name: 'Track MC-1046' })).toBeVisible()
})


test('buyer order history respects French and Arabic interface language', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('marchy-language', 'fr'))
  await page.goto('/orders')
  await expect(page.getByRole('heading', { name: 'Vos commandes' })).toBeVisible()
  await page.locator('.language-picker select').selectOption('ar')
  await expect(page.getByRole('heading', { name: 'طلباتك' })).toBeVisible()
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
})
