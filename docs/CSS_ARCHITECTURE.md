# CSS architecture and safe refactoring

## Current cascade

The global entry point is `src/styles.css`. It imports 21 local stylesheets in a deliberate order:

1. `base-foundation.css` — typography, global tokens, reset and shared foundations.
2. `base-discovery.css` — base category and seller discovery structure.
3. `base-shopping.css` — base product, listing and shopping structure.
4. `base-mobile-navigation.css` — mobile navigation foundations.
5. `discovery.css` and `shopping.css` — original discovery and buyer shopping rules.
6. `design-foundation.css` — shared layout and visual refinements.
7. `seller-experience.css` and `seller-workspace.css` — seller-facing journeys.
8. `quality-refinements.css` — responsive and accessibility refinements.
9. `multi-seller-basket.css` and `checkout.css` — basket and checkout details.
10. `result-controls.css` — search, filters and listing controls.
11. `experience-foundation.css` — cross-page experience foundation.
12. `product-experience.css` — product detail and gallery experience.
13. `discovery-experience.css` — discovery and search experience refinements.
14. `buyer-experience.css` — buyer journey refinements.
15. `auth.css` and `operations.css` — account and operations surfaces.
16. `theme.css` — semantic light/dark theme tokens and theme-specific surfaces.
17. `final-quality.css` — final shared brand palette and cross-page corrections.

Later imports may intentionally refine earlier rules. Do not reorder the imports without checking desktop, mobile, light/dark and RTL rendering.

## Design tokens

The shared board is green, sage and neutral:

- Primary: `#1f5b45`
- Deep primary: `#174735`
- Dark primary: `#123b2d`
- Soft sage: `#edf5f0`
- Light sage: `#f4f8f6`
- Border: `#c9ded1`
- Canvas: `#f7f9f8`
- Surface: `#ffffff`
- Text: `#17212b`
- Muted text: `#65717d`

Use semantic variables from `theme.css` and `final-quality.css` rather than adding new literal colors. Neutral text, white surfaces and dark-mode surfaces are intentional; they are not competing brand accents.

## Ownership rules

| Concern | Preferred owner |
|---|---|
| Reset, typography, base tokens and global elements | `base-foundation.css` |
| Category and seller discovery foundations | `base-discovery.css`, `discovery.css` |
| Product cards, listing and shopping foundations | `base-shopping.css`, `shopping.css` |
| Mobile navigation foundations | `base-mobile-navigation.css` |
| Shared design refinements | `design-foundation.css`, `experience-foundation.css` |
| Product detail and gallery | `product-experience.css` |
| Search, filters and comparison tray | `result-controls.css`, `discovery-experience.css` |
| Homepage and buyer journey | `buyer-experience.css` |
| Cart and checkout | `multi-seller-basket.css`, `checkout.css` |
| Seller workspace and storefront | `seller-experience.css`, `seller-workspace.css` |
| Authentication and operations | `auth.css`, `operations.css` |
| Semantic theme and shared palette corrections | `theme.css`, `final-quality.css` |

## Duplicate-selector policy

A repeated selector is not automatically redundant. It may be a responsive override, interaction state, theme rule or deliberate correction in a later layer. Before consolidating it, compare declarations, enclosing media/supports rules, pseudo-state and import position. Preserve desktop, tablet, mobile, light/dark, keyboard and RTL behavior. Avoid specificity escalation and `!important` as substitutes for clear ownership.

The read-only inventory currently reports repeated selector occurrences across the imported layers. This is a review list, not a claim that all repeats are defects. The most repeated selectors include product-card primitives and shared layout elements; many entries are breakpoint-specific. The next consolidation pass should target identical declarations in the same context first, not remove responsive rules wholesale.

## Read-only cascade inventory

Run `npm run audit:css` from the repository root. The script follows local imports from `src/styles.css` and lists repeated selectors with file, line and enclosing at-rule context. It does not change source files or fail the build: it is an inspection aid, not a blanket duplicate-rule ban. CI runs this audit on every push and pull request targeting `main`.

## Safe extraction sequence

1. Inventory selectors and cascade context.
2. Extract one coherent family at a time, retaining import order.
3. Compare rendered behavior and run buyer journey browser tests.
4. Remove old rules only after confirming no component relies on them.
5. Keep the global stylesheet entry explicit; do not create files for tiny one-off selectors.

The original foundation stylesheet and experience stylesheets have been separated at existing section boundaries. Some global selectors still overlap intentionally. Continue consolidating one family at a time, with automated and manual visual checks before deleting legacy rules.
