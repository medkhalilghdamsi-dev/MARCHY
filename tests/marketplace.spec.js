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
  await expect(sellerGroups.nth(0)).toContainText('189 DT')
  await expect(sellerGroups.nth(1)).toContainText('Maison & Co')
  await expect(sellerGroups.nth(1)).toContainText('79 DT')
  await expect(page.locator('.cart-summary')).toContainText('268 DT')
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
  await page.getByLabel('Indicative price (DT)').fill('45')
  await page.getByLabel('Description').last().fill('A locally saved draft for testing')
  await page.getByRole('button', { name: 'Save draft on this device' }).click()
  await expect(page.getByRole('status')).toContainText('Draft saved on this device')
  await expect(page.locator('.seller-local-drafts')).toContainText('Handmade test vase')
  await expect(page.locator('.seller-local-drafts')).toContainText('LOCAL DRAFT')
  await page.getByRole('button', { name: 'Delete draft Handmade test vase' }).click()
  await expect(page.locator('.seller-local-drafts')).toHaveCount(0)
})

test('seller workspace explains MARCHY-managed delivery without seller rate controls', async ({ page }) => {
  await page.goto('/seller-dashboard')
  await page.getByRole('button', { name: 'Settings' }).click()
  await expect(page.getByRole('heading', { name: 'Delivery is managed centrally by MARCHY.' })).toBeVisible()
  await expect(page.getByText('Not seller-configurable')).toBeVisible()
  await expect(page.locator('.seller-delivery-settings input[type="number"]')).toHaveCount(0)
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
  await expect(page.getByLabel('MARCHY delivery option')).toBeVisible()
  await expect(page.getByText('Delivery method for Atlas Tech')).toHaveCount(0)
  await expect(page.locator('.checkout-summary')).toContainText('268 DT')
  await page.getByRole('button', { name: 'Continue to final preview' }).click()
  await expect(page.getByRole('heading', { name: 'Ready to create your sample order?' })).toBeVisible()
  await expect(page.getByText('No seller is contacted', { exact: false })).toBeVisible()
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


test('mobile discovery filters open as a usable panel without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 })
  await page.goto('/search')
  const filters = page.locator('#marketplace-filters')
  await expect(filters).toBeHidden()
  await page.getByRole('button', { name: /Filters/ }).click()
  await expect(filters).toBeVisible()
  await expect(page.getByRole('button', { name: /Filters/ })).toHaveAttribute('aria-expanded', 'true')
  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    document: document.documentElement.scrollWidth,
  }))
  expect(dimensions.document).toBeLessThanOrEqual(dimensions.viewport + 1)
})


test('mobile navigation exposes account, wishlist, selling and help destinations', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  const menuButton = page.getByRole('button', { name: 'Open navigation menu' })
  const navigation = page.getByRole('navigation', { name: 'Primary navigation' })
  await expect(menuButton).toBeVisible()
  await expect(navigation).toBeHidden()
  await menuButton.click()
  await expect(page.getByRole('button', { name: 'Close navigation menu' })).toHaveAttribute('aria-expanded', 'true')
  await expect(navigation).toBeVisible()
  await expect(navigation.getByRole('link', { name: 'Wishlist' })).toBeVisible()
  await expect(navigation.getByRole('link', { name: 'My account' })).toBeVisible()
  await expect(navigation.getByRole('link', { name: 'Sell on MARCHY' })).toBeVisible()
  await expect(navigation.getByRole('link', { name: 'Help centre' })).toBeVisible()
  await navigation.getByRole('link', { name: 'Wishlist' }).click()
  await expect(page).toHaveURL(/\/wishlist$/)
  await expect(navigation).toBeHidden()
})


