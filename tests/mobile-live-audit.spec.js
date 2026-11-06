import { test, expect } from '@playwright/test'

const viewports = [
  { name: 'small-phone', width: 375, height: 667 },
  { name: 'iphone', width: 390, height: 844 },
  { name: 'large-phone', width: 430, height: 932 },
  { name: 'tablet', width: 768, height: 1024 },
]

async function loadLazyImages(page) {
  const height = await page.evaluate(() => document.documentElement.scrollHeight)
  const step = Math.max(450, Math.floor(await page.evaluate(() => innerHeight * 0.75)))
  for (let y = 0; y < height; y += step) {
    await page.evaluate(scrollY => window.scrollTo(0, scrollY), y)
    await page.waitForTimeout(100)
  }
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(250)
}

async function inspectLayout(page) {
  return page.evaluate(() => {
    const doc = document.documentElement
    const overflowing = [...document.querySelectorAll('body *')].filter(el => {
      const rect = el.getBoundingClientRect()
      const style = getComputedStyle(el)
      return rect.width > 0 && rect.height > 0 &&
        (rect.right > innerWidth + 2 || rect.left < -2) &&
        style.position !== 'fixed' && style.position !== 'absolute' &&
        style.overflowX !== 'hidden'
    }).slice(0, 12).map(el => ({
      tag: el.tagName,
      className: typeof el.className === 'string' ? el.className.slice(0, 100) : '',
      text: (el.innerText || '').slice(0, 70),
      left: Math.round(el.getBoundingClientRect().left),
      right: Math.round(el.getBoundingClientRect().right),
    }))
    return {
      viewport: { width: innerWidth, height: innerHeight },
      documentWidth: doc.scrollWidth,
      horizontalOverflow: doc.scrollWidth > innerWidth + 1,
      overflowingElements: overflowing,
      brokenImages: [...document.images].filter(img => img.complete && img.naturalWidth === 0)
        .slice(0, 12).map(img => ({ src: img.currentSrc || img.src, alt: img.alt })),
      header: (() => {
        const header = document.querySelector('.header')
        const search = document.querySelector('.header .searchbar')
        const toggle = document.querySelector('.header .mobile-search-toggle')
        const rect = el => {
          if (!el) return null
          const r = el.getBoundingClientRect()
          return { left: Math.round(r.left), right: Math.round(r.right), top: Math.round(r.top), bottom: Math.round(r.bottom) }
        }
        return {
          className: header?.className || '',
          globalSearchDisplay: search ? getComputedStyle(search).display : 'missing',
          globalSearchRect: rect(search),
          mobileSearchToggleDisplay: toggle ? getComputedStyle(toggle).display : 'missing',
        }
      })(),
      heroTabs: (() => {
        const tabs = document.querySelector('.hero-segmented-tabs')
        const tab = document.querySelector('.hero-seg-tab:last-child')
        const rect = el => {
          if (!el) return null
          const r = el.getBoundingClientRect()
          return { left: Math.round(r.left), right: Math.round(r.right), top: Math.round(r.top), bottom: Math.round(r.bottom) }
        }
        return { container: rect(tabs), lastTab: rect(tab), scrollWidth: tabs?.scrollWidth || 0, clientWidth: tabs?.clientWidth || 0 }
      })(),
      mobileTabBar: (() => {
        const bar = document.querySelector('.mobile-tabbar')
        if (!bar) return null
        const r = bar.getBoundingClientRect()
        return { position: getComputedStyle(bar).position, top: Math.round(r.top), bottom: Math.round(r.bottom), height: Math.round(r.height) }
      })(),
      mainCount: document.querySelectorAll('main').length,
      headingCount: document.querySelectorAll('h1').length,
    }
  })
}

test('live MARCHY mobile and tablet visual/runtime audit', async ({ page }, testInfo) => {
  const consoleErrors = []
  const pageErrors = []
  page.on('console', message => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })
  page.on('pageerror', error => pageErrors.push(error.message))

  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await page.locator('body').waitFor()

  const routeLinks = await page.locator('a[href]').evaluateAll(links => {
    const origin = location.origin
    return [...new Set(links.map(link => link.href)
      .filter(href => href.startsWith(origin))
      .map(href => new URL(href).pathname)
      .filter(path => path && path !== '/'))].slice(0, 12)
  })
  const productRoute = await page.locator('a[href^="/product/"]').first().getAttribute('href').catch(() => null)
  if (productRoute && !routeLinks.includes(productRoute)) routeLinks.push(productRoute)
  if (!routeLinks.includes('/checkout')) routeLinks.push('/checkout')

  const landingResults = []
  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height })
    await loadLazyImages(page)
    const metrics = await inspectLayout(page)
    landingResults.push({ name: viewport.name, ...metrics })
    await page.screenshot({
      path: testInfo.outputPath(`landing-${viewport.name}.png`),
      fullPage: true,
    })
  }

  const routeResults = []
  for (const route of routeLinks) {
    try {
      await page.setViewportSize({ width: 390, height: 844 })
      const response = await page.goto(route, { waitUntil: 'domcontentloaded', timeout: 30_000 })
      await page.locator('body').waitFor({ timeout: 10_000 })
      await loadLazyImages(page)
      const metrics = await inspectLayout(page)
      routeResults.push({ route, status: response?.status(), ...metrics })
      const safeName = route.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').slice(0, 50) || 'home'
      await page.screenshot({
        path: testInfo.outputPath(`route-${safeName}.png`),
        fullPage: true,
      })
    } catch (error) {
      routeResults.push({ route, error: error.message })
    }
  }

  const report = { url: 'https://marchy-khalil.onrender.com', landingResults, routeLinks, routeResults, consoleErrors, pageErrors }
  console.log('MARCHY_LIVE_AUDIT', JSON.stringify(report, null, 2))

  expect(pageErrors, 'uncaught browser page errors').toEqual([])
  expect(landingResults.filter(result => result.horizontalOverflow).map(result => result.name),
    'horizontal overflow at landing-page breakpoints').toEqual([])
  for (const result of landingResults.filter(item => item.viewport.width <= 430)) {
    expect(result.header.mobileSearchToggleDisplay, `${result.name}: mobile search toggle must exist`).not.toBe('missing')
    expect(result.header.mobileSearchToggleDisplay, `${result.name}: mobile search toggle must be visible`).toBe('grid')
    expect(result.header.globalSearchDisplay, `${result.name}: global search must stay collapsed by default`).toBe('none')
    expect(result.heroTabs.lastTab.right, `${result.name}: last hero tab must fit inside its container`)
      .toBeLessThanOrEqual(result.heroTabs.container.right + 1)
    expect(result.heroTabs.scrollWidth, `${result.name}: hero tabs must not require horizontal scrolling`)
      .toBeLessThanOrEqual(result.heroTabs.clientWidth + 1)
  }
  expect(landingResults[1].headingCount, 'landing page should have a primary heading').toBeGreaterThan(0)
  expect(routeResults.filter(result => result.status && result.status >= 500),
    'internal pages returning server errors').toEqual([])
})
