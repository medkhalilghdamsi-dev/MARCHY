import { test, expect } from '@playwright/test'

test.describe('Mobile Viewport & Bottom Navigation Bar', () => {
  test('Renders bottom mobile tab bar on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')
    
    // Bottom mobile tab bar is visible
    const mobileTabBar = page.locator('.mobile-tabbar')
    await expect(mobileTabBar).toBeVisible()
    
    // Check navigation tab icons
    await expect(mobileTabBar.getByRole('link', { name: /Home/i })).toBeVisible()
    await expect(mobileTabBar.getByRole('link', { name: /Cart/i })).toBeVisible()
  })
})