test('mobile product page keeps purchase actions usable at narrow widths', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 })
  await page.goto('/product/1')
  await expect(page.locator('.product-image-stage')).toBeVisible()
  await expect(page.locator('.product-add-button')).toBeVisible()
  await expect(page.locator('.product-delivery-card')).toContainText('MARCHY-managed delivery')
  const buybar = page.locator('.product-mobile-buybar')
  await expect(buybar).toBeVisible()
  await expect(buybar.getByRole('button', { name: /Add to cart/ })).toBeVisible()
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  expect(overflow).toBeLessThanOrEqual(1)
})


test('mobile cart and checkout keep multi-seller totals and delivery review readable', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 })
  await page.goto('/product/1')
  await page.locator('.product-purchase-row').getByRole('button', { name: 'Add to cart', exact: true }).click()
  await page.goto('/product/2')
  await page.locator('.product-purchase-row').getByRole('button', { name: 'Add to cart', exact: true }).click()
  await page.goto('/cart')
  await expect(page.locator('.cart-seller-group')).toHaveCount(2)
  await expect(page.locator('.cart-summary')).toContainText('268 DT')
  await expect(page.locator('.cart-summary-note')).toContainText('selected at checkout')
  let overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  expect(overflow).toBeLessThanOrEqual(1)
  await page.locator('.cart-checkout-button').click()
  await page.getByLabel('Full name').fill('Test Buyer')
  await page.getByLabel('Phone number').fill('+216 20 000 000')
  await page.getByLabel('City').fill('Tunis')
  await page.getByLabel('Delivery address').fill('10 Example Street')
  await page.getByRole('button', { name: /Review order/ }).click()
  await expect(page.locator('.checkout-seller-review')).toHaveCount(2)
  await expect(page.getByLabel('MARCHY delivery option')).toBeVisible()
  await expect(page.locator('.checkout-summary')).toContainText('268 DT')
  overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  expect(overflow).toBeLessThanOrEqual(1)
})


test('mobile buyer account and order tracking keep key actions usable at 360px', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 })
  await page.goto('/account')
  await expect(page.locator('.account-overview-grid')).toBeVisible()
  await expect(page.locator('.account-overview-card').filter({ hasText: 'ORDER ACTIVITY' })).toBeVisible()
  let overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  expect(overflow).toBeLessThanOrEqual(1)

  await page.getByRole('link', { name: /Track.*Demo order updates/ }).click()
  await expect(page).toHaveURL(/\/orders$/)
  const orderCards = page.locator('.marchy-buyer-order-card')
  await expect(orderCards).toHaveCount(3)
  await expect(orderCards.first().locator('.marchy-order-timeline')).toBeVisible()
  await expect(orderCards.first()).toContainText('Preparing')
  await orderCards.first().getByRole('button', { name: 'Request cancellation' }).click()
  await expect(orderCards.first().locator('.marchy-case-summary')).toContainText('Buyer requested cancellation')
  await expect(orderCards.first()).toContainText('awaiting seller review')

  const deliveredOrder = orderCards.filter({ hasText: 'Delivered' }).first()
  await deliveredOrder.getByRole('button', { name: 'Request a return' }).click()
  await expect(deliveredOrder.locator('.marchy-case-summary')).toContainText('Buyer requested a return')
  overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  expect(overflow).toBeLessThanOrEqual(1)
  await expect(orderCards.first().getByRole('button', { name: 'Request cancellation' })).toHaveCount(0)
})


