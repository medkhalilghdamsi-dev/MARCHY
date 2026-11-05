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
  '/operations/delivery',
  '/admin',
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

