import { test, expect } from '@playwright/test'

test('product quantity, cart updates and wishlist persist across routes', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/product/1')
  await page.getByRole('group', { name: 'Quantity', exact: true }).getByRole('button', { name: 'Increase quantity' }).click()
  await expect(page.getByRole('group', { name: 'Quantity', exact: true }).getByRole('status', { name: 'Selected quantity' })).toHaveText('2')
  await page.locator('.product-purchase-row').getByRole('button', { name: 'Add to cart', exact: true }).click()
  await expect(page.locator('.product-added-feedback')).toContainText('Added to your demo cart')
  await page.locator('.mobile-tabbar a[href="/cart"]').click()
  await expect(page.getByRole('heading', { name: 'Your shopping cart' })).toBeVisible()
  await expect(page.getByText('2 items', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Increase Wireless noise-cancelling headphones quantity' }).click()
  await expect(page.locator('.cart-item-quantity output')).toHaveText('3')
  await page.goto('/product/1')
  await page.getByRole('button', { name: 'Save for later' }).click()
  await page.goto('/wishlist')
  await expect(page.locator('.wishlist-product-grid')).toContainText('Wireless noise-cancelling headphones')
})


test('product comparisons persist when navigating away and returning', async ({ page }) => {
  await page.goto('/search')
  const cards = page.locator('.product-card')
  await cards.nth(0).getByRole('button', { name: /Compare/ }).click()
  await cards.nth(1).getByRole('button', { name: /Compare/ }).click()
  await expect(page.getByRole('region', { name: 'Product comparison' })).toBeVisible()
  await page.goto('/product/1')
  await page.goto('/search')
  await expect(page.getByRole('region', { name: 'Product comparison' })).toContainText('2 of 3 selected')
})


test('product grid and list preferences persist across marketplace navigation', async ({ page }) => {
  await page.goto('/search')
  await page.getByRole('button', { name: 'List view' }).click()
  await expect(page.locator('.listing-results .product-grid')).toHaveClass(/product-list-view/)
  await expect(page.getByRole('button', { name: 'List view' })).toHaveAttribute('aria-pressed', 'true')
  await page.goto('/product/1')
  await page.goto('/search')
  await expect(page.locator('.listing-results .product-grid')).toHaveClass(/product-list-view/)
  await page.getByRole('button', { name: 'Grid view' }).click()
  await expect(page.locator('.listing-results .product-grid')).not.toHaveClass(/product-list-view/)
})


test('homepage hero search submits queries and popular shortcuts navigate to search', async ({ page }) => {
  await page.goto('/')
  const heroSearch = page.getByRole('search').getByRole('searchbox', { name: 'Search products and categories' })
  await heroSearch.fill('headphones')
  await page.locator('.hero-search-form').getByRole('button', { name: /Search/ }).click()
  await expect(page).toHaveURL(/\/search\?q=headphones/)
  await expect(page.locator('.listing-results')).toContainText('headphones')
  await page.goto('/')
  await page.locator('.hero-trending').getByRole('button', { name: 'Fashion' }).click()
  await expect(page).toHaveURL(/\/search\?q=Fashion/)
})


test('recently viewed products appear on the homepage', async ({ page }) => {
  await page.goto('/product/1')
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Recently viewed' })).toBeVisible()
  await expect(page.locator('.home-recently-viewed')).toContainText('Wireless noise-cancelling headphones')
})



test('clearing marketplace filters also restores featured sorting', async ({ page }) => {
  await page.goto('/search?q=headphones')
  await page.getByLabel('Sort products').selectOption('price-low')
  await page.getByLabel('Minimum price in TND').fill('30')
  await page.locator('.active-filter-chips .clear-filter-chips').click()
  await expect(page.getByLabel('Sort products')).toHaveValue('featured')
  await expect(page.getByLabel('Minimum price in TND')).toHaveValue('0')
  await expect(page).not.toHaveURL(/sort=/)
  await expect(page).not.toHaveURL(/min=/)
  await expect(page).not.toHaveURL(/q=/)
})



test('marketplace search autocomplete offers category and no-match guidance', async ({ page }) => {
  await page.goto('/search')
  const search = page.getByRole('combobox', { name: 'Search marketplace' })
  await search.fill('Electronics')
  await expect(page.locator('.search-suggestion-group').filter({ hasText: 'Categories' })).toContainText('Electronics')
  await page.locator('.search-suggestion-group button').filter({ hasText: 'Electronics' }).click()
  await expect(page).toHaveURL(/\/category\/electronics/)
  await page.goto('/search')
  await page.getByRole('combobox', { name: 'Search marketplace' }).fill('zzqv-no-match')
  await expect(page.locator('.search-suggestions-empty')).toBeVisible()
})



test('marketplace search autocomplete suggests products and opens the selected product', async ({ page }) => {
  await page.goto('/search')
  const search = page.getByRole('combobox', { name: 'Search marketplace' })
  await search.fill('headphones')
  await expect(page.locator('.search-suggestions')).toBeVisible()
  await expect(page.locator('.search-suggestion-product').first()).toContainText('headphones')
  await page.locator('.search-suggestion-product').first().click()
  await expect(page).toHaveURL(/\/product\//)
  await expect(page.locator('.product-buy-panel h1')).toContainText('headphones')
})



test('marketplace filters can be bookmarked and restored from the URL', async ({ page }) => {
  await page.goto('/search?q=headphones')
  await page.locator('input[name="marketplace-category"]').nth(1).check()
  await page.getByLabel('Seller location').selectOption({ index: 1 })
  await page.getByLabel('Minimum price in TND').fill('30')
  await page.getByLabel('Maximum price in TND').fill('200')
  await page.getByLabel('Sort products').selectOption('price-high')
  await expect(page).toHaveURL(/q=headphones/)
  await expect(page).toHaveURL(/category=Electronics/)
  await expect(page).toHaveURL(/city=/)
  await expect(page).toHaveURL(/min=30/)
  await expect(page).toHaveURL(/max=200/)
  await expect(page).toHaveURL(/sort=price-high/)
  const savedUrl = page.url()
  await page.reload()
  await expect(page.locator('input[name="marketplace-category"]').nth(1)).toBeChecked()
  await expect(page.getByLabel('Seller location')).not.toHaveValue('All')
  await expect(page.getByLabel('Minimum price in TND')).toHaveValue('30')
  await expect(page.getByLabel('Maximum price in TND')).toHaveValue('200')
  await expect(page.getByLabel('Sort products')).toHaveValue('price-high')
  expect(page.url()).toBe(savedUrl)
})



test('cart groups products by seller and keeps each seller subtotal visible', async ({ page }) => {
  await page.goto('/product/1')
  await page.locator('.product-purchase-row').getByRole('button', { name: 'Add to cart', exact: true }).click()
  await page.goto('/product/2')
  await page.locator('.product-purchase-row').getByRole('button', { name: 'Add to cart', exact: true }).click()
  await page.goto('/cart')
  const sellerGroups = page.locator('.cart-seller-group')
  await expect(sellerGroups).toHaveCount(2)
  await expect(sellerGroups.nth(0)).toContainText('Atlas Tech')
  await expect(sellerGroups.nth(0)).toContainText('189.000 TND')
  await expect(sellerGroups.nth(1)).toContainText('Maison & Co')
  await expect(sellerGroups.nth(1)).toContainText('79.000 TND')
  await expect(page.locator('.cart-summary')).toContainText('268.000 TND')
})



test('customer account shows and clears recently viewed products', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('marchy-recently-viewed', JSON.stringify([1, 2])))
  await page.goto('/account')
  await expect(page.locator('.account-recently-viewed')).toBeVisible()
  await expect(page.locator('.account-recent-grid')).toContainText('Wireless noise-cancelling headphones')
  await page.getByRole('button', { name: 'Clear history' }).click()
  await expect(page.locator('.account-recently-viewed')).toHaveCount(0)
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('marchy-recently-viewed')))).toEqual([])
})


test('MARCHY uses the locked forest-green brand accent across buyer touchpoints', async ({ page }) => {
  await page.goto('/')
  const tokens = await page.evaluate(() => {
    const root = getComputedStyle(document.documentElement)
    const searchButton = getComputedStyle(document.querySelector('.searchbar button'))
    return {
      orangeAlias: root.getPropertyValue('--orange').trim(),
      greenToken: root.getPropertyValue('--green').trim(),
      marchyAccent: root.getPropertyValue('--marchy-orange').trim(),
      searchButton: searchButton.backgroundColor,
    }
  })
  expect(tokens.orangeAlias).toBe('#1f5b45')
  expect(tokens.greenToken).toBe('#1f5b45')
  expect(tokens.marchyAccent).toBe('#1f5b45')
  expect(tokens.searchButton).toBe('rgb(23, 71, 53)')
  await page.locator('.searchbar input').focus()
  await expect(page.locator('.searchbar')).toHaveCSS('border-color', 'rgb(120, 165, 140)')
})
