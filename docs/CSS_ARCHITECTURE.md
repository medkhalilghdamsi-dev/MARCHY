# CSS architecture and safe refactoring

## Current cascade

The entry point is `src/styles.css`. Import order is intentional: `base.css`, discovery and shopping foundations, design foundation, seller styles, quality refinements, basket and checkout, result controls, experience overrides, then auth and operations styles. Later imports can override earlier declarations. Do not reorder these files without browser comparison.

This is a legacy layered cascade, not yet a fully component-owned CSS architecture.

## Ownership rules

| Concern | Preferred owner |
|---|---|
| Reset, tokens, typography and element defaults | `base.css` |
| Header, footer and mobile navigation | shared chrome styles (target extraction) |
| Product card and product grid | product-card styles (target extraction) |
| Homepage hero and merchandising | homepage styles (target extraction) |
| Search, filters, sorting and comparison | search styles (target extraction) |
| Product detail and purchase panel | product-detail styles (target extraction) |
| Cart and checkout | `checkout.css` and `multi-seller-basket.css` |
| Seller, auth and operations surfaces | existing dedicated stylesheets |

## Duplicate-selector policy

A repeated selector is not automatically redundant. It may be a responsive override, interaction state, theme rule or deliberate correction in a later layer. Before consolidating it, compare declarations, enclosing media/supports rules, pseudo-state and import position. Preserve desktop, tablet, mobile, light/dark, keyboard and RTL behavior. Avoid specificity escalation and `!important` as substitutes for clear ownership.

## Read-only cascade inventory

Run `npm run audit:css` from the repository root. The script follows local imports from `src/styles.css` and lists repeated selectors with file, line and enclosing at-rule context. It does not change source files or fail the build: it is an inspection aid, not a blanket duplicate-rule ban.

## Safe extraction sequence

1. Inventory selectors and cascade context.
2. Extract one coherent family at a time, retaining import order.
3. Compare rendered behavior and run buyer journey browser tests.
4. Remove old rules only after confirming no component relies on them.
5. Keep the global stylesheet entry explicit; do not create files for tiny one-off selectors.

Good first extraction boundaries are the product card, shared header/footer/mobile navigation, homepage hero and product detail. Do not split `experience-upgrade.css` by arbitrary line ranges.
