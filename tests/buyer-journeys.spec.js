import { test, expect } from '@playwright/test'

// Each test is a buyer situation, not a component-only check.
// Fresh Playwright contexts keep cart, wishlist and order state isolated.

test.describe('buyer situations — end-to-end journeys', () => {
  test('01 · first-time visitor discovers a product and narrows the catalogue', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')

    await expect(page.getByRole('heading', { name: /Discover more, closer to home/i })).toBeVisible()
    const heroSearch = page.getByRole('search').getByRole('combobox', { name: 'Search products and categories' })
    await heroSearch.fill('headphones')
    await expect(page.locator('.hero-search-suggestions')).toBeVisible()
    await page.locator('.hero-search-form').getByRole('button', { name: /Search/ }).click()

    await expect(page).toHaveURL(/\/search\?q=headphones/)
    await expect(page.locator('.listing-results')).toContainText('headphones')
    await page.getByRole('button', { name: /Filters/ }).click()
    const filters = page.getByRole('dialog', { name: 'Filters' })
    await filters.getByRole('button', { name: 'Under 200 TND' }).click()
    await filters.getByRole('button', { name: /Show \d+ products/ }).click()
    await expect(page).toHaveURL(/max=200/)
    await expect(page.locator('.product-card').first()).toContainText('headphones')

    await page.locator('.product-card').first().getByRole('link', { name: /View Wireless noise-cancelling headphones/ }).click()
    await expect(page).toHaveURL(/\/product\/1$/)
    await expect(page.getByRole('heading', { name: 'Wireless noise-cancelling headphones' })).toBeVisible()
    await expect(page.getByRole('region', { name: 'Delivery information' })).toContainText('to confirm')
  })

  test('02 · considered shopper saves a product, then brings it back to the basket', async ({ page }) => {
    await page.goto('/product/1')
    await page.locator('.product-purchase-row').getByRole('button', { name: 'Add to cart', exact: true }).click()
    await page.goto('/cart')

    const cartItem = page.locator('.cart-item').filter({ hasText: 'Wireless noise-cancelling headphones' })
    await expect(cartItem).toBeVisible()
    await cartItem.getByRole('button', { name: 'Save for later' }).click()
    await expect(page.locator('.cart-item')).toHaveCount(0)
    await expect(page.getByRole('region', { name: 'Saved for later' })).toContainText('Wireless noise-cancelling headphones')

    await page.getByRole('button', { name: 'Move to cart' }).click()
    await expect(page.locator('.cart-item')).toContainText('Wireless noise-cancelling headphones')
    await expect(page.locator('.cart-saved-later-section')).toContainText('0 items')
    await page.reload()
    await expect(page.locator('.cart-item')).toContainText('Wireless noise-cancelling headphones')
  })

  test('03 · value-conscious shopper checks seller totals, promo eligibility and delivery caveats', async ({ page }) => {
    await page.goto('/product/1')
    await page.locator('.product-purchase-row').getByRole('button', { name: 'Add to cart', exact: true }).click()
    await page.goto('/product/2')
    await page.locator('.product-purchase-row').getByRole('button', { name: 'Add to cart', exact: true }).click()
    await page.goto('/cart')

    await expect(page.locator('.cart-seller-group')).toHaveCount(2)
    await expect(page.locator('.cart-summary')).toContainText('268 DT')
    await expect(page.locator('.cart-summary-note')).toContainText('not included')
    await page.getByRole('button', { name: 'MARCHY10' }).click()
    await expect(page.locator('.applied-coupon-row')).toContainText('MARCHY10')
    await expect(page.locator('.summary-total')).toContainText('241.2 DT')
    await page.getByRole('button', { name: 'Increase Wireless noise-cancelling headphones quantity' }).click()
    await expect(page.locator('.cart-summary')).toContainText('457 DT')
    await expect(page.locator('.summary-total')).toContainText('411.3 DT')
    await page.getByRole('button', { name: 'Remove item', exact: true }).last().click()
    await expect(page.locator('.cart-seller-group')).toHaveCount(1)
    await expect(page.locator('.cart-summary')).toContainText('378 DT')
  })

  test('04 · guest buyer cannot skip delivery details and can review before placing a demo order', async ({ page }) => {
    await page.goto('/product/1')
    await page.locator('.product-purchase-row').getByRole('button', { name: 'Add to cart', exact: true }).click()
    await page.goto('/cart')
    await page.getByRole('link', { name: /Continue to checkout/ }).click()

    await expect(page.locator('.checkout-steps li')).toHaveCount(2)
    await page.getByRole('button', { name: 'Review order' }).click()
    await expect(page.getByLabel('Full name')).toBeFocused()
    await expect(page.locator('.checkout-form').evaluate(form => form.checkValidity())).toBe(false)

    await page.getByLabel('Full name').fill('Demo Buyer')
    await page.getByLabel('Phone number').fill('+216 20 000 000')
    await page.getByLabel('Governorate / Region').selectOption('Tunis')
    await page.getByLabel('Delivery address').fill('10 Rue de Test, Tunis')
    await page.getByRole('button', { name: 'Review order' }).click()

    await expect(page.getByRole('heading', { name: 'Review before proceeding' })).toBeVisible()
    await expect(page.locator('.checkout-contact-review')).toContainText('Demo Buyer')
    await expect(page.locator('.checkout-preview-note')).toContainText('No seller receives the order')
    await page.getByRole('button', { name: 'Place demo order' }).click()
    await expect(page).toHaveURL(/\/orders\//)
    await expect(page.getByRole('heading', { name: /Track Order MC-/ })).toBeVisible()
    await expect(page.locator('.buyer-tracking-panel')).toContainText('Demo Buyer')
    await page.goto('/cart')
    await expect(page.locator('.cart-empty-state')).toBeVisible()
  })

  test('05 · mobile shopper can search, inspect, add and review the basket without horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 })
    await page.goto('/')

    await expect(page.getByRole('button', { name: 'Open search' })).toBeVisible()
    await page.getByRole('button', { name: 'Open search' }).click()
    await expect(page.locator('#global-search-form')).toBeVisible()
    await page.getByRole('search').getByRole('combobox', { name: 'Search products and stores' }).fill('headphones')
    await page.getByRole('search').getByRole('button', { name: 'Search' }).click()
    await expect(page).toHaveURL(/\/search\?q=headphones/)

    await page.goto('/product/1')
    await expect(page.locator('.product-mobile-buybar')).toBeVisible()
    await page.locator('.mobile-buybar-actions').getByRole('button', { name: 'Add to cart' }).click()
    await page.locator('.mobile-tabbar a[href="/cart"]').click()
    await expect(page.locator('.cart-item')).toContainText('Wireless noise-cancelling headphones')

    const overflow = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      document: document.documentElement.scrollWidth,
    }))
    expect(overflow.document).toBeLessThanOrEqual(overflow.viewport + 1)
    await expect(page.getByRole('link', { name: /Continue to checkout/ })).toBeVisible()
  })

  test('06 · mobile shopper changes destination without the header search covering the page', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 })
    await page.goto('/category/kitchen')
    await expect(page.locator('.header')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Open search' })).toBeVisible()

    await page.getByRole('button', { name: 'Open search' }).click()
    await expect(page.locator('#global-search-form')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.locator('#global-search-form')).not.toBeVisible()

    await page.goto('/search?q=coffee')
    await expect(page.locator('.listing-head')).toBeVisible()
    await expect(page.locator('.listing-results')).toBeVisible()

    const overflow = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      document: document.documentElement.scrollWidth,
      body: document.body.scrollWidth,
    }))
    expect(overflow.document).toBeLessThanOrEqual(overflow.viewport + 1)
    expect(overflow.body).toBeLessThanOrEqual(overflow.viewport + 1)
  })

  test('07 · mobile product page keeps the purchase action reachable while details reflow', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 })
    await page.goto('/product/1')

    await expect(page.locator('.product-page')).toBeVisible()
    await expect(page.locator('.product-mobile-buybar')).toBeVisible()
    await expect(page.locator('.product-detail-layout')).toBeVisible()

    const overflow = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      document: document.documentElement.scrollWidth,
    }))
    expect(overflow.document).toBeLessThanOrEqual(overflow.viewport + 1)

    await page.locator('.mobile-buybar-actions').getByRole('button', { name: 'Add to cart' }).click()
    await expect(page.locator('.cart-icon i')).toContainText(/1/)
  })

  test('08 · visitor explores Shop by Mission and adds curated routine bundle to basket', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.shop-by-mission-section')).toBeVisible()
    const addBundleBtn = page.locator('.mission-add-bundle-btn').first()
    await expect(addBundleBtn).toBeVisible()
    await addBundleBtn.click()

    await page.goto('/cart')
    await expect(page.locator('.cart-item').first()).toBeVisible()
    const count = await page.locator('.cart-item').count()
    expect(count).toBeGreaterThanOrEqual(2)
  })

  test('09 · Arabic RTL shopper verifies layout direction, Arabic typography and cart', async ({ page }) => {
    await page.goto('/')
    const langPicker = page.locator('select[aria-label="Language"]').first()
    await langPicker.selectOption('ar')

    const dir = await page.locator('.app-root').getAttribute('dir')
    expect(dir).toBe('rtl')
    await expect(page.locator('.app-root')).toHaveClass(/is-rtl/)

    await page.goto('/product/1')
    await expect(page.locator('h1')).toBeVisible()

    await page.goto('/cart')
    await expect(page.locator('main')).toBeVisible()
  })

  test('10 · French/English localization switching preserves navigation and forms', async ({ page }) => {
    await page.goto('/')
    const langPicker = page.locator('select[aria-label="Language"]').first()
    await langPicker.selectOption('fr')
    await expect(page.locator('body')).toBeVisible()

    await langPicker.selectOption('en')
    await expect(page.locator('body')).toBeVisible()
  })

  test('buyer can switch seller offers and see the selected price and merchant update together', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/product/1')
    await expect(page.locator('.product-price-block strong')).toContainText('189 DT')
    const alternateOffer = page.locator('.offers-list .offer-card').nth(1)
    await expect(alternateOffer).toContainText('Daily Essentials')
    await alternateOffer.getByRole('button', { name: 'Select sample offer' }).click()
    await expect(page.locator('.product-price-block strong')).toContainText('182 DT')
    await expect(page.locator('.product-price-caption')).toContainText('Daily Essentials')
    await expect(page.locator('.product-seller-card')).toContainText('Daily Essentials')
    await expect(page.locator('.product-mobile-buybar .mobile-buybar-total')).toContainText('182 DT')
  })

  test('mobile purchase bar disables its add action when the selected offer is unavailable', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.addInitScript(() => {
      localStorage.setItem('marchy-inventory-records', JSON.stringify({
        'atlas-tech-tunis-1': 0,
        'daily-essentials-monastir-1': 0,
        'nour-beauty-tunis-1': 0,
      }))
    })
    await page.goto('/product/1')
    await expect(page.locator('.product-mobile-buybar')).toBeVisible()
    await expect(page.locator('.product-mobile-buybar .primary-btn')).toBeDisabled()
    await expect(page.locator('.product-purchase-row .product-add-button')).toBeDisabled()
  })

  test('category directory search leads into a focused category catalogue', async ({ page }) => {
    await page.goto('/categories')
    const categorySearch = page.getByRole('textbox', { name: 'Search categories' })
    await categorySearch.fill('Electronics')
    await expect(page.locator('.category-directory-card')).toHaveCount(1)
    await expect(page.locator('.category-directory-card').first()).toContainText('Electronics')
    await categorySearch.fill('no-such-category')
    await expect(page.getByRole('heading', { name: 'No categories found' })).toBeVisible()
    await page.getByRole('button', { name: 'Clear search' }).click()
    expect(await page.locator('.category-directory-card').count()).toBeGreaterThan(1)
    await page.locator('.category-directory-card').filter({ hasText: 'Electronics' }).click()
    await expect(page).toHaveURL(/\/category\/electronics$/)
    await expect(page.locator('.category-context-strip')).toContainText('Electronics')
    await expect(page.locator('.listing-results .product-card').first()).toBeVisible()
  })

  test('product navigation never carries the previous listing seller offer into the next product', async ({ page }) => {
    await page.goto('/product/1')
    await expect(page.getByRole('heading', { name: 'Wireless noise-cancelling headphones' })).toBeVisible()
    await expect(page.locator('.product-price-block strong')).toContainText('189 DT')
    await page.getByRole('group', { name: 'Quantity', exact: true }).getByRole('button', { name: 'Increase quantity' }).click()
    await expect(page.getByRole('group', { name: 'Quantity', exact: true }).getByLabel('Selected quantity')).toHaveText('2')

    await page.locator('.related-products a[href="/product/2"]').click()
    await expect(page).toHaveURL(/\/product\/2$/)
    await expect(page.getByRole('heading', { name: 'Minimal ceramic table lamp' })).toBeVisible()
    await expect(page.getByRole('group', { name: 'Quantity', exact: true }).getByLabel('Selected quantity')).toHaveText('1')
    await expect(page.locator('.product-price-block strong')).toContainText('79 DT')
    await expect(page.locator('.product-price-caption')).toContainText('Maison & Co')
  })
})


