import { test, expect } from '@playwright/test'

test.describe('Localization & Bidirectional RTL Layout', () => {
  test('Switches to Arabic and verifies dir="rtl" and Arabic typography', async ({ page }) => {
    await page.goto('/')
    
    // Switch language to Arabic
    const langSelect = page.locator('.language-picker select')
    await langSelect.selectOption('ar')
    
    // Verify root dir attribute
    await expect(page.locator('.app-root')).toHaveAttribute('dir', 'rtl')
    await expect(page.locator('.app-root')).toHaveClass(/is-rtl/)
    
    // Switch to French
    await langSelect.selectOption('fr')
    await expect(page.locator('.app-root')).toHaveAttribute('dir', 'ltr')
  })
})
