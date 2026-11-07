import { test, expect } from '@playwright/test'

test.describe('Seller Central & Regression Shield', () => {
  test('Seller Central opens with workspace tabs and chrome', async ({ page }) => {
    await page.goto('/seller-central')
    await expect(page.locator('.sc-hero')).toBeVisible()
    await expect(page.getByRole('heading', { name: /One workspace for your business on MARCHY/i })).toBeVisible()
  })
})
