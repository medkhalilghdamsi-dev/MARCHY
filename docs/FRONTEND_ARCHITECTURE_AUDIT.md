# MARCHY — Frontend Architecture Cleanup Audit

**Branch:** `khalil` only  
**Audit date:** 2026-11-06  
**Scope:** frontend source organization, CSS ownership, shared utilities and maintainability. No backend changes.

## Baseline confirmed

- React 18 + Vite 6 + React Router 7; JavaScript/JSX and plain CSS.
- `src/main.jsx` mounts the router, marketplace provider and toast provider.
- `src/app/MarketplaceApp.jsx` owns route composition, lazy loading, page titles and buyer/seller application chrome.
- Buyer route views live under `src/pages/buyer`; seller route views live under `src/pages/seller`; cross-cutting views live under `src/pages/shared`.
- Shared UI is split between `src/components/layout`, `src/components/marketplace`, `src/components/seller` and `src/components/ui`.
- Shared marketplace state is provided by `src/providers/MarketplaceContext.jsx`; browser-demo order behaviour is in hooks and services.
- `src/services/marketplaceService.js` is now approximately 368 lines and owns marketplace demo operations; static seeded offers, Q&A, promotions and notifications live in `src/data/marketplaceDemoData.js`.
- The Playwright suite contains 55 test cases. The repository exposes `npm run build` and `npm run test:e2e`. This audit did not execute either command, so no passing build/test claim is made.

## Confirmed maintainability issues

### 1. Competing global design tokens

Before this cleanup, global token declarations existed in:
- `src/styles/design-system.css`
- `src/styles/base.css`
- `src/styles/quality-refinements.css`
- `src/styles/experience-upgrade.css`
- `src/styles/final-quality.css`

Several files redefined the same forest/green, text, surface, border, radius and shadow variables. The effective value depended on stylesheet import order.

**Change made:** the shared compatibility tokens now live in `design-system.css`. Duplicate global token blocks were removed from the other four stylesheets. The high-contrast preference override in `experience-upgrade.css` remains contextual and intentional.

### 2. Global CSS cascade is too difficult to reason about

The global entry point imports 22 stylesheets. The largest refinement layers include:
- `upwork-ui.css`: approximately 5,055 lines.
- `buyer-ui-polish.css`: approximately 1,417 lines.
- `experience-upgrade.css`: approximately 1,037 lines.

These layers contain cross-page refinements and late overrides. Removing or moving them without selector-ownership and visual regression checks would risk breaking existing pages.

**Change made:** `src/styles.css` now documents the existing import groups and explicitly preserves their current order. No CSS layers or import reordering were introduced.

**Next:** inventory selector ownership, identify duplicate selectors and unused rules, then migrate rules into feature stylesheets in small verified batches. Do not delete a stylesheet based on its name or size.

### 3. Shared storage logic was duplicated

`src/utils/marketplace.js` and `src/utils/storage.js` both implemented safe JSON localStorage reads/writes.

**Change made:** `marketplace.js` now reuses the canonical `readText`, `readJson` and `writeJson` helpers from `storage.js`, preserving its existing exports and fallback semantics for callers.

### 4. Service mixed static seed data with domain operations

The marketplace service previously carried more than 200 lines of static offer, Q&A, promotion and notification seed records alongside its operations.

**Change made:** these records now live in `src/data/marketplaceDemoData.js`; the service imports them and focuses on the demo operations. Unused catalogue imports were also removed.

### 5. Component boundaries need targeted review

The application already has useful route and feature boundaries. The next review should focus on:
- Buyer page composition, especially Home, Search and Product.
- The 600-line marketplace service and its demo-data responsibilities.
- Dense/condensed seller workspace modules.
- UI primitives and their actual stylesheet ownership.
- Re-export wrappers under `src/app` before considering removal.

No component or route has been deleted in this pass.

### 6. Stylesheet candidate requiring usage verification

`src/styles/ui.css` exists in the stylesheet directory but is not imported by the central `src/styles.css` entry point. It is not being deleted in this pass: direct imports and class usage must be checked before deciding whether it is an unused legacy asset or a stylesheet awaiting integration.

## Changes completed in this pass

1. Centralized global compatibility tokens in `design-system.css`.
2. Removed duplicate global token blocks from `base.css`, `quality-refinements.css`, `experience-upgrade.css` and `final-quality.css`.
3. Preserved the high-contrast media-query override.
4. Grouped and documented the global CSS import entry point without changing import order.
5. Reused canonical safe storage helpers from `utils/storage.js`.

## Remaining Phase 1 work

