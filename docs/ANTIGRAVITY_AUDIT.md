# MARCHY Frontend — Historical Phase 0 Audit

_Date: 2026-11-05 · Branch: `frontend/marchy-production-upgrade` · Scope: frontend only (React 18 + Vite 6 + React Router 7)_

This audit was produced **before** any rewrite. All figures were measured on the repository as found
(commit `0254a11` plus an uncommitted working tree that was snapshotted in `5a5b01c`).

---

## 1. Current architecture

| Area | What exists |
| --- | --- |
| Stack | React 18.3, React Router 7 (`BrowserRouter`), Vite 6, Playwright + axe-core. No linter, no unit tests, no TypeScript. |
| Entry | `main.jsx` → `BrowserRouter` → `MarketplaceProvider` → `ToastProvider` → `App` (a 1-line re-export of `app/MarketplaceApp.jsx`). |
| Routing | 25 flat `<Route>`s in `MarketplaceApp.jsx`, all `React.lazy`. Buyer + seller + ops routes share one flat table and one chrome (buyer header/footer/tab-bar), including the seller dashboard. |
| State | One context (`useMarketplaceState`): language, theme, cart, wishlist. Everything else (orders, compare list, recently viewed, seller drafts, recent searches, view mode, coupon) is read/written ad hoc from `localStorage` inside page components. |
| Data | `data/products.js` (30 products, 72 hot-linked Unsplash URLs), `data/sellers.js` (10 sellers, derived from product category). Orders are seeded in `hooks/useDemoOrders.js` (5 aggregate rows, no line items, no timeline). |
| i18n | `i18n/translations.js` — 686-line dictionary keyed by the exact English string; `translateTree()` deep-clones every rendered React element on every render and substitutes text. |
| Styling | 18 CSS files, 313 KB source, 3 792 rules, 98 `!important`, imported in a fixed cascade order from `styles.css`. |
| Pages | `ShoppingPages` (617 lines / 66 KB), `SellerPages`, `DiscoveryPages`, `SupportPages`, `OperationsPages`. Written as minified one-line JSX. |
| Build | `vite build && node scripts/create-route-fallbacks.mjs` (hard-coded list of 72 route directories copied from `index.html`). |

---

## 2. Findings that make the app **broken today**

1. **`CartPage` crashes on render.** A previous edit pasted coupon logic into the body of `CartPage` that references
   `appliedCoupon`, `couponCode`, `setAppliedCoupon`, `toast` — none are declared (`ShoppingPages.jsx` ~L455-479).
   `/cart` hits the `ErrorBoundary`.
2. **`CheckoutPage` crashes on render** for the same reason (`appliedCoupon`, `discountAmount`, `finalTotal` undefined).
   The buyer journey (cart → checkout → demo order → tracking) is therefore not possible.
3. **`.last-run.json` from the previous session lists 17 failing Playwright tests**; a fresh baseline is recorded in §10.
4. **Seller workspace tabs "Insights" and "Settings" are placeholders** even though `SellerAnalytics.jsx` (312 lines) and
   `SellerSettings.jsx` exist and are imported — they are never rendered (dead code).
5. **Operations pages are not translated.** `OperationsPages` takes a `language` prop but routes render
   `<DeliveryOperationsPage />` without props, so `translateTree(…, undefined)` returns English in FR/AR.
6. Mixed line endings (LF blocks pasted into CRLF files) — some files have both.

---

## 3. Duplicated code

* **Image fallback handler** `onError={e=>{e.currentTarget.onerror=null;e.currentTarget.src='/product-placeholder.svg'}}` copy-pasted ~20×.
* **Share-link logic** (`navigator.share` → clipboard → `execCommand`) duplicated in `ProductPage` and `SellerPage`.
* **Modal behaviour** (focus trap, scroll lock, Escape, focus restore) hand-written separately for quick-view, lightbox and
  the mobile filter sheet — three divergent implementations, none using `inert`/`<dialog>`.
