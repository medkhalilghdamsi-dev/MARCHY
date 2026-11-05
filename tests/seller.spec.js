import { test, expect } from '@playwright/test'

test('seller workspace can save and delete a local product draft without publishing it', async ({ page }) => {
  await page.goto('/seller-dashboard')
  await page.getByRole('button', { name: 'Products' }).click()
  await page.getByRole('button', { name: /Create draft/ }).click()
  await page.getByLabel('Product name').fill('Handmade test vase')
  await page.getByLabel('Category').first().fill('Home & Living')
  await page.getByLabel('Indicative price (TND)').fill('45')
  await page.getByLabel('Description').last().fill('A locally saved draft for testing')
  await page.getByRole('button', { name: 'Save draft on this device' }).click()
  await expect(page.getByRole('status')).toContainText('Draft saved on this device')
  await expect(page.locator('.seller-local-drafts')).toContainText('Handmade test vase')
  await expect(page.locator('.seller-local-drafts')).toContainText('LOCAL DRAFT')
  await page.getByRole('button', { name: 'Delete draft Handmade test vase' }).click()
  await expect(page.locator('.seller-local-drafts')).toHaveCount(0)
})


test('seller can edit a saved local product draft without changing other drafts', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('marchy-seller-drafts', JSON.stringify([
    {id:'draft-a',sellerSlug:'atlas-tech-tunis',title:'First local draft',category:'Electronics',price:25,description:'First description',status:'Draft',createdAt:'2026-01-01T00:00:00.000Z'},
    {id:'draft-b',sellerSlug:'atlas-tech-tunis',title:'Second local draft',category:'Accessories',price:35,description:'Second description',status:'Draft',createdAt:'2026-01-02T00:00:00.000Z'}
  ])))
  await page.goto('/seller-dashboard')
  await page.getByRole('button', { name: 'Products' }).click()
  await page.getByRole('button', { name: 'Edit draft First local draft' }).click()
  await expect(page.getByRole('heading', { name: 'Update product information' })).toBeVisible()
  await page.getByLabel('Product name').fill('Updated first draft')
  await page.getByRole('button', { name: 'Update local draft' }).click()
  await expect(page.getByRole('status')).toContainText('Draft updated on this device')
  await expect(page.locator('.seller-local-drafts')).toContainText('Updated first draft')
  await expect(page.locator('.seller-local-drafts')).toContainText('Second local draft')
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('marchy-seller-drafts')))
  expect(saved).toHaveLength(2)
  expect(saved.find(d => d.id === 'draft-a').title).toBe('Updated first draft')
  expect(saved.find(d => d.id === 'draft-b').title).toBe('Second local draft')
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


test('seller directory search matches accented French category terms', async ({ page }) => {
  await page.goto('/sellers')
  await page.getByRole('textbox', { name: 'Search sellers' }).fill('électronique')
  await expect(page.locator('.seller-directory-card')).toHaveCount(1)
  await expect(page.locator('.seller-directory-card').first()).toContainText('Atlas Tech')
})

