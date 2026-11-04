import { test, expect } from '@playwright/test'

const routes = [
  '/',
  '/search',
  '/category/electronics',
  '/product/1',
  '/cart',
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

const responsiveRoutes = ['/', '/search', '/product/1', '/cart', '/wishlist', '/sell']
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

test('core shopping pages have no serious or critical accessibility violations', async ({ page }) => {
  const { default: AxeBuilder } = await import('@axe-core/playwright')
  const routesToAudit = ['/', '/search', '/product/1', '/cart', '/wishlist', '/categories', '/seller/atlas-tech-tunis', '/sell']
  for (const route of routesToAudit) {
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
