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


test('compact 320px header keeps controls within one viewport row', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 })
  await page.goto('/search')

  const headerRow = page.locator('.header-main')
  const menu = page.locator('.header .mobile-menu')
  const searchToggle = page.locator('.header .mobile-search-toggle')
  const logo = page.locator('.header .logo')
  const actions = page.locator('.header .header-actions')

  await expect(headerRow).toBeVisible()
  await expect(menu).toBeVisible()
  await expect(searchToggle).toBeVisible()
  await expect(logo).toBeVisible()
  await expect(actions).toBeVisible()

  const positions = await Promise.all([menu, searchToggle, logo, actions].map(locator =>
    locator.evaluate(element => {
      const rect = element.getBoundingClientRect()
      return { left: Math.round(rect.left), right: Math.round(rect.right), top: Math.round(rect.top), bottom: Math.round(rect.bottom) }
    })
  ))

  expect(positions.every(item => item.left >= 0 && item.right <= 320)).toBeTruthy()
  expect(Math.max(...positions.map(item => item.top))).toBeLessThanOrEqual(Math.min(...positions.map(item => item.bottom)))

  await expect(page.locator('#global-search-form')).toBeHidden()
  await searchToggle.click()
  await expect(page.locator('#global-search-form')).toBeVisible()
})
