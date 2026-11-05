# Contributing to MARCHY

## Project scope

This repository is the MARCHY frontend. Work here on buyer, seller-preview, support and operations-preview interfaces. Do not add backend services, credentials, payment processing or live-data assumptions to this project.

## Local setup

Requirements: Node.js 22 (CI version) and npm.

```bash
npm ci
npm run dev
```

## Validation before every commit

```bash
npm run build
npm run test:e2e
```

The Playwright suite starts the Vite dev server automatically. Tests use Chromium and cover route rendering, buyer interactions, mobile layouts, Arabic RTL and accessibility. A green build alone is not a substitute for browser tests.

## Working rules

1. Read [the architecture map](./docs/ARCHITECTURE.md) before moving files or changing shared state.
2. Preserve public route URLs and browser storage keys unless a migration is included.
3. Keep all product, seller, stock, discount, delivery and order fixtures clearly marked as illustrative.
4. Do not introduce a backend, paid service, API key or credential into this repository.
5. Use existing design tokens and shared components before adding another visual pattern.
6. Check desktop, narrow mobile and Arabic RTL for layout changes.
7. Add or update Playwright coverage for every buyer-visible interaction or route change.
8. Keep accessibility names stable where possible; use semantic controls and visible keyboard focus.
9. Avoid unrelated changes in the same commit. Prefer small commits with a single responsibility.
10. Update README/docs when route ownership, scripts, architecture or integration boundaries change.

## CSS changes

The import order in `src/styles.css` is intentional and documented in [ARCHITECTURE.md](./docs/ARCHITECTURE.md). Add styles to the owning layer first. Avoid late global overrides unless the change addresses a cross-page issue.

## Pull request checklist

- [ ] Frontend-only scope; no backend or secret changes.
- [ ] Routes and storage contracts remain compatible.
- [ ] `npm run build` passes.
- [ ] `npm run test:e2e` passes.
- [ ] Mobile and Arabic RTL reviewed.
- [ ] Keyboard focus and accessible names reviewed.
- [ ] Sample/demo data remains honestly labelled.
- [ ] Documentation updated where needed.
