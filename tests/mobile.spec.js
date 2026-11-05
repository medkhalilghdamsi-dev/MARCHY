import { test, expect } from '@playwright/test'

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


test('mobile product purchase bar stays clear of the persistent navigation', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/product/1')
  const buybar = page.locator('.product-mobile-buybar')
  const tabbar = page.locator('.mobile-tabbar')
  await expect(buybar).toBeVisible()
  await expect(tabbar).toBeVisible()
  const buybarBox = await buybar.boundingBox()
  const tabbarBox = await tabbar.boundingBox()
  expect(buybarBox).not.toBeNull()
  expect(tabbarBox).not.toBeNull()
  expect(buybarBox.y + buybarBox.height).toBeLessThan(tabbarBox.y)
  await buybar.getByRole('button', { name: /Add to cart/ }).click()
  await expect(page.locator('.product-added-feedback')).toBeVisible()
})



test('mobile marketplace filters open as an accessible sheet and apply budget presets', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/search')
  const trigger = page.getByRole('button', { name: /Filters/ })
  await expect(trigger).toBeVisible()
  await trigger.click()
  const sheet = page.getByRole('dialog', { name: 'Filters' })
  await expect(sheet).toBeVisible()
  await expect(page.locator('body')).toHaveCSS('overflow', 'hidden')
  await sheet.getByRole('button', { name: 'Under 100 TND' }).click()
  await expect(sheet).toContainText('matching products')
  await sheet.getByRole('button', { name: /Show \d+ products/ }).click()
  await expect(sheet).toBeHidden()
  await expect(page).toHaveURL(/max=100/)
  await expect(page.getByText('Up to 100 TND', { exact: false })).toBeVisible()
})


test('mobile marketplace filter sheet closes with Escape and backdrop', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/search')
  await page.getByRole('button', { name: /Filters/ }).click()
  await expect(page.getByRole('dialog', { name: 'Filters' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog', { name: 'Filters' })).toBeHidden()
  await page.getByRole('button', { name: /Filters/ }).click()
  await page.getByRole('button', { name: 'Close filters', exact: true }).last().click()
  await expect(page.getByRole('dialog', { name: 'Filters' })).toBeHidden()
})



test('mobile filter sheet manages keyboard focus and returns it to its trigger', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/search')
  const trigger = page.getByRole('button', { name: /Filters/ })
  await trigger.click()
  const close = page.getByRole('button', { name: 'Close filters', exact: true }).last()
  await expect(close).toBeFocused()
  await page.keyboard.press('Shift+Tab')
  await expect(page.getByRole('button', { name: /Show \d+ products/ })).toBeFocused()
  await page.getByRole('button', { name: /Show \d+ products/ }).click()
  await expect(trigger).toBeFocused()
})



test('mobile product purchase bar quantity stays in sync with the main purchase controls', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/product/1')
  await page.locator('.mobile-buybar-quantity').getByRole('button', { name: 'Increase quantity' }).click()
  await expect(page.locator('.mobile-buybar-total')).toContainText('378.000 TND')
  await page.locator('.mobile-buybar-actions').getByRole('button', { name: 'Add to cart' }).click()
  await expect(page.locator('.product-added-feedback')).toContainText('Added to your demo cart')
})