test('mobile Seller Centre keeps workspace navigation, drafts and fulfilment actions usable', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 })
  await page.goto('/seller-dashboard')
  const sectionNav = page.getByRole('navigation', { name: 'Seller dashboard sections' })
  await expect(sectionNav).toBeVisible()
  await expect(sectionNav.getByRole('button', { name: 'Overview' })).toBeVisible()
  let overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  expect(overflow).toBeLessThanOrEqual(1)

  await sectionNav.getByRole('button', { name: 'Products' }).click()
  await page.getByRole('button', { name: '＋ Create draft' }).click()
  await page.getByLabel('Product name').fill('Mobile seller draft')
  await page.getByLabel('Category').fill('Home & Living')
  await page.getByLabel('Indicative price (DT)').fill('45')
  await page.getByLabel('Description').fill('A sample product draft created on mobile.')
  await page.getByRole('button', { name: 'Save draft on this device' }).click()
  await expect(page.locator('.seller-local-drafts')).toContainText('Mobile seller draft')
  overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  expect(overflow).toBeLessThanOrEqual(1)

  await sectionNav.getByRole('button', { name: 'Orders' }).click()
  const firstOrder = page.locator('.marchy-order-card').first()
  await expect(firstOrder).toBeVisible()
  await firstOrder.getByRole('button', { name: /Manage order/ }).click()
  await expect(firstOrder.locator('.marchy-order-detail')).toBeVisible()
  await expect(firstOrder.locator('.marchy-order-detail')).toContainText('Delivery details')
  await expect(firstOrder.getByLabel('Update fulfilment status')).toBeVisible()
  overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  expect(overflow).toBeLessThanOrEqual(1)
})


test('keyboard users can skip navigation and operate search suggestions and quick view', async ({ page }) => {
  await page.goto('/')
  await page.keyboard.press('Tab')
  const skipLink = page.getByRole('link', { name: 'Skip to main content' })
  await expect(skipLink).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.locator('#main-content')).toBeFocused()

  const search = page.getByRole('textbox', { name: 'Search products' })
  await search.fill('headphones')
  await expect(search).toHaveAttribute('aria-expanded', 'true')
  await expect(page.getByRole('region', { name: 'Search suggestions' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(search).toHaveAttribute('aria-expanded', 'false')

  const quickViewTrigger = page.getByRole('button', { name: /Quick view/ }).first()
  await quickViewTrigger.focus()
  await page.keyboard.press('Enter')
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  const closeButton = dialog.getByRole('button', { name: 'Close quick view' })
  await expect(closeButton).toBeFocused()
  await page.keyboard.press('Shift+Tab')
  await expect(dialog.locator('a,button').last()).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(quickViewTrigger).toBeFocused()
})


test('mobile navigation Escape closes the menu and restores focus to its trigger', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  const trigger = page.getByRole('button', { name: 'Open navigation menu' })
  await trigger.click()
  const navigation = page.getByRole('navigation', { name: 'Primary navigation' })
  const wishlist = navigation.getByRole('link', { name: 'Wishlist' })
  await wishlist.focus()
  await page.keyboard.press('Escape')
  await expect(navigation).toBeHidden()
  await expect(page.getByRole('button', { name: 'Open navigation menu' })).toBeFocused()
})

test('Escape from header search suggestions restores focus to the search field', async ({ page }) => {
  await page.goto('/')
  const search = page.getByRole('textbox', { name: 'Search products' })
  await search.focus()
  await search.fill('headphones')
  await page.keyboard.press('Escape')
  await expect(search).toHaveAttribute('aria-expanded', 'false')
  await expect(search).toBeFocused()
})


test('sign-up password visibility and mismatch feedback are accessible', async ({ page }) => {
  await page.goto('/signup')
  const password = page.getByLabel('Password')
  const confirm = page.getByLabel('Confirm password')
  const toggle = page.getByRole('button', { name: 'Show password' })
  await expect(password).toHaveAttribute('type', 'password')
  await toggle.click()
  await expect(password).toHaveAttribute('type', 'text')
  await expect(page.getByRole('button', { name: 'Hide password' })).toHaveAttribute('aria-pressed', 'true')
  await password.fill('marchy-pass-123')
  await confirm.fill('different-pass-123')
  await page.getByRole('textbox', { name: 'Email address' }).fill('buyer@example.com')
  await page.getByLabel('Full name').fill('Test Buyer')
  await page.getByLabel(/I agree to the/).check()
  await page.getByRole('button', { name: /Create account/ }).click()
  await expect(confirm).toHaveAttribute('aria-invalid', 'true')
  await expect(page.getByRole('alert')).toContainText('Your passwords do not match.')
})