1. Build a source-level import/reference map for stylesheets and UI primitives.
2. Identify duplicate selectors and obsolete overrides with exact file/selector evidence.
3. Migrate CSS from broad refinement layers into feature-owned stylesheets without changing cascade behaviour.
4. Review large and compressed modules for safe extraction opportunities.
5. Consolidate duplicate re-export paths only after import references are verified.
6. Run the production build and all 55 Playwright cases after each meaningful batch.
7. Review the rendered buyer, seller, mobile and RTL experiences before accepting visual changes.

## Guardrails

- Work only on branch `khalil`.
- No backend, API implementation, database or authentication-service changes.
- Preserve routes, user-facing behaviour, demo-data boundaries and accessibility semantics.
- Do not delete files until imports, dynamic imports and runtime references have been checked.
- Do not claim tests pass unless they have actually been run.

## Verification status after the first cleanup batch

- The last application-code cleanup commit checked was `7ef6ba7702f63f5d0b2c464e7c46a67a88bb840f`; later commits in this batch only updated audit documentation.
- At the verification checkpoint, GitHub reported `khalil` diverged from `main`: 232 commits ahead and 1 behind. The branch has since received additional audit-documentation commits. This cleanup did not merge, rebase or modify `main`.
- The Vercel status check on the latest cleanup commit reports `failure` with a target URL indicating `build-rate-limit`. This is a deployment/build quota status, not evidence of a source compilation error. The production build and Playwright suite remain unverified and must be run in an environment with available build capacity.

## CSS selector ownership audit — second pass

A source-level selector inventory was run across all 22 stylesheets imported by `src/styles.css`. This is a static selector inventory, not a browser-computed cascade analysis: repeated selectors can be intentional across breakpoints, themes or refinement layers. The following overlaps are therefore migration candidates, not automatic deletion targets.

### Confirmed high-risk ownership overlaps

| Selector area | Files sharing selectors | Risk / next action |
|---|---|---|
| Product detail layout and gallery | `buyer-ui-polish.css`, `product-page-refinement.css`, `experience-upgrade.css`, `discovery.css` | Highest. Several layout, image-stage, buy-panel, seller-card and mobile-buybar rules are redefined. Establish one product-page owner and migrate after computed-style comparison. |
| Checkout | `checkout.css`, `experience-upgrade.css` | High. Checkout page/layout/steps/panels/summary selectors are repeated. Keep `checkout.css` as feature owner; migrate only verified refinements. |
| Listing and result controls | `result-controls.css`, `experience-upgrade.css`, `operations.css`, `buyer-ui-polish.css` | High. Toolbar, view toggle, filters and result controls have multiple owners. `result-controls.css` should own reusable controls; page-specific layout stays with discovery. |
| Cart and seller grouping | `multi-seller-basket.css`, `shopping.css`, `experience-upgrade.css` | High. Cart summary, checkout action, seller grouping and trust-note selectors repeat. `shopping.css` / `multi-seller-basket.css` should own cart features. |
| Shared header and navigation | `base.css`, `design-system.css`, `seller-workspace.css`, `quality-refinements.css`, `shopping.css` | Medium-high. Some repeats are global shell variants and some are late refinements. Define shell ownership before moving rules. |
| Product cards and catalogue primitives | `base.css`, `discovery.css`, `design-foundation.css`, `seller-experience.css`, `quality-refinements.css` | Medium-high. Repeated product-card/photo/info/name/price/action selectors cross feature boundaries. Keep primitives in shared catalogue styles and page layout in feature styles. |
| Theme variants | `theme.css`, `buyer-ui-polish.css`, `product-page-refinement.css` | Medium. Dark-theme selectors overlap with component refinements. Preserve theme-specific overrides until both themes are visually checked. |

### Concrete duplicate selector examples

- Product page: `.product-detail-layout`, `.product-image-stage`, `.product-buy-panel`, `.product-seller-card`, `.product-mobile-buybar`.
- Checkout: `.checkout-layout`, `.checkout-page`, `.checkout-steps`, `.checkout-summary`.
- Result controls: `.results-toolbar-actions`, `.listing-view-toggle`, `.store-search-sort`, `.product-share-button`.
- Cart: `.cart-summary`, `.cart-checkout-button`, `.cart-trust-note`, `.cart-seller-group-heading`.
- Product cards: `.product-card`, `.product-photo`, `.product-info`, `.product-name`, `.price-row strong`, `.add-btn`.

### File-size and ownership observations

- `upwork-ui.css`: 5,055 lines and approximately 926 unique selectors in the static inventory. This is the largest refinement layer and should be split by component ownership only after usage mapping.
- `buyer-ui-polish.css`: 1,417 lines and approximately 677 unique selectors.
- `experience-upgrade.css`: 1,037 lines and approximately 486 unique selectors.
- `product-page-refinement.css`: 829 lines and approximately 121 unique selectors.
- `seller-workspace.css`: 319 lines and approximately 644 unique selectors (many selector groups are comma-separated).

