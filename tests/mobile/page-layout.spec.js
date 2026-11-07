import { test, expect } from '@playwright/test'

const buyerRoutes = [
  '/',
  '/search',
  '/categories',
  '/product/1',
  '/cart',
  '/checkout',
  '/wishlist',
  '/sellers',
  '/account',
  '/help',
  '/delivery',
  '/returns',
]

test.describe('buyer page layout containment', () => {
  test('keeps primary buyer routes inside a narrow mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })

    for (const route of buyerRoutes) {
      await page.goto(route)
      await expect(page.locator('main').first()).toBeVisible()

      const dimensions = await page.evaluate(() => {
        const main = document.querySelector('main')
        const rect = main.getBoundingClientRect()
        return {
          viewport: window.innerWidth,
          body: document.body.scrollWidth,
          mainLeft: Math.floor(rect.left),
          mainRight: Math.ceil(rect.right),
        }
      })

      expect(dimensions.body, `body overflow on ${route}`).toBeLessThanOrEqual(dimensions.viewport)
      expect(dimensions.mainLeft, `main starts outside viewport on ${route}`).toBeGreaterThanOrEqual(0)
      expect(dimensions.mainRight, `main ends outside viewport on ${route}`).toBeLessThanOrEqual(dimensions.viewport)
    }
  })
})
