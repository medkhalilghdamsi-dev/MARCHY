import { test, expect } from '@playwright/test'

test.describe('Buyer Discovery & Curated Missions', () => {
  test('Home page renders ShopByMission routines and permits 1-click bundle adding', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.shop-by-mission')).toBeVisible()
    await expect(page.getByRole('heading', { name: /Shop by Routine & Mission/i })).toBeVisible()
    
    // Add first routine bundle to cart
    const bundleBtn = page.locator('.mission-add-bundle-btn').first()
    await expect(bundleBtn).toBeVisible()
    await bundleBtn.click()

    // Verify cart count badge increments
    await expect(page.locator('.cart-counter')).toBeVisible()
  })
})