The counts are approximate because nested at-rules and complex CSS syntax are not fully parsed by the lightweight inventory. They are useful for locating hotspots, not for measuring runtime CSS usage.

### Migration order

1. Product detail: make `product-page-refinement.css` the canonical owner for product detail presentation; compare all media-query and theme variants before removing duplicates from broad refinement files.
2. Checkout: keep `checkout.css` as owner and extract only checkout-specific late overrides from `experience-upgrade.css`.
3. Results controls: keep `result-controls.css` as owner for reusable view toggles, share/compare actions and toolbar controls.
4. Cart: keep `shopping.css` and `multi-seller-basket.css` as owners; move cart-only refinements out of broad layers.
5. Shared shell and product cards: settle shared component ownership and migrate last, since these selectors affect many routes.

**No duplicate selector blocks were deleted in this pass.** The inspected files contain repeated selectors with different declarations and responsive variants; deleting based on selector name alone would change the cascade and risk visual regressions.

## Repeatable CSS audit tooling

Added `scripts/audit-css-ownership.mjs` and the `npm run audit:css` package command. The script reads the stylesheets referenced by `src/styles.css`, tracks selector blocks within supported media/supports/container/layer/scope contexts, and reports cross-file and same-file selector repetitions. It intentionally reports rather than auto-fixes: selector overlap alone is not proof of a harmful conflict.

**Execution is pending.** The script has been committed, but it has not yet been run in a local Node environment or CI. Run `npm run audit:css` and capture its output before using the report to drive selector migrations.

## Product detail component-to-style audit

The actual `src/pages/buyer/ProductPage.jsx` markup was compared with its five main styling layers. This exposed two concrete layout defects that were not visible from selector-name overlap alone:

1. **Purchase controls had four children but a three-column grid.** The JSX renders quantity, Add to cart, Buy Now and Save. The previous grid declared only quantity / flexible CTA / save columns, leaving Buy Now in an implicit grid column. The canonical product-page stylesheet now explicitly defines four columns and styles Buy Now, including disabled and hover states, with responsive widths.
2. **Delivery panel grid did not match the current markup.** The stylesheet expected a direct icon column and content column, while JSX wraps the icon and heading in `.delivery-estimator-header` and renders the explanatory paragraph as a sibling. The canonical stylesheet now uses a single-column delivery panel with a two-column header and readable supporting copy.

These were corrected in `src/styles/product-page-refinement.css`. The product-page component itself and its business logic were not changed. The product page remains marked as unverified in a browser until the build and responsive visual checks can run.

### Product-page migration guardrail

The broad refinement files still contain product-page rules that affect sample status, compare/share feedback, seller metadata, mobile buy-bar spacing, and accessibility. They are intentionally retained for now: moving them across import layers can alter specificity and cascade order. The next safe migration requires browser snapshots at desktop, tablet and mobile widths, plus light/dark and RTL checks.

## Checkout component-to-style audit

Compared `src/pages/buyer/CheckoutPage.jsx` with `src/styles/checkout.css` and found several current JSX controls with no dedicated component styling: saved-address quick-fill, the save-address checkbox row, the demo-review notice, and selected product variant text. Added explicit styles for those elements, including keyboard-visible focus inheritance, selected/hover states, responsive wrapping and reduced-motion handling. Also corrected an over-qualified selector (`.checkout-page .checkout-page .cart-trust-note p`) so the intended trust-note typography applies.

The checkout page component and its order/demo behaviour were not modified. These changes are source-level only and still require browser verification at desktop/mobile widths, in dark mode and RTL.

## Cart component-to-style audit

Compared `src/pages/buyer/CartPage.jsx` with the cart feature styles and later refinement layers. The stock-status element was rendered with three meaningful state classes (`is-good`, `is-low`, `is-out`) but had no matching visual treatment in the cart styles. Added compact semantic status labels for available, low-stock and unavailable inventory in `src/styles/multi-seller-basket.css`, including responsive sizing and theme-aware semantic tokens. No cart state, stock calculation, quantity logic, coupon logic or saved-item behaviour was changed.

The main cart layout, seller grouping, saved-for-later, coupon controls and responsive grid already have styling across the existing buyer stylesheets. They remain distributed across legacy layers; moving them wholesale would risk changing cascade behaviour. Browser verification is still required for dark mode, RTL, narrow screens and real inventory edge cases.

### Cart dark-theme pass