* **Seller grouping** (`[...new Set(cart.map(i=>sellerForProduct(i).slug))].map(…)`) duplicated in `CartPage` and `CheckoutPage`.
* **Cart subtotal / item-count reducers** duplicated in 6 places.
* **Order list/filter/search UI** duplicated in `BuyerOrdersPage`, `AdminOperationsPage`, `DeliveryOperationsPage`, seller order tab.
* **Grid/list view toggle, localStorage view persistence, "category → icon/tone" tables** duplicated in Home, Categories, Search, Seller storefront.
* **Compare list** is read/written to `localStorage` independently by `SearchPage` (state + effect) and `ProductPage` (direct reads), so they disagree until a reload.
* **Per-file import headers** — every page file imports the same 8-10 modules, most unused (`useLocation`, `useRef`, `searchSynonyms`, `readText`, …) — see §9.

## 4. Duplicated / contradictory CSS

| Problem | Evidence |
| --- | --- |
| 18 stylesheets stacked as overrides | `base.css` (39 KB) → `design-foundation.css` → `experience-upgrade.css` (59 KB, 36 `!important`) → `quality-refinements.css` → `final-quality.css` (16 `!important` in 3 KB). Later files redefine the same selectors (`.primary-btn`, `.product-card`, `.filters`, `.seller-dashboard-*`). |
| Two design-token sets | `base.css` `:root` (old "orange commerce identity") and `design-system.css` `:root` (forest green). |
| **Legacy orange brand is hidden behind a variable alias** | `--orange: #1f5b45` in `base.css` — the variable named *orange* actually holds forest green, while 172 other places still hard-code `#f36b35`, `#fff6f1`, `#efb49a`, `#c9471d`, `#f5c3ad` (focus rings, hover fills, box-shadows). |
| Two Google-Fonts `@import url()` in CSS | `base.css` L1 and `design-system.css` L7 — render-blocking, chained behind the CSS download, loads Manrope + DM Sans twice, plus an unused `preconnect` in HTML. |
| RTL done with `.is-rtl` overrides | Physical properties (`margin-left`, `left:`, `text-align:left`) are used throughout; RTL fixes are bolted on per component and Arabic falls back to `Tahoma, Arial`. |
| Minified CSS (one rule per line / whole files on one line) | `base.css` L26+ is a single 20 KB line — unreviewable. |
| Dead selectors | `.detail-layout`, `.detail-info`, `.hero`, `.cart-items` etc. in `base.css` are no longer rendered. |

## 5. Broken / missing UX — buyer

**Broken**: cart and checkout crash (see §2). Compare tray only exists on `/search`, selection cannot be seen elsewhere.
Search autocomplete in the header and in `/search` are two different implementations; the combobox declares `role="combobox"` but
has no `aria-activedescendant`, arrow-key navigation or option semantic (`role="option"` on `<a>`). Quick-view traps focus with `document.querySelector` for the dialog.
Footer logo is a letter "M" while the header uses the SVG mark. A `&&` expression in the nav uses `categories.slice(1,5)` (hard-coded 4 categories).

**Missing**:
* Home: no explicit "what / why / what can I buy / why trust" hierarchy; "Deals" and "recommendations" are the same sample list; no seller discovery strip with ratings; trust signals are absent.
* Search: no recent-search management in the page, no keyboard-navigable suggestions, no rating / availability / seller / badge filters, no sort by rating, no result-count live region discipline, no saved filter chips for rating.
* Product: no variants, no review summary distribution on the page header, no stock number, no delivery estimate, no return policy block, no sticky anchors, no zoom (only a lightbox), no pinch support, no recently-viewed rail on the PDP.
* Seller storefront: no verification state, rating, response time, policies, follow action, reviews, delivery info, category sidebar.
* Cart: **no coupon (broken), no save for later, no delivery estimate, no free-delivery progress, no per-seller delivery, no undo**.
* Checkout: single 2-step form — no contact/address/delivery-method/payment-method sections, no seller shipments, no inline validation (browser-native only), no confirmation page (jumps straight to tracking).
* Orders: no order detail page with line items, address, timeline, invoice; tracking has 4 static steps.
* Account: guest-only, no addresses / preferences / saved searches.
* Help: static FAQ, no contact/ticket form, no search.

