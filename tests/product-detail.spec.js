import { test, expect } from '@playwright/test'

test('product detail can add a listing to the cross-page comparison tray', async ({ page }) => {
  await page.goto('/product/1')
  await page.getByRole('button', { name: '＋ Compare' }).click()
  await expect(page.getByRole('status').filter({ hasText: 'Added to comparison' })).toBeVisible()
  await page.getByRole('link', { name: 'Open comparison' }).click()
  await expect(page).toHaveURL(/\/search$/)
  await expect(page.locator('.compare-tray')).toContainText('1 of 3 selected')
  await expect(page.locator('.compare-tray')).toContainText('Wireless noise-cancelling headphones')
})


test('product detail buyer checklist adapts to listing category', async ({ page }) => {
  await page.goto('/product/1')
  await expect(page.locator('.product-order-checklist')).toContainText('Exact model, technical specifications and compatibility')
  await expect(page.locator('.product-order-checklist')).toContainText('Warranty coverage and proof of purchase')
  await page.goto('/product/3')
  await expect(page.locator('.product-order-checklist')).toContainText('Size measurements, fit and available variants')
  await expect(page.locator('.product-order-checklist')).toContainText('Material composition and care instructions')
})


test('product comparison button reflects the current product after related-item navigation', async ({ page }) => {
  await page.goto('/product/1')
  await page.getByRole('button', { name: '＋ Compare' }).click()
  await page.locator('.related-products .product-card a').first().click()
  await expect(page).toHaveURL(/\/product\//)
  await expect(page.getByRole('button', { name: '＋ Compare' })).toHaveAttribute('aria-pressed', 'false')
})


test('product page can copy a shareable listing link', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.addInitScript(() => Object.defineProperty(navigator, 'share', { configurable: true, value: undefined }))
  await page.goto('/product/1')
  await page.getByRole('button', { name: /Share/ }).click()
  await expect(page.getByRole('status').filter({ hasText: 'Listing link copied' })).toBeVisible()
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('/product/1')
})


test('product detail gallery exposes selected thumbnails and keeps honest single-image fallback', async ({ page }) => {
  await page.goto('/product/1')
  await expect(page.locator('.product-gallery-thumbnails button')).toHaveCount(1)
  await expect(page.locator('.product-gallery-thumbnails button')).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('.product-image-caption')).toContainText('Only one catalogue image has been supplied')
  await page.getByRole('button', { name: 'Enlarge product image' }).click()
  await expect(page.getByRole('dialog', { name: /Image preview/ })).toBeVisible()
  await expect(page.getByRole('dialog').locator('img')).toBeVisible()
})


test('product detail makes seller verification and delivery unknowns explicit', async ({ page }) => {
  await page.goto('/product/1')
  await expect(page.getByRole('region', { name: 'Seller information' })).toContainText('Atlas Tech')
  await expect(page.getByRole('region', { name: 'Buyer confidence information' })).toContainText('Not independently verified')
  await expect(page.getByRole('region', { name: 'Delivery and availability' })).toContainText('Delivery fee: not provided')
  await expect(page.getByRole('region', { name: 'Delivery and availability' })).toContainText('Estimated arrival: not provided')
})