A second review of `theme.css` found that the global dark theme covered the outer cart panels but not several nested surfaces that still used hard-coded light backgrounds. Added dark-theme overrides for seller groups and headings, saved-for-later cards, the illustrative delivery meter, coupon chips and inputs, and all three stock-status states. Active coupon and stock labels receive explicit dark-theme foreground/background pairs for legibility. This is a targeted theme-layer correction; no global token definitions or cart behaviour changed. Visual contrast and RTL still need browser review.

## Shared header component-to-style audit

Compared `src/components/layout/Header.jsx` with the shared header styles. The logged-in account controls (user link, avatar pill and sign-out action) and several search suggestion affordances (category rows, recent searches, empty-result text and arrow affordances) were rendered in JSX without dedicated matching styles. Added these styles to the existing buyer header refinement stylesheet, with compact mobile account treatment and token-based surfaces, borders and semantic colors. Existing search, navigation, account and local-storage logic was not changed. Header dropdown and mobile menu interactions still need browser and keyboard verification.

## Shared navigation and search refinement

Continued the header/search audit with the actual `Header.jsx` markup. The search-scope select had no component-specific layout treatment, making its size and separation from the search input dependent on generic browser select styling. Added explicit desktop/mobile sizing, separator treatment, search icon/input sizing, suggestion-panel scrolling and focus-visible outlines for keyboard users. Added RTL-aware scope separator, submit-button corners and suggestion-arrow direction, plus reduced-motion handling. No search routing, query matching, authentication, navigation or search-history logic was changed.

The CSS remains in the late buyer refinement layer to preserve current import order. Verify search dropdown placement, focus traversal, dark mode, RTL and small-screen layout in a browser before considering this surface complete.

## Mobile buyer navigation refinement

Compared `MobileTabBar.jsx` with its base and theme styles. The fixed tab bar already included the device safe-area inset in its own bottom padding, but `.app-root` reserved a fixed 76px regardless of that inset. On devices with a home-indicator area, the reserved page space could therefore be shorter than the actual fixed navigation height. Updated the app-root bottom padding to include the same safe-area inset, using a fallback for browsers without the environment variable.

Also made the tab bar surface and text use semantic theme tokens, kept all five grid columns shrink-safe, moved badge positioning to logical inline direction for RTL, and added visible keyboard focus, active/pressed states, dark-theme styling and reduced-motion handling. Routes, active-route matching, cart/wishlist counts and navigation behaviour are unchanged. Browser checks at narrow widths, iOS safe-area devices, dark mode and RTL remain outstanding.

### Compact primary-navigation states

Reviewed the real mobile-menu button and navigation markup in `Header.jsx`: the button already exposes `aria-expanded` and `aria-controls`, and the controlled nav has the matching ID. Kept that interaction and all route links unchanged. Added clear expanded-button styling, a contained open-panel shadow, larger/consistent tap targets, active and hover/focus states, dark-theme equivalents and reduced-motion handling. The menu still uses the existing React state and CSS visibility rules; keyboard traversal and device-width rendering require browser verification.

## Shared product-card consistency pass

Inspected the shared `ProductCard.jsx` markup and the actual stylesheet import order. The same card selectors were being adjusted in discovery, design-foundation, quality-refinements and the late-loaded Upwork UI stylesheet. In particular, the discovery stylesheet declared a square image ratio while later rules set a fixed/clamped image height and the final Upwork stylesheet declared a 4:3 ratio. The last declaration won, but the height declaration made the intended ratio ambiguous and different grids could inherit inconsistent geometry.

Added a final, explicitly documented shared card block at the end of `upwork-ui.css` rather than reordering global imports. It establishes a predictable 4:3 image stage with contained product imagery, shrink-safe seller identity/location, a consistent two-line product title, wrapping rating metadata, compact attribute pills, separated price row and aligned comparison/cart actions. Added narrow-phone sizing, logical RTL badge placement, focus handling, dark-theme surfaces and reduced-motion behaviour. This is styling-only: product data, sample labels, seller links, cart/wishlist/compare callbacks and quick-view logic remain unchanged.

The card still intentionally identifies this catalogue content as sample data; no UI copy was changed to imply verified availability, reviews or delivery. Visual regression checks across homepage, category/search grids, related products, dark mode and RTL are still required before calling the pass production-verified.


## Homepage discovery and responsive hierarchy pass

Reviewed the live homepage composition in `src/pages/buyer/HomePage.jsx` against its imported discovery, design-foundation, Upwork UI and late buyer refinement styles. The page uses a four-column category grid, three-step explainer, four-column value proposition, three seller cards, editorial discovery tiles, and a four-item hero proof row. The prior styles did not provide one consistent landing-page responsive contract across all these distinct sections, and some cards could compress without clear text wrapping or a predictable mobile hierarchy.

