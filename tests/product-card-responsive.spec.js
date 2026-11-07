import { test, expect } from '@playwright/test'

test.describe('shared product card responsive contract', () => {
  test('cards and purchase controls stay within the viewport across common widths', async ({ page }) => {
    await page.goto('/search?q=headphones')
    const card = page.locator('.product-card').first()
    await expect(card).toBeVisible()

    for (const width of [320, 360, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 })
      await expect(card).toBeVisible()

      const geometry = await page.evaluate(() => {
        const viewport = document.documentElement.clientWidth
        const cardElement = document.querySelector('.product-card')
        const cardRect = cardElement.getBoundingClientRect()
        const controls = [...cardElement.querySelectorAll('.wish-btn, .compare-product-button, .add-btn')]
        return {
          viewport,
          documentWidth: document.documentElement.scrollWidth,
          cardLeft: cardRect.left,
          cardRight: cardRect.right,
          controlsInsideCard: controls.every(control => {
            const rect = control.getBoundingClientRect()
            return rect.left >= cardRect.left - 1 && rect.right <= cardRect.right + 1
          }),
        }
      })

      expect(geometry.documentWidth, `horizontal overflow at ${width}px`).toBeLessThanOrEqual(geometry.viewport + 1)
      expect(geometry.cardLeft, `card begins outside viewport at ${width}px`).toBeGreaterThanOrEqual(-1)
      expect(geometry.cardRight, `card ends outside viewport at ${width}px`).toBeLessThanOrEqual(geometry.viewport + 1)
      expect(geometry.controlsInsideCard, `card controls escape their card at ${width}px`).toBeTruthy()
      await expect(card.locator('.product-name')).toBeVisible()
      await expect(card.locator('.add-btn')).toBeVisible()
    }
  })

  test('Arabic RTL keeps card actions and seller metadata inside the card', async ({ page }) => {
    await page.goto('/')
    await page.locator('select[aria-label="Language"]').first().selectOption('ar')
    await expect(page.locator('.app-root')).toHaveAttribute('dir', 'rtl')

    await page.goto('/search?q=headphones')
    const card = page.locator('.product-card').first()
    await expect(card).toBeVisible()

    const geometry = await card.evaluate(element => {
      const cardRect = element.getBoundingClientRect()
      const selectors = ['.wish-btn', '.seller-link', '.seller-location-chip', '.compare-product-button', '.add-btn']
      return selectors.map(selector => {
        const node = element.querySelector(selector)
        if (!node) return { selector, present: false, inside: false }
        const rect = node.getBoundingClientRect()
        return {
          selector,
          present: true,
          inside: rect.left >= cardRect.left - 1 && rect.right <= cardRect.right + 1,
        }
      })
    })

    expect(geometry.every(item => item.present && item.inside), JSON.stringify(geometry)).toBeTruthy()
    await expect(page.locator('.app-root')).toHaveClass(/is-rtl/)
  })
})
