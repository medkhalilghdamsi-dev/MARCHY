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