Added a scoped homepage-only refinement in `buyer-ui-polish.css`:
- Establishes a consistent vertical rhythm for the homepage's main sections without changing shared page spacing.
- Makes category cards shrink-safe and gives the category grid explicit four-column desktop, two-column tablet/mobile behaviour.
- Stacks the how-it-works cards and storefront cards on narrow screens; value cards move from four to two to one column.
- Makes editorial tiles stack on mobile and keeps the three hero search scopes horizontally scrollable instead of compressing their labels.
- Reflows the hero proof row to two columns on mobile and aligns section headings and supporting copy for narrow viewports.
- Adds visible keyboard focus states, bounded/scrollable search suggestions, RTL-aware category arrows, dark-theme card surfaces and reduced-motion handling.

No homepage JSX, search routing, category navigation, product filtering, catalogue data, cart/wishlist behaviour, seller data or backend integration was changed. This is a source-level styling pass; desktop/mobile browser verification, including RTL and dark mode, remains outstanding.


## Marketplace search, category and filter experience

Audited the actual `SearchPage.jsx` result controls and the late buyer refinement styles. The page already supports shareable query/category/price/location/sort filters, grid/list view, product comparison, a mobile filter sheet and pagination. Two refinements were made without changing catalogue or backend behaviour:

- Added a dedicated `marketplace-search-page` scope so future search-page styling can be isolated from shared listing/product surfaces.
- Fixed URL synchronization to observe the current page number. Pagination now writes the selected page into the query string, allowing a copied search URL and browser history to restore the same result page; the existing filter-reset behaviour still returns to page one.
- Added responsive sizing for the search header, result toolbar, view/sort controls, comparison table overflow, empty state and pagination.
- Improved keyboard-visible focus across filter inputs/actions, search suggestions, view controls, pagination and active filter chips.
- Refined the mobile filter sheet stacking, safe-area-aware apply control and scroll containment.
- Added explicit dark-theme treatment for active filter chips, context strip, results toolbar, comparison panel, empty state and mobile filter sheet, plus RTL direction and reduced-motion handling.

No API calls, service methods, product data, filter semantics, sorting rules, cart/wishlist behaviour, or seller logic were changed. Browser verification remains outstanding, especially mobile sheet focus/scroll behaviour, direct-link pagination restoration, RTL and dark mode.


## Seller directory and storefront UX pass — 2026-11-06

- Fixed seller-directory search so its advertised product search now checks each seller's associated sample product names, categories and descriptions as well as seller identity, city, tagline and categories. Existing city/category filters still apply.
- Added scoped buyer-facing seller discovery styling: clearer directory hero and sample-data stats, responsive seller cards, location/category metadata, and a consistent storefront action.
- Added storefront presentation styling for the cover/identity block, sample-status label, seller metadata, category links, share feedback, product filters, search/sort controls, view toggle, active filters and empty state.
- Included responsive layouts, keyboard focus visibility, RTL alignment, dark-theme surfaces and reduced-motion handling.
- No seller onboarding, seller operations, backend, API, data model or authentication behaviour was changed.
- Browser visual verification and production build remain outstanding; the CSS and JSX changes are source-reviewed only.


## Buyer account order history and tracking pass — 2026-11-06

- Reclassified order status filters as an accessible button group with pressed state rather than tab semantics; the changing results region now announces updates politely.
- Refined buyer order history and tracking layout: filter controls, order cards, product summaries, delivery/merchant details, timeline and mobile action layout.
- Added a programmatic current-step marker to the order progress indicator.
- Corrected the tracking contact preview: it previously displayed the order's buyer phone number as though it were the merchant's support number. The preview now clearly states that merchant phone details are not connected.
- Added explicit accessible names to the invoice and merchant-contact dialog surfaces.
- Added dark theme, RTL, responsive and reduced-motion styling for the affected surfaces.
- No backend, API, order persistence model, payment or authentication changes were made.
- Build, browser interaction, keyboard-modal behaviour and mobile visual checks remain unverified in this environment.


## Cart and checkout journey pass — 2026-11-06

- Corrected checkout's data-retention disclosure to match the actual local demo order payload: contact phone, delivery address and notes are stored in this browser's local demo order history; they are not submitted to sellers, couriers or a payment provider.
- Made the checkout step transition respect the user's reduced-motion preference.
- Added dark-theme token-based surfaces, controls, text, review cards, address chips and summary states to the cart and checkout styles.
- Preserved seller-grouped basket review, proportional sample coupon allocation, stock revalidation at demo order submission and the existing sample-order-only flow.
- No backend, payment, authentication, API or live fulfilment behaviour was added or changed.
- Browser visual verification and production build remain outstanding.


## Saved items and account workspace pass — 2026-11-06

