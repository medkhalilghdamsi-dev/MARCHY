# CSS architecture and safe refactoring

## Current cascade

The entry point is `src/styles.css`. Import order is intentional: `base.css`, discovery and shopping foundations, design foundation, seller styles, quality refinements, basket and checkout, result controls, then the four experience layers (`experience-foundation.css`, `product-experience.css`, `discovery-experience.css`, `buyer-experience.css`), followed by auth and operations styles. The four new files preserve the original experience stylesheet's exact section order and declarations. Later imports can override earlier declarations. Do not reorder these files without browser comparison.

The four experience layers are page-family layers, not yet fully component-scoped styles. This is a clearer, documented cascade, but some older global selectors still overlap and need visual regression checks before relocation.

## Ownership rules

| Concern | Preferred owner |
|---|---|
| Reset, tokens, typography and element defaults | `base.css` |
| Header, footer and mobile navigation | shared chrome styles (existing shared component layer; CSS extraction remains) |
| Product card and product grid | `shopping.css` and `product-experience.css` (consolidation target) |
| Homepage hero and merchandising | `experience-foundation.css` and `buyer-experience.css` (page-family layer) |
| Search, filters, sorting and comparison | `discovery.css`, `result-controls.css` and `discovery-experience.css` |
| Product detail and purchase panel | `product-experience.css` and `buyer-experience.css` |
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

The experience stylesheet has been separated at four existing top-level section boundaries, with balanced CSS blocks and unchanged declaration order. Do not combine the new layers or move rules between them without checking responsive, theme, RTL and keyboard states.
