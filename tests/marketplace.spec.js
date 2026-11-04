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
  await page.getByRole('button', { name: 'Add to cart' }).click()
  await expect(page.getByRole('status')).toContainText('Added to your demo cart')
  await page.getByRole('link', { name: 'Shopping cart' }).click()
  await expect(page.getByRole('heading', { name: 'Your shopping cart' })).toBeVisible()
  await expect(page.getByText('2 items', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Increase Wireless noise-cancelling headphones quantity' }).click()
  await expect(page.getByText('3', { exact: true })).toBeVisible()
  await page.goto('/product/1')
  await page.getByRole('button', { name: 'Save for later' }).click()
  await page.goto('/wishlist')
  await expect(page.getByText('Wireless noise-cancelling headphones')).toBeVisible()
})