- Reworked buyer saved-items presentation into a clearer workspace: search, availability and sort controls; category navigation; bulk add-to-cart action; offer/stock/seller metadata; responsive card hierarchy; filtered-empty state; mobile stacking; RTL and reduced-motion handling.
- Added account profile presentation/edit controls with responsive field grouping and token-based focus states.
- Preserved existing local-demo storage, marketplace offer selection and buyer actions; this pass is presentation/responsive UX only.
- Browser visual verification and production-build verification remain environment-dependent and should be checked on the deployed Render build.


## Seller workspace refinement — 2026-11-06

- Refined the seller workspace shell and legacy seller dashboard visual hierarchy without changing seller data flows.
- Unified sidebar, cards, filters, tables, empty states and profile surfaces with the canonical surface/line/muted tokens.
- Added stronger mobile heading/action behavior and keyboard focus states.
- Added dark-theme consistency and reduced-motion handling.
- Preserved existing seller workspace behavior and local-demo boundaries.


## Seller central operations pass — 2026-11-06

- Unified Analytics, Inventory, Orders, Returns and Finance workspace surfaces under the shared seller visual language.
- Added responsive split-view behavior, compact KPI hierarchy, clearer tables/lists, consistent controls, empty states, status treatments and mobile stacking.
- Added token-based dark-theme treatment, RTL handling and reduced-motion support.
- Preserved existing local-demo storage, order workflow, inventory adjustments, return review and illustrative finance boundaries.


## Seller catalogue and commercial editor pass — 2026-11-06

- Refined product catalogue management into a clearer dashboard-style workflow with stronger listing states, form hierarchy, table readability and responsive behavior.
- Refined Offers & Pricing with clearer product selection, commercial editing hierarchy, indicative-price treatment and responsive controls.
- Added dark-theme, RTL, focus and mobile behavior without changing seller storage or backend contracts.


## Seller configuration, trust and support pass — 2026-11-06

- Refined seller profile/settings into structured configuration sections with clearer field hierarchy, policy grouping and responsive forms.
- Refined promotions/coupons with stronger campaign cards and creation workflow.
- Refined reviews with clearer rating, buyer, merchant-response and reply hierarchy.
- Refined support/dispute centre with case queue, filters, detail conversation, local status/history and mobile behavior.
- Added token-based dark surfaces, RTL handling and focus/reduced-motion support without changing backend contracts.


## Buyer account workspace refinement — 2026-11-06

- Reworked account page hierarchy around profile, quick navigation, address book, recent orders, saved items and recently viewed products.
- Added stronger responsive behavior for two-column/one-column transitions and compact mobile layouts.
- Added consistent token-based surfaces, dark theme, RTL, keyboard focus and reduced-motion treatment.
- Preserved the existing local-demo data model and did not change backend behavior.


## Buyer order detail and tracking workspace refinement — 2026-11-06

Completed a dedicated buyer transaction-detail UI pass without changing order logic, storage, APIs, or backend behavior.

- Reworked order-detail/tracking presentation into a clearer transaction workspace.
- Added a stronger local-demo notice and cancelled-order treatment.
- Added responsive order-status stepper styling with current/completed visual states.
- Improved action hierarchy for reorder, invoice/contact, status-demo controls, and cancellation.
- Structured product lines, seller metadata, recipient information, totals, guarantees, and status history as distinct information blocks.
- Added responsive invoice presentation and print-oriented invoice structure.
- Added seller contact method cards and modal surfaces.
- Added dark-theme, RTL, keyboard/focus, mobile, and reduced-motion coverage.
- Kept the existing local-demo behavior intact; this pass is presentation and interaction-surface styling only.


## Buyer product purchase hierarchy refinement — 2026-11-06

Completed a final product-page commerce hierarchy pass.

- Strengthened the desktop product split between visual discovery and purchase decision.
- Made the desktop visual column sticky while keeping the purchase panel clearly dominant.
- Improved title, price, listing-status, variant, quantity and purchase-control hierarchy.
- Clarified Add to Cart vs Buy Now as distinct actions.
- Improved mobile behavior with a dedicated persistent Add to Cart bar and simplified inline purchase controls.
- Refined gallery borders, active thumbnail treatment and information-section rhythm.
- Added responsive, dark-theme and reduced-motion coverage.
- Preserved all existing product, seller-offer, cart, wishlist, comparison and checkout logic.


## Buyer shell consistency pass — 2026-11-06

- Refined the global footer to match its five actual content groups: brand, discovery, account, seller onboarding, and support. Desktop now uses a dedicated brand column plus four link columns, with clear tablet/mobile reflow.
- Improved footer headings, link rhythm, brand summary width, and legal/footer baseline alignment while retaining existing destinations and copy.
- Standardized the five-item mobile tab bar with consistent icon/label alignment, active-route treatment, accessible focus, badge placement, and safe-area-aware padding for modern phones.
- Added dark-theme and reduced-motion handling to the shared navigation surfaces.
- CSS-only presentation changes; no routing, state, persistence, API, or backend behavior changed.


