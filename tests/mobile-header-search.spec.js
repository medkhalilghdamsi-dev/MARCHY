import { test, expect } from '@playwright/test'

test.describe('responsive global header search', () => {
  test('mobile header keeps global search collapsed until requested', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')

    const searchForm = page.getByRole('search').filter({ has: page.getByRole('combobox', { name: 'Search products and stores' }) })
    const toggle = page.getByRole('button', { name: 'Open search' })

    await expect(toggle).toBeVisible()
    await expect(searchForm).toBeHidden()

    await toggle.click()
    await expect(page.getByRole('button', { name: 'Close search' })).toBeVisible()
    await expect(searchForm).toBeVisible()
    await expect(searchForm.getByRole('combobox', { name: 'Search products and stores' })).toBeVisible()
  })

  test('mobile global search closes with Escape and outside interaction', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/search')

    await page.getByRole('button', { name: 'Open search' }).click()
    const searchForm = page.locator('#global-search-form')
    await expect(searchForm).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(searchForm).toBeHidden()

    await page.getByRole('button', { name: 'Open search' }).click()
    await page.locator('main').click({ position: { x: 10, y: 10 } })
    await expect(searchForm).toBeHidden()
  })

  test('desktop keeps the full global search visible without a mobile toggle', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')

    await expect(page.locator('#global-search-form')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Open search' })).toBeHidden()
  })
})
