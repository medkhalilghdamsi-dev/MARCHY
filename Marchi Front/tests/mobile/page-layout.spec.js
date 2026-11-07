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
  '/orders',
  '/orders/MC-1048',
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


  test('keeps buyer routes usable at compact 320px and 375px widths', async ({ page }) => {
    for (const width of [320, 375]) {
      await page.setViewportSize({ width, height: 740 })

      for (const route of buyerRoutes) {
        await page.goto(route)
        await expect(page.locator('main').first()).toBeVisible()

        const metrics = await page.evaluate(() => {
          const main = document.querySelector('main')
          const rect = main.getBoundingClientRect()
          return {
            viewport: document.documentElement.clientWidth,
            document: document.documentElement.scrollWidth,
            body: document.body.scrollWidth,
            mainLeft: Math.floor(rect.left),
            mainRight: Math.ceil(rect.right),
          }
        })

        expect(metrics.document, `document overflow at ${width}px on ${route}`).toBeLessThanOrEqual(width + 1)
        expect(metrics.body, `body overflow at ${width}px on ${route}`).toBeLessThanOrEqual(width + 1)
        expect(metrics.mainLeft, `main starts outside at ${width}px on ${route}`).toBeGreaterThanOrEqual(0)
        expect(metrics.mainRight, `main ends outside at ${width}px on ${route}`).toBeLessThanOrEqual(width + 1)
      }
    }
  })
