import { test, expect } from '@playwright/test'

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


