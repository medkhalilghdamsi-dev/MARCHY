# Frontend route and journey QA matrix

This matrix describes the buyer-facing frontend surface and the checks required before a release. It is intentionally explicit about what is automated today versus what still needs manual coverage.

## Release gates

1. `npm ci` completes from the lockfile.
2. `npm run build` completes without warnings that indicate broken imports or unresolved assets.
3. `npx playwright test` passes in Chromium.
4. No horizontal overflow at 360 px, 390 px, 768 px, 1024 px and 1440 px.
5. Keyboard-only navigation can reach every interactive control; focus remains visible.
6. Arabic mode is checked for direction, alignment, forms, navigation, dialogs and mixed Latin/TND content.
7. Demo-only behavior is labelled honestly. No page implies that authentication, payment, inventory, courier tracking or seller verification is live.

## Route inventory

| Route | Page / purpose | Priority | Required checks |
|---|---|---:|---|
| `/` | Buyer homepage and merchandising | P0 | Hero CTA, category discovery, product cards, responsive sections, empty/loading presentation |
| `/search` | Search and product discovery | P0 | Query persistence, suggestions, submit, clear, filters, sort, pagination/load-more if present, no-results state |
| `/category/:category` | Category results | P0 | Correct category context, filter/sort behavior, invalid category fallback |
| `/product/:id` | Product detail | P0 | Gallery, price, quantity, seller context, delivery caveats, add-to-cart, wishlist, related items, invalid ID |
| `/cart` | Multi-seller basket | P0 | Quantity bounds, remove, subtotal, seller grouping, empty cart, mobile summary |
| `/checkout` | Checkout preview | P0 | Required fields, validation, order summary, empty-cart guard, explicit demo disclaimer |
| `/wishlist` | Saved products | P1 | Add/remove, empty state, navigation back to product |
| `/categories` | Category directory | P1 | Search, counts, links, no-results state |
| `/sellers` | Seller directory | P1 | Search, city/category filters, reset, no-results state |
| `/seller/:slug` | Seller storefront | P1 | Store identity caveat, product filters/sort, grid/list, share fallback, invalid seller |
| `/account` | Account overview | P1 | Demo-state explanation, links, empty activity |
| `/orders` | Buyer order history | P1 | Search, status filters, empty state, order links |
| `/orders/:id` | Order tracking preview | P1 | Existing/missing order, cancelled and active states, demo disclaimer |
| `/login`, `/signup` | Authentication preview | P1 | Field validation, password visibility, no false account-creation success |
| `/help` | Help centre | P2 | Topic links and keyboard navigation |
| `/delivery`, `/returns` | Buyer policy guides | P2 | Clear seller-specific caveats and navigation |
| `/sell` | Seller onboarding preparation | P2 | Form preview, image-size validation, no submission claim |
| `/seller-help` | Seller preparation guide | P2 | Guide links and readable mobile layout |
| `/seller-dashboard` | Seller workspace preview | P2 | Demo-state labels, local-only behavior, responsive tables/forms |
| `/operations/delivery` | Delivery operations demo | P3 | Filters, status/courier updates, reset, empty state |
| `/admin` | Platform operations demo | P3 | Search, status filters, summary metrics, reset |
| `*` | Not-found route | P1 | Clear recovery path to shopping |

## Core end-to-end journeys

### J1 — Discover and buy
- Open homepage.
- Search by a product term and choose a suggestion.
- Refine results using at least one filter and a sort option.
- Open a product, change quantity and add it to cart.
- Confirm cart line, seller grouping and totals.
- Continue to checkout preview and verify validation and demo disclosures.

### J2 — Compare and save
- Open a category or search results.
- Add products to wishlist and comparison (where available).
- Navigate away and back; confirm expected persistence.
- Remove a saved item and verify empty-state recovery.

### J3 — Browse a seller
- Open seller directory.
- Filter by city/category and search by seller name.
- Open a storefront, filter its listings and change layout.
- Open a product and return to the same storefront.

### J4 — Mobile shopping
- Repeat J1 at 360 px and 390 px viewport widths.
- Verify header/search access, mobile tab bar, filter sheet, sticky purchase/cart controls and checkout CTA.
- Confirm no clipped controls, unintended horizontal scrolling or keyboard obstruction.

### J5 — Arabic / RTL
- Switch to Arabic.
- Repeat homepage → search → product → cart navigation.
- Verify document direction, breadcrumb order, icon placement, number/price readability, form alignment, dialogs and focus order.

## Automated coverage policy

The Playwright suite lives in `tests/marketplace.spec.js`. Keep tests focused on user-visible behavior and accessible roles/names rather than implementation details. Every new buyer-critical interaction should add or update a regression test in the same change.

A passing browser suite is not proof that every route in this matrix has been manually inspected. Record manual checks separately in the pull request or release notes. Do not mark a route as fully verified until desktop, mobile and (where relevant) Arabic behavior have actually been exercised.

## Frontend/backend boundary

This repository currently provides a frontend prototype. The route matrix intentionally includes preview routes for seller and operations workflows, but these are not production workflows. Backend integration must preserve route contracts and replace local demo state only after API contracts, authentication, permissions, validation and error states are agreed with the backend owner.
