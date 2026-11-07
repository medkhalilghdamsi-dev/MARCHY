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
    await expect(page).toHaveURL(/\/checkout\/address/)
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
  })
})
