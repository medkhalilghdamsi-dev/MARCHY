import { test, expect } from '@playwright/test'

test.describe('Purchase Journey & Progressive Checkout', () => {
  test('Complete 4-step progressive checkout and order confirmation', async ({ page }) => {
    // Add product to cart
    await page.goto('/product/1')
    await page.locator('.product-purchase-row').getByRole('button', { name: 'Add to cart', exact: true }).click()
    
    // Visit cart
    await page.goto('/cart')
    await expect(page.locator('.cart-item')).toBeVisible()
    
    // Proceed to progressive checkout
    const checkoutBtn = page.locator('.cart-checkout-button')
    await expect(checkoutBtn).toBeVisible()
    await checkoutBtn.click()

    // Step 1: Address
    await expect(page).toHaveURL(/\/checkout$/)
    await expect(page.getByRole('heading', { name: /Where should the order be delivered/i })).toBeVisible()
    await page.fill('#checkout-full-name', 'Khalil Test')
    await page.fill('#checkout-phone', '+216 98 765 432')
    await page.fill('#checkout-address', 'Avenue Habib Bourguiba, Tunis')
    await page.getByRole('button', { name: /Continue to shipping method/i }).click()

    // Step 2: Shipping
    await expect(page).toHaveURL(/\/checkout\/delivery/)
    await expect(page.getByRole('heading', { name: /Choose your shipping method/i })).toBeVisible()
    await page.getByRole('button', { name: /Continue to payment/i }).click()

    // Step 3: Payment
    await expect(page).toHaveURL(/\/checkout\/payment/)
    await expect(page.getByRole('heading', { name: /Choose how you want to pay/i })).toBeVisible()
    await page.getByRole('button', { name: /Review your order/i }).click()

    // Step 4: Review
    await expect(page).toHaveURL(/\/checkout\/review/)
    await expect(page.getByRole('heading', { name: /Review and confirm your order/i })).toBeVisible()
    await expect(page.locator('.checkout-seller-review')).toBeVisible()

    // Place order
    await page.getByRole('button', { name: /Place demo order/i }).click()

    // Order Confirmation
    await expect(page).toHaveURL(/\/order-confirmation\/MC-/)
    await expect(page.getByRole('heading', { name: /Thank you for your order/i })).toBeVisible()
    await expect(page.locator('.cod-badge')).toBeVisible()
    await expect(page.getByText(/no seller or courier has been contacted/i)).toBeVisible()
    await expect(page.locator('.confirmation-summary-card .payment-method-pill small')).toContainText(/no payment is collected/i)
    await expect(page.getByText(/estimated delivery: 24.?48 hours/i)).toHaveCount(0)

    await page.getByRole('link', { name: /View demo order status/i }).click()
    await expect(page).toHaveURL(/\/orders\/MC-/)
    await expect(page.getByText(/Courier scans, seller messaging and delivery estimates are not connected/i)).toBeVisible()
    await expect(page.getByText(/No payment, parcel inspection service or buyer protection is active/i)).toBeVisible()
    await expect(page.locator('.invoice-printable')).toContainText(/This summary is not a tax invoice, payment receipt or delivery confirmation/i)
  })
})


test('unknown confirmation reference never displays another order', async ({ page }) => {
  await page.goto('/order-confirmation/MC-DOES-NOT-EXIST')
  await expect(page.getByRole('heading', { name: /No order found/i })).toBeVisible()
  await expect(page.getByText(/Thank you for your order/i)).toHaveCount(0)
})


test('mobile Arabic checkout address stays within the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.addInitScript(() => localStorage.setItem('marchy-language', 'ar'))
  await page.goto('/product/1')
  await expect(page.locator('.product-mobile-buybar')).toBeVisible()
  await page.locator('.mobile-buybar-actions').getByRole('button', { name: 'Add to cart' }).click()
  await page.goto('/checkout')
  await expect(page).toHaveURL(/\/checkout$/)
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
  await expect(page.locator('.app-root')).toHaveAttribute('dir', 'rtl')
  const layout = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    document: document.documentElement.scrollWidth,
    panel: document.querySelector('.checkout-form')?.getBoundingClientRect().toJSON(),
  }))
  expect(layout.document).toBeLessThanOrEqual(layout.viewport + 1)
  expect(layout.panel).toBeTruthy()
  expect(layout.panel.x).toBeGreaterThanOrEqual(-1)
  expect(layout.panel.right).toBeLessThanOrEqual(layout.viewport + 1)
})
