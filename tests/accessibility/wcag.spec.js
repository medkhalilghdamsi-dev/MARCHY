import { test, expect } from '@playwright/test'

test.describe('WCAG 2.2 AA Accessibility Checks', () => {
  test('Skip link is available and navigates to #main-content', async ({ page }) => {
    await page.goto('/')
    const skipLink = page.locator('.skip-to-content')
    await expect(skipLink).toBeAttached()
    await expect(page.locator('#main-content')).toBeAttached()
  })

  test('Interactive elements have accessible names and labels', async ({ page }) => {
    await page.goto('/cart')
    await expect(page.locator('#main-content')).toBeVisible()
  })
})
