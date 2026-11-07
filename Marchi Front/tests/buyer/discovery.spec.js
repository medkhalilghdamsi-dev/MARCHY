import { test, expect } from '@playwright/test'

test.describe('Buyer Discovery & Curated Missions', () => {
  test('Home page renders ShopByMission routines and permits 1-click bundle adding', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.shop-by-mission-section')).toBeVisible()
    await expect(page.getByRole('heading', { name: /Shop by Mission/i })).toBeVisible()
    
    // Add first routine bundle to cart
    const bundleBtn = page.locator('.mission-add-bundle-btn').first()
    await expect(bundleBtn).toBeVisible()
    await bundleBtn.click()

    // The selected routine contains two sample products.
    await page.goto('/cart')
    await expect(page.locator('.cart-item')).toHaveCount(2)
  })
})