## 6. Broken / missing UX — seller

The "seller application" is **one tabbed page** (`/seller-dashboard`, 6 tabs held in `useState`, so deep links/refresh/back-button do not work).
* Overview shows only three counts (catalogue size, categories, city).
* Products: draft form with 4 fields (name, free-text category, price, description) — no SKU, images, variants, sale price, inventory, attributes/specifications, publish state, delete confirmation (uses `window` array filter), pagination.
* Orders: a `<select>` per row; no filters, no detail view, no customer info, no line items, no fulfilment/shipping state, no timeline, no bulk actions.
* No inventory, promotions, reviews, notifications, support, onboarding flow.
* "Insights" / "Settings": placeholder text (see §2.4). The existing `SellerAnalytics` / `SellerSettings` components are unreachable.
* Seller onboarding (`/sell`) is a single form that "previews" a storefront; nothing persists and there is no stepper.
* Seller tables overflow horizontally on mobile (`seller-dashboard-listing-row` grid collapses without a card representation).
* Seller chrome reuses the buyer header; the seller has no own navigation, so moving between seller sections needs the in-page tab strip.

## 7. Accessibility issues

* Modals (`quick view`, `lightbox`, `filter sheet`) are `div role="dialog"` with custom focus code, no `inert` on the background; focus restore uses a captured `activeElement` that is often `body`.
* Header search suggestions: `role` semantics incomplete, no `aria-expanded/aria-controls` wired to the actual input in `Header`, `onMouseDown` close hacks (keyboard users cannot reach "Close suggestions").
* `translateTree` translates `aria-label` / `title` but not `alt`; `alt` text on gallery images stays English in FR/AR.
* Unicode glyphs (`⌕ ♡ 🛒 ☷ ▦ ⤢ ↗`) are used as icons — read out by screen readers (some are `aria-hidden`, many are not).
* `<i aria-live="polite">` for cart count inside a link; toast container `role="region" aria-live` with each toast also `role="status"` (double announcement).
* Heading order: `h3` "Filters" before `h2` in the filter sheet; Footer groups use `<b>` instead of headings; several pages have two `h1`.
* Colour contrast: light-grey microcopy at 9–10 px (`.detail-perks`, `.cart-item-info small`) fails WCAG AA; a prior session patched some with `!important`.
* No visible `:focus-visible` system; focus styles are per component and often `outline:none`.
* `html lang`/`dir` are set from state but `<main dir>` on `app-root` duplicates it; `.is-rtl` hacks.
* Dark mode: `theme.css` overrides ~37 rules; many components keep hard-coded `#fff` backgrounds → low contrast in dark mode.
* Skip link exists, but `<main id="main-content">` is rendered by each page (some error paths forget it).

## 8. Performance issues

Baseline build (`npm run build`, measured 2026-11-05):

| Asset | Raw | Gzip |
| --- | --- | --- |
| `index-*.css` (all 18 files bundled into one blocking stylesheet) | **294.79 kB** | 53.84 kB |
| `index-*.js` (app shell + data + 686-entry i18n dictionary + chrome) | 132.68 kB | 40.59 kB |
| `vendor-*.js` | 181.08 kB | 59.69 kB |
| `ShoppingPages-*.js` | 60.73 kB | 15.31 kB |
| `SellerPages-*.js` | 28.85 kB | 7.48 kB |
| other page chunks | 12–20 kB each | |