## Buyer product comparison workspace — 2026-11-06

- Converted the floating compare trigger into a semantic button with expanded/dialog state.
- Added Escape-to-close, focus entry/restoration, keyboard focus containment, background scroll locking, and backdrop dismissal for the comparison dialog.
- Improved comparison table row/column header semantics for assistive technology.
- Reworked the dock and comparison matrix hierarchy for compact desktop layouts and mobile bottom-sheet presentation.
- Added dark-theme, RTL, safe-area, visible-focus, and reduced-motion handling.
- Kept comparison selection, pricing, cart actions, and marketplace data behavior unchanged.


## Buyer checkout journey refinement — 2026-11-06

- Added focus transfer to the active step heading when moving between delivery details and order review, so keyboard and assistive-technology users retain context after the step transition.
- Saved-address choices now expose their full address to assistive technology and no longer display a misleading hard-coded ellipsis for short addresses.
- Refined saved-address selection cards, active/keyboard states, mobile grid behavior, review controls and seller-level summary readability.
- Added RTL and dark-theme alignment for the updated address selection surface.
- Preserved existing local-demo checkout, inventory validation, coupon calculation, order creation and storage behavior.


## Buyer cart usability and stock-state pass — 2026-11-06

- Made the cart item-list label a real section heading, and labelled the order-summary landmark.
- Reused each line's displayed seller stock value for its status and quantity ceiling, avoiding repeated offer lookups during one render.
- Added an explicit accessible warning when a persisted cart quantity is above the currently displayed stock; the existing quantity controls remain available to correct it.
- Exposed coupon-chip selected state through `aria-pressed`.
- Added consistent visible keyboard focus, responsive stock-warning layout, and dark/RTL treatment.
- Preserved cart state, coupon validation, seller grouping, and checkout/demo behaviour. No backend or service code changed.
- Verification is source-level only; production build and browser checks have not been run.


## Buyer order-history accessibility pass — 2026-11-06

- Added an accessible description to the return-request dialog and made its title programmatically focusable when the dialog is opened by assistive technology or future focus-management enhancements.
- Marked the filtered order-results container as a named live region so status/search changes are announced more clearly.
- Preserved the existing return-request workflow, local storage behavior, cancellation and reorder actions.
- No backend, API or service changes. Build and browser verification remain outstanding.

## Buyer saved-items accessibility pass — 2026-11-06

- Added a polite, atomic screen-reader status announcement for the visible saved-product count as search, category, availability and sorting controls change.
- The filtered-empty-state reset now restores the sort order as well as search, category and availability, so the action returns the complete control set to its default state.
- Existing offer selection, add-to-cart, remove, and local-storage behavior is unchanged.
- Source change: `src/pages/buyer/WishlistPage.jsx`.
- Verification is source-level only; production build and browser/assistive-technology checks remain outstanding.

## Buyer order-tracking dialog semantics — 2026-11-06

- Changed the contact modal's backdrop wrapper from a second nested `role="dialog"` to a presentation wrapper. The inner contact panel remains the single labelled modal dialog.
- This removes duplicate dialog announcements without changing contact-preview behavior or order data.
- Source change: `src/pages/buyer/BuyerOrderTrackingPage.jsx`.
- Verification is source-level only; keyboard, screen-reader and browser checks remain outstanding.

## Buyer account interaction semantics — 2026-11-06

- Profile edit and add-address toggles now expose their expanded state and identify the controlled form with `aria-controls`.
- The saved-address section has an explicit heading association, and its address collection is exposed as a labelled list with individual list items.
- Existing profile, address persistence, default-address selection and deletion logic is unchanged.
- Source change: `src/pages/buyer/AccountPage.jsx`.
- Verification is source-level only; production build and browser/assistive-technology checks remain outstanding.


## Buyer tracking progress and dialog-control semantics — 2026-11-06

- Exposed the delivery progress stepper as a labelled group and moved `aria-current="step"` onto the active list item, so the current milestone is announced as the current step rather than only marking its decorative dot.
- Invoice and merchant-contact triggers now expose their expanded state and point to the corresponding dialog IDs.
- Added a programmatic description to the merchant-contact preview dialog.
- Preserved the existing demo order timeline, receipt printing, contact-preview and order actions; no backend or service behavior changed.
- Source change: `src/pages/buyer/BuyerOrderTrackingPage.jsx`.
- Verification is source-level only; modal focus containment/restoration, production build and browser/assistive-technology checks remain outstanding.


## Shared operations table consistency pass — 2026-11-06

