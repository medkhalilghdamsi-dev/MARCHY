# MARCHY Design System

This directory owns the shared visual language and reusable interface contracts.

## Rules
1. Tokens live in `src/styles/tokens.css`; do not add one-off brand colours, spacing scales or shadows to feature CSS.
2. Shared primitives are domain-neutral. Marketplace-specific compositions are patterns.
3. Components expose explicit variants and sizes; avoid consumer-specific selectors and styling through DOM ancestry.
4. Interactive components need keyboard, focus-visible, disabled and loading behaviour where applicable.
5. Use logical CSS properties to support LTR and RTL.
6. Keep visual and interaction states consistent across buyer and seller surfaces.

## Initial component contracts
| Component | Contract |
|---|---|
| Button | variant primary/secondary/tertiary/danger; size sm/md/lg; loading and disabled |
| IconButton | Accessible label required; key navigation targets >= 44px |
| TextField | Label, hint, error, required, disabled; error linked by aria-describedby |
| SearchField | Label, clear action, suggestions listbox, keyboard navigation and Escape |
| Select | Label, hint/error and native keyboard behaviour |
| Badge | Semantic status/category; never communicate meaning through colour alone |
| Dialog/Drawer | Focus management, Escape close, focus restoration and labelled title |
| QuantityStepper | Labelled increment/decrement, min/max and announced value |
| EmptyState | Explain what happened and provide one useful recovery action |
| ProductCard | Image, name, price, seller, truthful status, save and add actions |

## Token usage
Use semantic variables such as `--color-text`, `--color-surface`, `--color-primary`, `--space-4`, `--radius-card` and `--shadow-sm`. Legacy aliases remain during incremental migration.