* **Route splitting is only partly effective**: five whole page modules are lazy-loaded, and then *each page is lazily wrapped again* from the same module (`Home`, `SearchPage`, `ProductPage`, … ) – so `/` downloads the code for Search, Product, Cart and Checkout (66 KB). Seller routes download the whole 28 KB module.
* The i18n dictionary (80 KB source) and the product catalogue are in the entry chunk.
* **Render-blocking fonts**: 2× `@import url(https://fonts.googleapis.com/…)` inside CSS (see §4). No `font-display` budget for Arabic.
* **Images**: 72 hot-linked full-size Unsplash URLs (`w=900&q=85`; hero `w=1400&q=90`) — no `srcset`/`sizes`, no `width`/`height` attributes on most `<img>`, so every product card downloads 900 px wide even at 160 px (layout shift + data waste). Hero image is `loading="eager"` but without `fetchpriority`.
* `translateTree()` runs `cloneElement` over the whole tree on every render of every page and of `Header`, `Footer`, `MobileTabBar` and every `ProductCard` (30+ per grid).
* `MarketplaceContext` provides a new object every render (no `useMemo`) → every consumer re-renders when any state changes; `addToCart`, `toggleWish` etc. are re-created.
* Search page recomputes `results` with `useMemo` but depends on un-memoised derived arrays; synonyms table is rebuilt per keystroke inside `searchTextMatches`.
* `useDemoOrders` is a hook with its own state, mounted in several pages — each instance has its own `storage` listener and writes the whole array on every render (`useEffect(() => writeJson(...), [orders])` plus a second write in `updateOrder`).
* Tests run the Vite dev server (`webServer.command: npm run dev`), not the production build.

## 9. Dead code / suspicious code

* `MarketplaceApp.jsx`: `ShoppingPages`, `DiscoveryPages`, `SellerPages`, `SupportPages`, `OperationsPages` lazy constants are unused; unused imports `useState`.
* `SellerPages.jsx`: `SellerAnalytics`, `SellerSettings`, `useRef`, `useMemo`, `useLocation`… imported and unused. `SimplePage` in `SupportPages.jsx` is never used.
* `MarketplaceChrome.jsx`: `const { sellers } = { sellers: [] }` in `Footer` (dead), `useRef` fine, `badgeColors` references `badge-gold/green/red/earth` classes that exist only in legacy CSS.
* `ProductCard` receives a `language` prop that it ignores; most call sites pass it anyway.
* `utils/marketplace.js` exports `searchSynonyms` / `readText` that most files import but never use.
* `products.js` has both `tag: 'Sample item'` (unused) and `seller: 'Demo seller · Tunis'` (unused, superseded by `sellerForProduct`).
* `public/_redirects` is a Netlify rule (`/* /index.html 200`) that Render static sites ignore; `vercel.json` covers Vercel; `scripts/create-route-fallbacks.mjs` covers Render by copying `index.html` into 72 directories (list hard-coded, must be edited whenever a route is added).
* `docs/FRONTEND_HANDOFF.md` and `README.md` describe features (analytics tab, settings tab) that are not reachable.
* `test-results/` was untracked and not git-ignored (now ignored).
* Two CI workflows (`buyer-frontend-qa.yml`, `frontend-build.yml`) both run the full Playwright suite on `main`; neither runs a lint step because none exists.
* `package.json` has no `engines`, no `lint`, `test`, `preview:e2e`, and `@playwright/test`/`@axe-core/playwright` are in `devDependencies` but `vite`/`plugin-react` are listed above them unsorted.

## 10. Routing

