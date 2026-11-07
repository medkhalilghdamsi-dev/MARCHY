import { test, expect } from '@playwright/test'

test.describe('Seller Central & Regression Shield', () => {
  test('Seller Central opens with workspace tabs and chrome', async ({ page }) => {
    await page.goto('/seller-central')
    await expect(page.locator('.seller-portal-chrome')).toBeVisible()
    await expect(page.getByRole('heading', { name: /Seller Central/i })).toBeVisible()
  })
})