- Added a concise table caption and explicit column-header scope to the shared operational order table used across operations workspaces.
- Empty filtered results now expose a polite status announcement for assistive technology.
- Added consistent caption hierarchy, RTL alignment and visible keyboard focus for table links and editable controls.
- Kept order data, courier assignment, status updates and existing workspace routes unchanged.
- Source changes: `src/pages/shared/OperationsShared.jsx` and `src/styles/operations.css`.
- Verification is source-level only; responsive table behavior, browser/assistive-technology checks and production build remain outstanding.


## Shared modal system refinement — 2026-11-06

- Upgraded the reusable `Modal` primitive with a labelled dialog surface, Escape dismissal, keyboard focus containment, initial focus placement, focus restoration and background scroll locking.
- Backdrop dismissal now occurs only when the backdrop itself is pressed; clicks inside the dialog do not close it.
- Added a consistent responsive modal foundation with dark-theme and RTL support, plus a compact bottom-sheet presentation on small screens.
- `ConfirmDialog` inherits the improvements automatically because it composes the shared `Modal` primitive.
- Source changes: `src/components/ui/index.jsx` and `src/styles/base.css`.
- Verification is source-level only; confirm-dialog call-site behavior, browser keyboard testing and production build remain outstanding.


## Shared tab keyboard interaction refinement — 2026-11-06

- The reusable `Tabs` primitive now follows the expected tablist keyboard model: arrow-key movement, Home/End navigation, and a single active tab in the normal Tab sequence.
- Arrow direction reverses in RTL workspaces while preserving the existing controlled `activeId` / `onChange` contract.
- Existing tab labels, click behavior and workspace content rendering remain unchanged.
- Source change: `src/components/ui/index.jsx`.
- Verification is source-level only; keyboard testing across each consuming workspace and production build remain outstanding.


## Buyer account form consistency refinement — 2026-11-06

- Profile and delivery-address forms now expose their purpose through programmatically associated headings and semantic fieldsets with legends.
- Repeated address actions now announce the specific address they affect, rather than exposing several identical “Delete” or “Make default” labels.
- Existing labels, responsive form grids, local persistence, validation and address/profile actions are preserved.
- Source changes: `src/pages/buyer/AccountPage.jsx` and `src/styles/shopping.css`.
- Verification is source-level only; browser form submission, keyboard/screen-reader behavior and production build remain outstanding.


## Checkout form consistency pass — 2026-11-06

- Added explicit label/control associations for every checkout field, including the delivery region, delivery method, payment method and optional notes.
- Added concise contextual guidance to the recipient name, phone and delivery-address fields, connected through `aria-describedby`.
- Standardized checkout field dimensions, surface/border tokens, visible keyboard focus and native invalid-state styling; preserved browser-native required/pattern validation.
- No checkout state, order creation, payment or delivery behavior changed.
- Source changes: `src/pages/buyer/CheckoutPage.jsx` and `src/styles/checkout.css`.
- Verification is source-level only; build and browser/form validation checks remain outstanding.


## Seller listing form consistency pass — 2026-11-06

- Added explicit label/control associations and descriptive hints for product name, category, TND price and description fields.
- The listing-form toggle now exposes expanded state and identifies the form it controls; the form is programmatically associated with its heading.
- Search and category filters now have explicit control IDs and labels.
- Standardized field sizing, keyboard focus, native invalid-state feedback and RTL hint alignment.
- Preserved existing draft/publish state, local persistence and marketplace catalogue behavior.
- Source changes: `src/pages/seller/SellerDashboardPage.jsx` and `src/styles/seller-workspace.css`.
- Verification is source-level only; build, form submission and browser keyboard checks remain outstanding.


## Seller storefront planner form consistency — 2026-11-06

- Grouped business-profile inputs and first-product inputs into separate semantic fieldsets with legends, improving navigation for assistive technology.
- Added a programmatic name to the planner form and retained the existing label wrapping, responsive two-column layout and preview workflow.
- Preserved all temporary form state and image-preview behavior; no application submission or backend workflow was introduced.
- Source changes: `src/pages/seller/SellerLaunchPage.jsx` and `src/styles/seller-experience.css`.
- Verification is source-level only; file-upload preview, browser validation, keyboard/screen-reader checks and production build remain outstanding.


## Seller preview announcement refinement — 2026-11-06

- Removed the full storefront preview from the live-announcement region because it re-renders on every keystroke and could cause excessive screen-reader announcements.
- Kept the concise submit confirmation as the polite status announcement, so users are informed when they deliberately update the preview.
- No preview rendering, input state or submission behavior changed.
- Source change: `src/pages/seller/SellerLaunchPage.jsx`.
- Verification is source-level only; screen-reader behavior and browser checks remain outstanding.
