import { test, expect } from '@playwright/test'

const viewports = [
  { name: 'small-phone', width: 375, height: 667 },
  { name: 'iphone', width: 390, height: 844 },
  { name: 'large-phone', width: 430, height: 932 },
  { name: 'tablet', width: 768, height: 1024 },
]

test('live MARCHY landing page responsive visual and runtime audit', async ({ page }, testInfo) => {
  const consoleErrors = []
  const pageErrors = []
  page.on('console', message => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })
  page.on('pageerror', error => pageErrors.push(error.message))

  const route = process.env.MARCHY_AUDIT_PATH || '/'
  await page.goto(route, { waitUntil: 'domcontentloaded' })
  await page.locator('body').waitFor()

  const routeLinks = await page.locator('a[href]').evaluateAll(links => {
    const origin = location.origin
    return [...new Set(links.map(link => link.href)
      .filter(href => href.startsWith(origin))
      .map(href => new URL(href).pathname)
      .filter(path => path && path !== '/'))].slice(0, 12)
  })

  const results = []
  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height })
    await page.waitForTimeout(350)
    const metrics = await page.evaluate(() => {
      const doc = document.documentElement
      const body = document.body
      const overflowing = [...document.querySelectorAll('body *')].filter(el => {
        const rect = el.getBoundingClientRect()
        const style = getComputedStyle(el)
        return rect.width > 0 && rect.height > 0 &&
          (rect.right > window.innerWidth + 2 || rect.left < -2) &&
          style.position !== 'fixed' && style.position !== 'absolute' &&
          style.overflowX !== 'hidden'
      }).slice(0, 15).map(el => ({
        tag: el.tagName,
        className: typeof el.className === 'string' ? el.className.slice(0, 100) : '',
        text: (el.innerText || '').slice(0, 70),
        left: Math.round(el.getBoundingClientRect().left),
        right: Math.round(el.getBoundingClientRect().right),
      }))
      return {
        viewport: { width: innerWidth, height: innerHeight },
        documentWidth: doc.scrollWidth,
        bodyWidth: body.scrollWidth,
        horizontalOverflow: doc.scrollWidth > innerWidth + 1,
        overflowingElements: overflowing,
        images: [...document.images].map(img => ({
          src: img.currentSrc || img.src,
          loaded: img.complete && img.naturalWidth > 0,
          alt: img.alt,
        })).filter(img => !img.loaded).slice(0, 15),
        mainCount: document.querySelectorAll('main').length,
        headingCount: document.querySelectorAll('h1').length,
      }
    })
    results.push({ name: viewport.name, ...metrics })
    await page.screenshot({
      path: testInfo.outputPath(`landing-${viewport.name}.png`),
      fullPage: true,
    })
  }

  console.log('MARCHY_LIVE_AUDIT', JSON.stringify({
    url: page.url(),
    results,
    routeLinks,
    consoleErrors,
    pageErrors,
  }, null, 2))

  expect(pageErrors, 'uncaught browser page errors').toEqual([])
  expect(results.filter(result => result.horizontalOverflow).map(result => result.name),
    'horizontal overflow at mobile/tablet widths').toEqual([])
  expect(results[1].headingCount, 'landing page should have a primary heading').toBeGreaterThan(0)
})
