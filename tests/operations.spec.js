import { test, expect } from '@playwright/test'

test('checkout creates shared demo seller orders and opens buyer tracking', async ({ page }) => {
  await page.goto('/product/1')
  await page.locator('.product-purchase-row').getByRole('button', { name: 'Add to cart', exact: true }).click()
  await page.goto('/product/2')
  await page.locator('.product-purchase-row').getByRole('button', { name: 'Add to cart', exact: true }).click()
  await page.goto('/cart')
  await page.getByRole('link', { name: /Continue to checkout/ }).click()
  await expect(page).toHaveURL(/\/checkout$/)
  await page.getByRole('button', { name: 'Review order' }).click()
  expect(await page.locator('.checkout-form').evaluate(form => form.checkValidity())).toBe(false)
  await page.getByRole('textbox', { name: 'Full name' }).fill('Demo Customer')
  await page.getByRole('textbox', { name: 'Phone number' }).fill('+216 20 000 000')
  await page.getByRole('textbox', { name: 'City' }).fill('Tunis')
  await page.getByRole('textbox', { name: 'Delivery address' }).fill('10 Demo Street')
  await page.getByRole('button', { name: 'Review order' }).click()
  await expect(page.getByRole('heading', { name: 'Review before proceeding' })).toBeVisible()
  await expect(page.locator('.checkout-seller-review')).toHaveCount(2)
  await expect(page.locator('.checkout-summary')).toContainText('268.000 TND')
  await page.getByRole('button', { name: 'Place demo order' }).click()
  await expect(page).toHaveURL(new RegExp('/orders/MC-'))
  await expect(page.getByRole('heading', { name: /Track MC-/ })).toBeVisible()
  await expect(page.locator('.buyer-tracking-panel')).toContainText('Demo Customer')
  const trackingPath = new URL(page.url()).pathname
  const orderId = trackingPath.split('/').pop()
  await page.goto('/account')
  await expect(page.locator('.account-demo-order[href="' + trackingPath + '"]')).toHaveCount(1)
  await page.goto('/seller-dashboard')
  await page.getByRole('button', { name: 'Orders' }).click()
  await expect(page.locator('.seller-order-row').filter({ hasText: 'Demo Customer' })).toHaveCount(1)
  await page.goto('/operations/delivery')
  const deliveryOrder = page.locator('.ops-table tbody tr').filter({ hasText: orderId })
  await expect(deliveryOrder).toContainText('Demo Customer')
  await deliveryOrder.getByLabel('Status for ' + orderId).selectOption('In transit')
  await page.goto('/admin')
  await expect(page.locator('.ops-table tbody tr').filter({ hasText: orderId })).toContainText('In transit')
  await page.goto(trackingPath)
  await expect(page.locator('.buyer-tracking-panel')).toContainText('In transit')
  await page.goto('/cart')
  await expect(page.locator('.cart-empty-state')).toBeVisible()
})


test('delivery operations and platform admin share order status and courier changes', async ({ page }) => {
  await page.goto('/operations/delivery')
  await expect(page.getByRole('heading', { name: 'Delivery operations' })).toBeVisible()
  const orderRow = page.locator('.ops-table tbody tr').filter({ hasText: 'MC-1048' })
  await expect(orderRow).toContainText('Atlas Tech')
  await orderRow.getByLabel('Courier for MC-1048').selectOption('Partner courier')
  await orderRow.getByLabel('Status for MC-1048').selectOption('In transit')
  await page.getByRole('link', { name: 'Platform admin' }).click()
  const adminRow = page.locator('.ops-table tbody tr').filter({ hasText: 'MC-1048' })
  await expect(adminRow).toContainText('In transit')
  await adminRow.getByLabel('Status for MC-1048').selectOption('Delivered')
  await page.getByRole('link', { name: 'Delivery operations', exact: true }).click()
  await page.getByRole('button', { name: 'All', exact: true }).click()
  await expect(page.locator('.ops-table tbody tr').filter({ hasText: 'MC-1048' })).toContainText('Delivered')
})


test('merchant order workspace shares order updates with delivery operations', async ({ page }) => {
  await page.goto('/seller-dashboard')
  await page.getByRole('button', { name: 'Orders' }).click()
  const order = page.locator('.seller-order-row').filter({ hasText: 'MC-1048' })
  await expect(order).toContainText('Amira Ben Salem')
  await order.getByLabel('Update status for MC-1048').selectOption('Processing')
  await page.getByRole('link', { name: '↗ Delivery operations' }).click()
  const deliveryRow = page.locator('.ops-table tbody tr').filter({ hasText: 'MC-1048' })
  await expect(deliveryRow).toContainText('Processing')
})



test('buyer account can follow shared demo order status changes', async ({ page }) => {
  await page.goto('/account')
  await page.getByRole('link', { name: /MC-1048/ }).click()
  await expect(page.getByRole('heading', { name: 'Track MC-1048' })).toBeVisible()
  await expect(page.locator('.buyer-tracking-panel')).toContainText('Ready for pickup')
  await page.getByRole('link', { name: 'Delivery operations', exact: true }).click()
  const deliveryRow = page.locator('.ops-table tbody tr').filter({ hasText: 'MC-1048' })
  await deliveryRow.getByLabel('Status for MC-1048').selectOption('In transit')
  await page.getByRole('link', { name: 'Buyer marketplace' }).click()
  await page.goto('/orders/MC-1048')
  await expect(page.locator('.buyer-tracking-panel')).toContainText('In transit')
})



test('connected operations workspaces respect French and Arabic interface language', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('marchy-language', 'fr'))
  await page.goto('/operations/delivery')
  await expect(page.getByRole('heading', { name: 'Opérations de livraison' })).toBeVisible()
  await page.locator('.language-picker select').selectOption('ar')
  await expect(page.getByRole('heading', { name: 'عمليات التوصيل' })).toBeVisible()
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
})



test('buyer order history searches, filters and opens tracking', async ({ page }) => {
  await page.goto('/orders')
  await expect(page.getByRole('heading', { name: 'Your orders' })).toBeVisible()
  await expect(page.locator('.buyer-order-card')).toHaveCount(5)
  await page.getByLabel('Search orders').fill('Amira')
  await expect(page.locator('.buyer-order-card')).toHaveCount(1)
  await expect(page.locator('.buyer-order-card')).toContainText('MC-1048')
  await page.getByLabel('Search orders').fill('')
  await page.getByLabel('Order status').selectOption('Delivered')
  await expect(page.locator('.buyer-order-card')).toHaveCount(1)
  await page.getByRole('link', { name: 'Track order' }).click()
  await expect(page.getByRole('heading', { name: 'Track MC-1046' })).toBeVisible()
})



test('buyer order history respects French and Arabic interface language', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('marchy-language', 'fr'))
  await page.goto('/orders')
  await expect(page.getByRole('heading', { name: 'Vos commandes' })).toBeVisible()
  await page.locator('.language-picker select').selectOption('ar')
  await expect(page.getByRole('heading', { name: 'طلباتك' })).toBeVisible()
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
})


