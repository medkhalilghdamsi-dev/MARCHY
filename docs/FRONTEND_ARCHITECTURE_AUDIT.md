# MARCHY — Frontend Architecture Cleanup Audit

**Audit date:** 2026-11-06  
**Branch:** `khalil` only  
**Scope:** frontend source organization, CSS ownership and maintainability. No backend changes.

## Current architecture baseline

- React 18, Vite 6, React Router 7; JavaScript/JSX and plain CSS.
- `src/main.jsx` mounts the router and global providers.
- `src/app/MarketplaceApp.jsx` owns route composition, lazy loading, page titles and buyer/seller chrome.
- Route pages are separated into `src/pages/buyer`, `src/pages/seller` and `src/pages/shared`.
- Shared UI is separated into layout, marketplace, seller and UI component folders.
- Marketplace state and toast notifications are owned by `src/providers`.
- Platform adapters and API contracts are isolated under `src/services/platform`.
- Global CSS is loaded through `src/styles.css`.

## Completed cleanup

### 1. Removed obsolete frontend compatibility and legacy seller files

The cleanup commit removed 18 obsolete files from the prior architecture, including:
- Two provider aliases under `src/app`.
- Root-level component compatibility wrappers.
- Obsolete page aggregation files.
- The legacy seller dashboard and its dedicated legacy components.

The active Seller Central route and workspace modules were retained. The legacy `/seller-dashboard` URL still redirects to `/seller-central`.

### 2. Refreshed architecture documentation

`docs/ARCHITECTURE.md` now reflects the actual folder structure and current module ownership. It no longer documents deleted aliases or outdated CSS filenames.

### 3. CSS entry point inventory

`src/styles.css` imports 36 stylesheets in a deliberate order after splitting two large refinement layers into eight direct imports each:
- Foundation: design system and base
- Buyer: discovery and shopping
- Seller: seller experience and workspace
- Commerce: product, basket, checkout and result controls
- Shared: auth, operations and theme
- Late refinements: final quality, buyer polish, product refinement, eight buyer-polish slices, eight Upwork UI slices and seller portal

The broad refinement layers contain late overrides. Reordering or moving selectors without visual regression checks is unsafe.

### 4. Unloaded stylesheet identified and removed

`src/styles/ui.css` was not imported by `src/styles.css`; the central entry point imports 36 other stylesheets. It was an orphaned UI-kit stylesheet and has been removed rather than kept as misleading, inactive code.

## Remaining CSS work

### 5. Large stylesheet ownership hotspots

Two large, broad refinement layers have now been split into feature-oriented files:
- The former `upwork-ui.css` (approximately 135 KB) is eight slices covering navigation/discovery, orders/account, product/checkout, marketplace widgets, buyer funnel, workspaces and shared cascade.
- The former `buyer-ui-polish.css` (approximately 123 KB) is eight slices covering homepage foundation, header/search, product detail, shared hierarchy, navigation refinements, home discovery, search results and buyer chrome.

Both source files were reconstructed from their new slices and compared byte-for-byte with their original Git blobs before removal. No CSS declarations or selectors were intentionally changed. The current largest broad files are `experience-upgrade.css` (approximately 59 KB) and `base.css` (approximately 42 KB); these need ownership review before any further movement. Browser regression is still required before treating either split as visually verified.

1. Run `npm run audit:css` and inspect repeated selectors with their declarations and media-query contexts.
2. Map selector ownership to actual JSX component usage.
3. Consolidate duplicated rules in small batches, preserving responsive and RTL behaviour.
4. Move feature-specific rules out of broad refinement files only when cascade equivalence is verified.
5. Do not combine all CSS into one file or introduce CSS Modules as a broad migration during cleanup.

## Remaining source organization work

1. Review large and dense modules for safe extraction opportunities.
2. Identify unused assets and utilities with import and runtime-reference evidence.
3. Review overlapping documentation and retain one canonical architecture map plus focused audit/handoff documents.
4. Confirm all route imports and redirects remain valid after legacy removal.

## Verification status

The repository exposes:
- `npm run build`
- `npm run test:e2e`
- `npm run audit:css`

A successful result must come from an actual completed run. Do not infer test success from a queued GitHub Actions workflow. The stylesheet split has not been considered visually verified until the workflow for the split commit completes its Playwright suite.

## Guardrails

- Work only on branch `khalil`.
- Do not inspect, modify, merge, delete or deploy from other branches.
- No backend, database, API implementation or authentication-service changes.
- Preserve routes, buyer/seller behaviour, accessibility semantics, responsive layouts and Arabic RTL.
- Verify imports, dynamic imports and runtime references before deleting files.
- Do not claim tests pass unless they have actually completed successfully.


### Byte-preserving split of the Upwork UI layer

The former `src/styles/upwork-ui.css` was divided into eight focused files and the original import slot was replaced by direct imports in the same sequence. The CSS declarations and their relative order were preserved; this is an organizational change, not a selector redesign or visual refresh.

- `upwork-navigation-discovery.css`
- `upwork-orders-account.css`
- `upwork-discovery-sections.css`
- `upwork-product-checkout.css`
- `upwork-marketplace-widgets.css`
- `upwork-buyer-funnel.css`
- `upwork-workspaces.css`
- `upwork-shared-cascade.css`

The stylesheet ownership audit scans the direct imports in `src/styles.css`, so all eight files remain visible to CI. Browser regression is required before treating the split as verified.


#### Byte-preserving split of the buyer polish layer

The former `src/styles/buyer-ui-polish.css` was divided into eight focused files and its original import position was replaced with direct imports in the same order:

- `buyer-home-foundation.css`
- `buyer-header-search.css`
- `buyer-product-detail.css`
- `buyer-shared-hierarchy.css`
- `buyer-product-navigation.css`
- `buyer-home-discovery.css`
- `buyer-search-results.css`
- `buyer-chrome.css`

As with the Upwork layer, this changes file organization only. The selector ownership audit continues to scan all direct imports from `src/styles.css`.
