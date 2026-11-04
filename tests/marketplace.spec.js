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

const responsiveRoutes = ['/', '/search', '/product/1', '/cart', '/checkout', '/wishlist', '/sell']
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
  await page.locator('.header-actions a[href="/cart"]').click()
  await expect(page.getByRole('heading', { name: 'Your shopping cart' })).toBeVisible()
  await expect(page.getByText('2 items', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Increase Wireless noise-cancelling headphones quantity' }).click()
  await expect(page.locator('.cart-item-quantity output')).toHaveText('3')
  await page.goto('/product/1')
  await page.getByRole('button', { name: 'Save for later' }).click()
  await page.goto('/wishlist')
  await expect(page.getByText('Wireless noise-cancelling headphones')).toBeVisible()
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

test('recently viewed products appear on the homepage', async ({ page }) => {
  await page.goto('/product/1')
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Recently viewed' })).toBeVisible()
  await expect(page.getByText('Wireless noise-cancelling headphones')).toBeVisible()
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


test('checkout preview validates contact details and reviews each seller without submitting an order', async ({ page }) => {
  await page.goto('/product/1')
  await page.locator('.product-purchase-row').getByRole('button', { name: 'Add to cart', exact: true }).click()
  await page.goto('/product/2')
  await page.locator('.product-purchase-row').getByRole('button', { name: 'Add to cart', exact: true }).click()
  await page.goto('/cart')
  await page.getByRole('link', { name: /Continue to checkout/ }).click()
  await expect(page).toHaveURL(/\/checkout$/)
  await page.getByRole('button', { name: 'Review order' }).click()
  await expect(page.getByRole('textbox', { name: 'Full name' })).toHaveJSProperty('validity.valid', false)
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