| Issue | Detail |
| --- | --- |
| Seller area is one route | `/seller-dashboard` (tab state in React, not URL). No `/seller-dashboard/orders`, etc. |
| No route-level layout | The seller dashboard renders inside buyer header/footer/mobile tab bar. |
| Invalid product/seller/order ids | Each page renders its own ad-hoc "not found" (some without `<main>`/`h1`); `/category/xyz` handled inside `SearchPage`. |
| Direct-hit fallbacks | `create-route-fallbacks.mjs` hard-codes 72 routes (+`404.html`). Routes that are not in the list (e.g. `/orders/MC-1234`) rely on `404.html` which Render serves with status 404. |
| `PageTitleManager` | Duplicates the route table as an `if/else` chain keyed on `pathname`. |
| `ScrollToTop` | Scrolls on every pathname change (including back/forward → loses scroll position). |
| Header closes menus on `location.search` change | Typing in search updates `?q=` and collapses the open mobile menu. |

## 11. State problems

* `localStorage` access is scattered (`readJson` in render bodies — e.g. `Home` reads `marchy-recently-viewed` on **every render**).
* Coupon state was half-moved into context and half-left in `CartPage` (§2).
* Cart items store a full copy of the product (price, name, image) → stale prices if the catalogue changes; no variant key in cart line identity (`item.id` only), no max-stock, no `savedForLater`.
* Multiple `useDemoOrders()` instances can diverge within one tab (only cross-tab `storage` events are synced).
* Language is applied to `document.documentElement` inside an effect (flash of wrong `dir` on first paint for returning Arabic users); `index.html` inline script only restores `theme`, not `lang/dir`.
* No error/loading state for async-looking operations (all are sync; no simulated latency, so skeletons never display).

## 12. Technical debt summary

1. Rebuild CSS into one token-driven layer; delete 18 legacy files.
2. Replace `translateTree` with a `t()` hook (keeps the existing dictionary as the English-key store).
3. Promote seller area to a nested-route application with its own layout.
4. Introduce a UI kit (`components/ui`) so Modal/Drawer/Tabs/Toast/Dropdown/etc. exist once, keyboard-accessible.
5. Split page monoliths into one file per page; split context into preferences / shop / orders / seller stores.
6. Fix the broken cart/checkout, then expand to a real multi-seller checkout.
7. Self-host fonts (OFL, free), add `srcset` to Unsplash images, remove double lazy loading.
8. Add ESLint (free), a route manifest shared by router, title manager and the static-fallback script, and an e2e suite that runs against the production build.

---

## 13. Baseline test & build results (before changes)

| Check | Result (as found) |
| --- | --- |
| `npm run build` | ✓ succeeds (1.8 s) — 61 modules, CSS 294.79 kB / 53.84 kB gzip, entry JS 132.68 kB / 40.59 kB gzip |
| `npm run lint` | not available (no linter configured) |
| `npm test` | not available (only `test:e2e`) |
| `npx playwright test` (46 tests, Chromium, 4 workers, dev server) | **35 passed · 11 failed** (1.5 min) |

Failing tests at baseline and root cause:

| Test | Root cause |
| --- | --- |
| product quantity, cart updates and wishlist persist | `/cart` crashes (undefined coupon state) |
| cart groups products by seller | `/cart` crashes |
| checkout creates shared demo seller orders | `/cart` crashes → no "Continue to checkout" link |
| delivery ops & admin share status / courier | `language` prop never passed to `OperationsPages` → i18n/headings not rendered consistently |
| merchant order workspace shares updates with delivery ops | same |
| buyer account can follow shared demo order status | same (tracking panel rendered in the wrong language after a previous test's `localStorage`) |
| connected operations respect French/Arabic | same |
| buyer order history searches / FR+AR | `BuyerOrdersPage` heading depends on the missing `language` prop |
| core shopping pages have no serious a11y violations | `/sell` breadcrumb text `#8d9eaa` on `#f6f7f8` = 2.57:1 contrast |
| product detail gallery single-image fallback | test expectation is stale — catalogue now ships 3 images for product 1 |

> **Environment note:** loopback connections are blocked inside the command sandbox (`EACCES`), so every Playwright run in this
> engagement is executed with sandbox bypass (the dev/preview server and the browser must be able to talk to each other).
