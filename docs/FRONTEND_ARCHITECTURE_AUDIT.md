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
