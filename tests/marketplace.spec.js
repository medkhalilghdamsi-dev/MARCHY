import { test, expect } from '@playwright/test'

const routes = [
  '/',
  '/search',
  '/category/electronics',
  '/product/1',
  '/cart',
  '/checkout',
  '/wishlist',
  '/categories',
  '/sellers',
  '/seller/atlas-tech-tunis',
  '/account',
  '/orders',
  '/orders/MC-1048',
  '/help',
  '/delivery',
  '/returns',
  '/seller-help',
  '/sell',
  '/seller-central',
  '/seller-dashboard',
  '/this-page-does-not-exist',
]

test('all public frontend routes render a page and a page-specific title', async ({ page }) => {
  for (const route of routes) {
    await page.goto(route)
    await expect(page.locator('main').first()).toBeVisible()
    await expect(page).toHaveTitle(/\| MARCHY$/)
  }
})

const responsiveRoutes = ['/', '/search', '/category/electronics', '/product/1', '/cart', '/checkout', '/wishlist', '/account', '/seller-central', '/seller-dashboard', '/operations/delivery']
const viewports = [
  { width: 360, height: 800 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1440, height: 900 },
]

for (const viewport of viewports) {
  test(`critical pages fit the viewport at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport)
    for (const route of responsiveRoutes) {
      await page.goto(route, { waitUntil: 'domcontentloaded' })
      await expect(page.locator('main').first()).toBeVisible()
      const dimensions = await page.evaluate(() => ({
        viewport: document.documentElement.clientWidth,
        innerWidth: window.innerWidth,
        document: document.documentElement.scrollWidth,
        bodyScrollWidth: document.body.scrollWidth,
        scrollers: Array.from(document.querySelectorAll('body *')).map(element => {
          const style = getComputedStyle(element)
          return {
            tag: element.tagName.toLowerCase(),
            className: typeof element.className === 'string' ? element.className : '',
            clientWidth: element.clientWidth,
            scrollWidth: element.scrollWidth,
            overflowX: style.overflowX,
          }
        }).filter(element => element.scrollWidth > element.clientWidth + 1).slice(0, 15),
        offenders: Array.from(document.querySelectorAll('body *')).map(element => {
          const rect = element.getBoundingClientRect()
          return {
            tag: element.tagName.toLowerCase(),
            className: typeof element.className === 'string' ? element.className : '',
            left: Math.round(rect.left),
            right: Math.round(rect.right),
            width: Math.round(rect.width),
          }
        }).filter(element => element.width > 0 && (element.left < -1 || element.right > document.documentElement.clientWidth + 1)).slice(0, 12),
      }))
      expect(
        dimensions.document,
        `Unexpected horizontal page overflow on ${route}: ${JSON.stringify(dimensions)}`,
      ).toBeLessThanOrEqual(dimensions.viewport + 1)
    }
  })
}

test('Arabic RTL layout remains within the viewport on key marketplace routes', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('marchy-language', 'ar'))
  for (const width of [360, 390, 768]) {
    await page.setViewportSize({ width, height: 844 })
    for (const route of ['/search', '/product/1', '/cart', '/checkout', '/account', '/seller-central', '/seller-dashboard']) {
      await page.goto(route, { waitUntil: 'domcontentloaded' })
      await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
      const dimensions = await page.evaluate(() => ({
        viewport: document.documentElement.clientWidth,
        document: document.documentElement.scrollWidth,
      }))
      expect(dimensions.document, `Unexpected Arabic RTL overflow on ${route} at ${width}px: ${JSON.stringify(dimensions)}`).toBeLessThanOrEqual(dimensions.viewport + 1)
    }
  }
})

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

test('product quantity, cart updates and wishlist persist across routes', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/product/1')
  await page.getByRole('group', { name: 'Quantity', exact: true }).getByRole('button', { name: 'Increase quantity' }).click()
  await expect(page.getByRole('group', { name: 'Quantity', exact: true }).getByLabel('Selected quantity')).toHaveText('2')
  await page.locator('.product-purchase-row').getByRole('button', { name: 'Add to cart', exact: true }).click()
  await expect(page.locator('.product-added-feedback')).toContainText('Added to your basket')
  await page.locator('.mobile-tabbar a[href="/cart"]').click()
  await expect(page.getByRole('heading', { name: 'Your shopping cart' })).toBeVisible()
  await expect(page.getByText('2 items', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Increase Wireless noise-cancelling headphones quantity' }).click()
  await expect(page.locator('.cart-item-quantity output')).toHaveText('3')
  await page.goto('/product/1')
  await page.getByRole('button', { name: 'Save for later' }).click()
  await page.goto('/wishlist')
  await expect(page.locator('.wishlist-saved-list')).toContainText('Wireless noise-cancelling headphones')
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
  const heroSearch = page.getByRole('search').getByRole('combobox', { name: 'Search products and categories' })
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
  await expect(sellerGroups.nth(0)).toContainText('189 DT')
  await expect(sellerGroups.nth(1)).toContainText('Maison & Co')
  await expect(sellerGroups.nth(1)).toContainText('79 DT')
  await expect(page.locator('.cart-summary')).toContainText('268 DT')
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

test('seller preparation actions stay inside profile-related sections', async ({ page }) => {
  await page.goto('/seller-central')
  await expect(page.getByRole('button', { name: 'Save preparation draft' })).toBeVisible()
  await page.getByRole('button', { name: /Product catalogue/ }).click()
  await expect(page.getByRole('button', { name: 'Save preparation draft' })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Clear draft' })).toHaveCount(0)
  await page.getByRole('button', { name: /Operations preferences/ }).click()
  await expect(page.getByRole('button', { name: 'Save preparation draft' })).toBeVisible()
})

test('seller central section navigation is addressable and browser-history aware', async ({ page }) => {
  await page.goto('/seller-central?section=analytics')
  await expect(page.getByRole('heading', { name: 'Understand order activity, product demand and business performance' })).toBeVisible()
  await page.getByRole('button', { name: /Product catalogue/ }).click()
  await expect(page).toHaveURL(/section=catalog/)
  await expect(page.getByRole('heading', { name: 'Manage your product catalogue' })).toBeVisible()
  await page.goBack()
  await expect(page).toHaveURL(/section=analytics/)
  await expect(page.getByRole('heading', { name: 'Understand order activity, product demand and business performance' })).toBeVisible()
})

test('seller inventory saves stock and movement history as one browser update', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('marchy-seller-catalog-v1', JSON.stringify([
    { id: 'inventory-test', name: 'Inventory test product', sku: 'INV-001', category: 'Home', price: 12, stock: 4, variants: ['Default'], status: 'draft' }
  ])))
  await page.goto('/seller-central?section=inventory')
  await page.getByLabel('Product', { exact: true }).selectOption('inventory-test')
  await page.getByLabel('Variant / SKU').selectOption('inventory-test-variant-0')
  await page.getByRole('button', { name: 'Save stock movement' }).click()
  await expect(page.getByRole('status')).toContainText('1 unit(s) added')
  const saved = await page.evaluate(() => ({
    catalogue: JSON.parse(localStorage.getItem('marchy-seller-catalog-v1')),
    movements: JSON.parse(localStorage.getItem('marchy-seller-inventory-movements-v1'))
  }))
  expect(saved.catalogue[0].inventory.variants[0].available).toBe(5)
  expect(saved.catalogue[0].stock).toBe(5)
  expect(saved.movements).toHaveLength(1)
  expect(saved.movements[0].before).toBe(4)
  expect(saved.movements[0].after).toBe(5)
})

test('seller inventory rolls back the catalogue when movement history cannot be saved', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('marchy-seller-catalog-v1', JSON.stringify([
      { id: 'inventory-rollback', name: 'Rollback test product', sku: 'INV-ROLLBACK', category: 'Home', price: 12, stock: 4, variants: ['Default'], status: 'draft' }
    ]))
    const originalSetItem = Storage.prototype.setItem
    Storage.prototype.setItem = function (key, value) {
      if (key === 'marchy-seller-inventory-movements-v1') throw new DOMException('Quota exceeded', 'QuotaExceededError')
      return originalSetItem.call(this, key, value)
    }
  })
  await page.goto('/seller-central?section=inventory')
  await page.getByLabel('Product', { exact: true }).selectOption('inventory-rollback')
  await page.getByLabel('Variant / SKU').selectOption('inventory-rollback-variant-0')
  await page.getByRole('button', { name: 'Save stock movement' }).click()
  await expect(page.getByRole('alert')).toContainText('Could not save inventory changes')
  const saved = await page.evaluate(() => ({
    catalogue: JSON.parse(localStorage.getItem('marchy-seller-catalog-v1')),
    movements: localStorage.getItem('marchy-seller-inventory-movements-v1')
  }))
  expect(saved.catalogue[0].stock).toBe(4)
  expect(saved.catalogue[0].inventory).toBeUndefined()
  expect(saved.movements).toBeNull()
})

test('seller central can create and delete a local catalogue draft without publishing it', async ({ page }) => {
  await page.goto('/seller-central')
  await page.getByRole('button', { name: /Product catalogue/ }).click()
  await page.getByRole('button', { name: 'Add product', exact: true }).click()
  await page.getByLabel('Product title *').fill('Handmade test vase')
  await page.getByLabel('Seller SKU *').fill('TEST-VASE-001')
  await page.getByLabel('Category').selectOption('Home')
  await page.getByLabel('Selling price (TND) *').fill('45')
  await page.getByLabel('Product description *').fill('A locally saved draft for testing')
  await page.getByRole('button', { name: 'Save draft', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('Listing draft saved on this device.')
  await expect(page.locator('.sc-catalog-list')).toContainText('Handmade test vase')
  page.once('dialog', dialog => dialog.accept())
  await page.getByRole('button', { name: 'Delete Handmade test vase' }).click()
  await expect(page.locator('.sc-catalog-list')).toHaveCount(0)
})
test('seller central can edit a saved catalogue listing without changing other listings', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('marchy-seller-catalog-v1', JSON.stringify([
    {id:'draft-a',name:'First local draft',sku:'FIRST-001',category:'Electronics',price:25,compareAtPrice:null,stock:3,description:'First description',variants:[],image:'',status:'draft'},
    {id:'draft-b',name:'Second local draft',sku:'SECOND-001',category:'Accessories',price:35,compareAtPrice:null,stock:2,description:'Second description',variants:[],image:'',status:'draft'}
  ])))
  await page.goto('/seller-central')
  await page.getByRole('button', { name: /Product catalogue/ }).click()
  await page.getByRole('button', { name: 'Edit First local draft' }).click()
  await expect(page.getByRole('heading', { name: 'Update listing details' })).toBeVisible()
  await page.getByLabel('Product title *').fill('Updated first draft')
  await page.getByRole('button', { name: 'Save draft', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('Listing draft saved on this device.')
  await expect(page.locator('.sc-catalog-list')).toContainText('Updated first draft')
  await expect(page.locator('.sc-catalog-list')).toContainText('Second local draft')
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('marchy-seller-catalog-v1')))
  expect(saved).toHaveLength(2)
  expect(saved.find(d => d.id === 'draft-a').name).toBe('Updated first draft')
  expect(saved.find(d => d.id === 'draft-b').name).toBe('Second local draft')
})
test('seller storefront offers a share action without inventing seller contact details', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.addInitScript(() => Object.defineProperty(navigator, 'share', { configurable: true, value: undefined }))
  await page.goto('/seller/atlas-tech-tunis')
  await page.getByRole('button', { name: /Share storefront/ }).click()
  await expect(page.getByRole('status').filter({ hasText: 'Storefront link copied' })).toBeVisible()
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('/seller/atlas-tech-tunis')
  await expect(page.getByText(/Seller information requires confirmation/)).toBeVisible()
})

test('seller storefront exposes active filters and can clear them', async ({ page }) => {
  await page.goto('/seller/atlas-tech-tunis')
  await page.getByRole('button', { name: 'Electronics', exact: true }).click()
  await expect(page.locator('.store-active-filters')).toContainText('Electronics')
  await page.getByRole('button', { name: 'Clear all' }).click()
  await expect(page.locator('.store-active-filters')).toHaveCount(0)
  await page.getByRole('textbox', { name: 'Search this storefront' }).fill('headphones')
  await expect(page.locator('.store-active-filters')).toContainText('headphones')
  await page.getByRole('button', { name: /Search:/ }).click()
  await expect(page.locator('.store-active-filters')).toHaveCount(0)
})

test('seller storefront supports persistent grid and list product layouts', async ({ page }) => {
  await page.goto('/seller/atlas-tech-tunis')
  await page.getByRole('button', { name: 'List view' }).click()
  await expect(page.locator('.seller-store-page .product-grid')).toHaveClass(/product-list-view/)
  await page.goto('/seller/atlas-tech-tunis')
  await expect(page.locator('.seller-store-page .product-grid')).toHaveClass(/product-list-view/)
  await page.getByRole('button', { name: 'Grid view' }).click()
  await expect(page.locator('.seller-store-page .product-grid')).not.toHaveClass(/product-list-view/)
})

test('product comparison persists across product pages and opens the comparison modal', async ({ page }) => {
  await page.goto('/product/1')
  await page.locator('.product-buy-topline .product-compare-button').click()
  await expect(page.locator('.product-buy-topline .product-compare-button')).toHaveAttribute('aria-pressed', 'true')
  await page.goto('/product/2')
  await page.locator('.product-buy-topline .product-compare-button').click()
  const dock = page.getByRole('region', { name: 'Product comparison dock' })
  await expect(dock).toContainText('2 of 3 selected')
  await dock.getByRole('button', { name: /Compare Now/ }).click()
  const dialog = page.getByRole('dialog', { name: /Product Comparison/ })
  await expect(dialog).toBeVisible()
  await expect(dialog).toContainText('Wireless noise-cancelling headphones')
  await expect(dialog).toContainText('Minimal ceramic table lamp')
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
  await page.locator('.product-buy-topline .product-compare-button').click()
  await page.locator('.related-products .product-card .product-name').first().click()
  await expect(page).toHaveURL(/\/product\/\d+$/)
  await expect(page.locator('.product-buy-topline .product-compare-button')).toHaveAttribute('aria-pressed', 'false')
})

test('product page can copy a shareable listing link', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.addInitScript(() => Object.defineProperty(navigator, 'share', { configurable: true, value: undefined }))
  await page.goto('/product/1')
  await page.getByRole('button', { name: /Share/ }).click()
  await expect(page.getByRole('status').filter({ hasText: 'Listing link copied' })).toBeVisible()
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('/product/1')
})

test('checkout creates shared demo seller orders and opens buyer tracking', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('marchy-seller-onboarding-draft-v1', JSON.stringify({ storeName: 'Atlas Tech' })))
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
  await page.getByLabel('Governorate / Region').selectOption('Tunis')
  await page.getByRole('textbox', { name: 'Delivery address' }).fill('10 Demo Street')
  await page.getByRole('button', { name: 'Review order' }).click()
  await expect(page.getByRole('heading', { name: 'Review before proceeding' })).toBeVisible()
  await expect(page.locator('.checkout-seller-review')).toHaveCount(2)
  await expect(page.locator('.checkout-summary')).toContainText('268 DT')
  await page.getByRole('button', { name: 'Place demo order' }).click()
  await expect(page).toHaveURL(/\/orders$/)
  await expect(page.getByRole('heading', { name: 'Your orders' })).toBeVisible()
  const createdOrderLinks = page.locator('.buyer-order-success-links a')
  await expect(createdOrderLinks).toHaveCount(2)
  await createdOrderLinks.first().click()
  await expect(page.getByRole('heading', { name: /Track Order MC-/ })).toBeVisible()
  await expect(page.locator('.buyer-tracking-panel')).toContainText('Demo Customer')
  const trackingPath = new URL(page.url()).pathname
  const orderId = trackingPath.split('/').pop()
  await page.goto('/account')
  await expect(page.locator('.account-demo-order[href="' + trackingPath + '"]')).toHaveCount(1)
  await page.goto('/seller-central')
  await page.getByRole('button', { name: /Orders & fulfilment/ }).click()
  await expect(page.locator('.sc-order-row').filter({ hasText: 'Demo Customer' })).toHaveCount(1)
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

test('seller directory search matches accented French category terms', async ({ page }) => {
  await page.goto('/sellers')
  await page.getByRole('textbox', { name: 'Search sellers' }).fill('électronique')
  await expect(page.locator('.seller-directory-card')).toHaveCount(1)
  await expect(page.locator('.seller-directory-card').first()).toContainText('Atlas Tech')
})

test('core shopping pages have no serious or critical accessibility violations', async ({ page }) => {
  const { default: AxeBuilder } = await import('@axe-core/playwright')
  const routesToAudit = ['/', '/search', '/product/1', '/cart', '/checkout', '/wishlist', '/categories', '/seller/atlas-tech-tunis', '/sell', '/seller-dashboard', '/operations/delivery', '/admin', '/orders/MC-1048']
  for (const route of routesToAudit) {
    if (route === '/checkout') await page.addInitScript(() => localStorage.setItem('marchy-cart', JSON.stringify([{ id: 1, name: 'Wireless noise-cancelling headphones', category: 'Electronics', price: 189, qty: 1, image: '/product-placeholder.svg' }])))
    await page.goto(route)
    await expect(page.locator('main').first()).toBeVisible()
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()
    const highImpact = results.violations.filter(issue => ['serious', 'critical'].includes(issue.impact))
    expect(
      highImpact,
      `Serious accessibility violations on ${route}: ${JSON.stringify(highImpact.map(issue => ({ id: issue.id, impact: issue.impact, help: issue.help, nodes: issue.nodes.map(node => node.target) }))) }`,
    ).toEqual([])
  }
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

test('seller preparation updates remain separate from the customer order status', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('marchy-seller-onboarding-draft-v1', JSON.stringify({ storeName: 'Atlas Tech' }))
    localStorage.setItem('marchy-demo-operations-v1', JSON.stringify([{
      id: 'TEST-SELLER-ORDER', seller: 'Atlas Tech', buyer: 'Amira Ben Salem', phone: '+216 20 000 000',
      city: 'Tunis', address: 'Test address', products: [{ id: 1, name: 'Test product', sellerName: 'Atlas Tech', price: 20, qty: 1 }],
      total: 20, status: 'Processing', createdAt: '2026-11-06T08:00:00.000Z', timeline: []
    }]))
  })
  await page.goto('/seller-central')
  await page.getByRole('button', { name: /Orders & fulfilment/ }).click()
  const order = page.locator('.sc-order-row').filter({ hasText: 'TEST-SELLER-ORDER' })
  await expect(order).toContainText('Amira Ben Salem')
  await order.click()
  await page.getByRole('button', { name: 'Mark accepted' }).click()
  await expect(page.locator('.sc-order-stage')).toContainText('Accepted')
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('marchy-demo-operations-v1')))
  expect(saved[0].sellerFulfilmentStatus).toBe('Accepted')
  expect(saved[0].status).toBe('Processing')
})


test('buyer account can follow shared demo order status changes', async ({ page }) => {
  await page.goto('/account')
  await page.getByRole('link', { name: /MC-1048/ }).click()
  await expect(page.getByRole('heading', { name: 'Track Order MC-1048' })).toBeVisible()
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
  await expect(page.locator('.buyer-order-card')).toHaveCount(3)
  await page.getByLabel('Search orders').fill('Amira')
  await expect(page.locator('.buyer-order-card')).toHaveCount(1)
  await expect(page.locator('.buyer-order-card')).toContainText('MC-1048')
  await page.getByLabel('Search orders').fill('')
  await page.getByRole('button', { name: /^Delivered/ }).click()
  await expect(page.locator('.buyer-order-card')).toHaveCount(1)
  await expect(page.locator('.buyer-order-card')).toContainText('MC-1046')
  await page.getByRole('link', { name: 'View order', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Track Order MC-1046' })).toBeVisible()
})


test('buyer order history respects French and Arabic interface language', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('marchy-language', 'fr'))
  await page.goto('/orders')
  await expect(page.getByRole('heading', { name: 'Vos commandes' })).toBeVisible()
  await page.locator('.language-picker select').selectOption('ar')
  await expect(page.getByRole('heading', { name: 'طلباتك' })).toBeVisible()
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
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

test('mobile product purchase bar quantity stays in sync with the main purchase controls', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/product/1')
  await page.locator('.mobile-buybar-quantity').getByRole('button', { name: 'Increase quantity' }).click()
  await expect(page.locator('.mobile-buybar-total')).toContainText('378 DT')
  await page.locator('.mobile-buybar-actions').getByRole('button', { name: 'Add to cart' }).click()
  await expect(page.locator('.product-added-feedback')).toContainText('Added to your basket')
})


test('MARCHY uses the locked forest-green brand accent across buyer touchpoints', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('.header .searchbar button[type="submit"]')).toBeVisible()
  const tokens = await page.evaluate(() => {
    const root = getComputedStyle(document.documentElement)
    const searchButton = getComputedStyle(document.querySelector('.header .searchbar button[type="submit"]'))
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
  await page.locator('.header .searchbar input').focus()
  await expect(page.locator('.header .searchbar')).toHaveCSS('border-color', 'rgb(131, 174, 149)')
})


test('light and dark themes toggle accessibly and persist across reloads', async ({ page }) => {
  await page.goto('/')
  const toggle = page.getByRole('button', { name: 'Switch to dark mode' })
  await expect(toggle).toBeVisible()
  await toggle.click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await expect(page.locator('html')).toHaveCSS('color-scheme', 'dark')
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(17, 25, 21)')
  await expect(page.getByRole('button', { name: 'Switch to light mode' })).toHaveAttribute('aria-pressed', 'true')
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await page.getByRole('button', { name: 'Switch to light mode' }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
})

test('auth page is a unique standalone page with logo on top left and centred form', async ({ page }) => {
  await page.goto('/login')
  // No marketplace header, nav, or footer on the unique auth page
  await expect(page.locator('header.header')).toHaveCount(0)
  await expect(page.locator('footer.footer')).toHaveCount(0)
  await expect(page.locator('.mobile-tabbar')).toHaveCount(0)

  // Standalone layout with logo resting on top left and form card centered
  await expect(page.locator('.auth-unique-page')).toBeVisible()
  await expect(page.locator('.auth-top-bar .auth-brand-logo')).toBeVisible()
  await expect(page.locator('.auth-top-bar .auth-brand-wordmark')).toContainText('MARCHY')
  await expect(page.locator('.auth-form-card')).toBeVisible()
  await expect(page.locator('.auth-form-heading h2')).toContainText('Sign in to MARCHY')

  // Switch between Sign in and Sign up
  await page.locator('.auth-mode-switch a', { hasText: 'Sign up' }).click()
  await expect(page).toHaveURL(/.*\/signup/)
  await expect(page.locator('.auth-form-heading h2')).toContainText('Create an account')
  await expect(page.locator('input[placeholder="Your full name"]')).toBeVisible()

  // Return to marketplace link works
  await page.locator('.auth-back-link').click()
  await expect(page).toHaveURL(/.*\/$/)
  await expect(page.locator('header.header')).toBeVisible()

  // Static login navigates to the landing page
  await page.goto('/login')
  await page.locator('input[type="email"]').fill('demo@example.com')
  await page.locator('input[type="password"]').fill('password123')
  await page.locator('button.auth-submit').click()
  await expect(page).toHaveURL(/.*\/$/)
  await expect(page.locator('header.header')).toBeVisible()

  // Static create account navigates to the landing page
  await page.goto('/signup')
  await page.locator('input[placeholder="Your full name"]').fill('Sara Ben Ali')
  await page.locator('input[type="email"]').fill('sara@example.com')
  await page.locator('input[placeholder="At least 8 characters"]').fill('securepass123')
  await page.locator('input[placeholder="Repeat your password"]').fill('securepass123')
  await page.locator('.auth-terms input[type="checkbox"]').check()
  await page.locator('button.auth-submit').click()
  await expect(page).toHaveURL(/.*\/$/)
  await expect(page.locator('header.header')).toBeVisible()
})


test('mobile quick navigation prioritises five buyer destinations and keeps seller discovery in the menu', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  const tabs = page.locator('.mobile-tabbar a')
  await expect(tabs).toHaveCount(5)
  await expect(tabs.nth(0)).toContainText('Home')
  await expect(tabs.nth(1)).toContainText('Explore')
  await expect(tabs.nth(2)).toContainText('Saved')
  await expect(tabs.nth(3)).toContainText('Cart')
  await expect(tabs.nth(4)).toContainText('Account')
  await expect(page.locator('.mobile-tabbar')).toHaveCSS('grid-template-columns', /\d+px/)
  await page.getByRole('button', { name: 'Open navigation menu' }).click()
  await expect(page.getByRole('navigation', { name: 'Primary navigation' }).getByRole('link', { name: 'Sellers' })).toBeVisible()
})

test('checkout presents two accurate steps and creates a local demo order after review', async ({ page }) => {
  await page.goto('/product/1')
  await page.locator('.product-purchase-row').getByRole('button', { name: 'Add to cart', exact: true }).click()
  await page.goto('/checkout')
  await expect(page.locator('.checkout-steps li')).toHaveCount(2)
  await expect(page.locator('.checkout-steps')).toContainText('Delivery details')
  await expect(page.locator('.checkout-steps')).toContainText('Order review')
  await page.getByRole('button', { name: 'Review order' }).click()
  await expect(page.getByRole('heading', { name: 'Where should the seller contact you?' })).toBeVisible()
  await page.getByLabel('Full name').fill('Test Buyer')
  await page.getByLabel('Phone number').fill('+216 20 000 000')
  await page.getByLabel('Delivery address').fill('10 Test Street, Tunis')
  await page.getByRole('button', { name: 'Review order' }).click()
  await expect(page.getByRole('heading', { name: 'Review before proceeding' })).toBeVisible()
  await expect(page.locator('.checkout-preview-note')).toContainText('No seller receives the order')
  await expect(page.locator('.checkout-review')).not.toContainText('Buyer Protection & COD Guarantee')
  await expect(page.locator('.checkout-contact-review')).toContainText('Test Buyer')
  await page.getByRole('button', { name: 'Place demo order' }).click()
  await expect(page).toHaveURL(/\/orders\//)
  await expect(page.locator('main').first()).toBeVisible()
})

test('seller routes use an independent portal shell without buyer shopping chrome', async ({ page }) => {
  for (const route of ['/sell', '/seller-central', '/seller-help']) {
    await page.goto(route)
    await expect(page.locator('.seller-portal-header')).toBeVisible()
    await expect(page.locator('.seller-portal-footer')).toBeVisible()
    await expect(page.locator('.header')).toHaveCount(0)
    await expect(page.locator('.footer')).toHaveCount(0)
    await expect(page.locator('.mobile-tabbar')).toHaveCount(0)
    await expect(page.locator('.seller-portal-nav')).toBeVisible()
    await expect(page.getByLabel('Seller language')).toBeVisible()
    await expect(page.getByRole('button', { name: /Switch to (light|dark) mode/ })).toBeVisible()
  }
  await page.goto('/seller-central')
  await page.getByLabel('Seller language').selectOption('fr')
  await expect(page.locator('.seller-portal-nav')).toContainText('Espace vendeur')
  await page.getByTestId('seller-language').selectOption('en')
  await page.getByLabel('Seller language').selectOption('ar')
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
  await page.getByLabel('Seller language').selectOption('en')
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr')
  await page.goto('/seller-dashboard')
  await expect(page).toHaveURL(/\/seller-central$/)
  await expect(page.locator('.seller-portal-header')).toBeVisible()
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/seller/atlas-tech-tunis')
  await expect(page.locator('.header')).toBeVisible()
  await expect(page.locator('.mobile-tabbar')).toBeVisible()
  await expect(page.locator('.seller-portal-header')).toHaveCount(0)
})


test('product cards distinguish illustrative catalogue data from verified marketplace facts', async ({ page }) => {
  await page.goto('/search')
  const card = page.locator('.product-card').first()
  await expect(card).toContainText('Sample listing')
  await expect(card).toContainText('Delivery to confirm')
  await expect(card).toContainText('Sample price')
  await expect(card).not.toContainText('Verified')
  await expect(card).not.toContainText('COD Available')
  await expect(card).not.toContainText('Local dispatch')
  await expect(card).toContainText('Sample rating')
})

test('buyer navigation sends merchants to the seller introduction page', async ({ page }) => {
  await page.goto('/')
  await page.locator('.nav').getByRole('link', { name: 'Sell on MARCHY' }).click()
  await expect(page).toHaveURL(/\/sell$/)
  await expect(page.getByRole('main')).toContainText(/seller|storefront|merchant/i)
})

test('product detail keeps delivery and seller trust information explicitly unconfirmed', async ({ page }) => {
  await page.goto('/product/1')
  await expect(page.getByRole('region', { name: 'Delivery information' })).toContainText('Delivery details to confirm')
  await expect(page.getByRole('region', { name: 'Delivery information' })).toContainText('not connected to live courier data')
  await expect(page.locator('.product-listing-status')).toContainText('Sample offer')
  await expect(page.locator('.product-seller-card')).toContainText('Sample storefront')
  await expect(page.locator('.product-buy-panel')).not.toContainText('Verified merchant')
  await expect(page.locator('.product-buy-panel')).not.toContainText('Cash on Delivery protection')
})

test('shared header only rises above page content while an overlay is open', async ({ page }) => {
  await page.goto('/')
  const header = page.locator('header.header')
  const search = page.getByRole('search').getByLabel('Search products and stores')

  await expect(header).toHaveCSS('z-index', 'auto')
  await search.fill('headphones')
  await expect(page.getByRole('dialog', { name: 'Search suggestions' })).toBeVisible()
  await expect(header).toHaveCSS('z-index', '50')
  await page.getByRole('button', { name: 'Close suggestions' }).click()
  await expect(search).toHaveAttribute('aria-expanded', 'false')
  await expect(header).toHaveCSS('z-index', 'auto')

  await page.setViewportSize({ width: 390, height: 844 })
  await page.getByRole('button', { name: 'Open navigation menu' }).click()
  await expect(page.getByRole('navigation', { name: 'Primary navigation' })).toBeVisible()
  await expect(header).toHaveCSS('z-index', '50')
  await page.locator('.nav a[href="/categories"]').click()
  await expect(page).toHaveURL(/categories$/)
  await expect(header).toHaveCSS('z-index', 'auto')
})

test('global search suggestions stay anchored below the field on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await page.getByRole('button', { name: 'Open search' }).click()
  const search = page.getByRole('search').getByLabel('Search products and stores')
  await expect(search).toBeVisible()
  await expect(search).toHaveAttribute('aria-expanded', 'false')
  await search.fill('headphones')
  await expect(search).toHaveAttribute('aria-expanded', 'true')
  const panel = page.getByRole('dialog', { name: 'Search suggestions' })
  await expect(panel).toBeVisible()
  await expect(panel).toContainText('Wireless noise-cancelling headphones')
  const geometry = await page.locator('.header .searchbar').evaluate(form => {
    const field = form.getBoundingClientRect()
    const suggestions = form.querySelector('.global-search-suggestions').getBoundingClientRect()
    return { fieldBottom: field.bottom, suggestionsTop: suggestions.top, position: getComputedStyle(form.querySelector('.global-search-suggestions')).position }
  })
  expect(geometry.position).toBe('absolute')
  expect(geometry.suggestionsTop).toBeGreaterThanOrEqual(geometry.fieldBottom)
})

test('product Q&A makes local preview behavior clear', async ({ page }) => {
  await page.goto('/product/1')
  const qa = page.locator('.product-qa-section')
  await expect(qa).toContainText('Questions stay in this browser preview')
  await expect(qa).not.toContainText('Verified Merchant Answer')
  await qa.getByRole('button', { name: 'Ask a Question' }).click()
  await qa.getByLabel('Your Question').fill('Is this available in another colour?')
  await qa.getByRole('button', { name: 'Submit Question' }).click()
  await expect(qa).toContainText('Question saved in this browser preview')
})
