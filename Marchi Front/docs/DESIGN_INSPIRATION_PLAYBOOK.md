# MARCHY — Design Inspiration Playbook

This playbook translates the requested reference libraries into product-specific design rules. It is a research and implementation guide, not a pixel-copy brief. The referenced galleries showcase third-party work; MARCHY should borrow interaction principles and information hierarchy, not reproduce proprietary layouts or assets.

## Reference-to-product mapping

| Reference | What to study | Where it informs MARCHY |
|---|---|---|
| Land-book | Complete page composition, section rhythm, typography, spacing, responsive page flows | Buyer homepage, category discovery, seller landing page, product detail |
| Supahero | Hero hierarchy, first-screen messaging, visual focus, CTA clarity | Homepage hero, seller acquisition page, empty states |
| Pricing Pages | Plan comparison, feature grouping, billing clarity, FAQ placement, decision support | Future seller plans/fees only after commercial terms are defined; product price presentation today |
| Social Proof Examples | Evidence-led metrics, review context, customer stories, proof placement | Product ratings, seller reputation, verified-purchase reviews, trust explanations |
| Really Good Emails | Message hierarchy, concise copy, scannable blocks, accessible CTAs, dark-mode resilience | Future order, shipping, seller onboarding and account notification templates |
| Deck.gallery | Editorial storytelling, narrative sequencing, visual pacing, data presentation | Seller onboarding education, marketplace guide, operations explanations |
| Posts.design | Brand consistency across announcement formats, launch/update content, concise visual storytelling | Seller storefront sharing assets and future marketplace announcements |
| Adfolio | Hook → visual → proof → CTA, clear message/creative alignment | Future campaign landing pages and promotional merchandising; never disguise ads as organic ranking |
| Navbar Gallery | Navigation patterns, dropdown taxonomy, search placement, responsive menus | Buyer global navigation, category navigation, seller portal navigation |
| OGimage.gallery | Social preview composition, legible typography, single focal point, brand recognition | Site-wide and route-specific Open Graph/social sharing assets |

## MARCHY design principles

1. **One primary job per screen.** Buyer pages help discover, evaluate and purchase. Seller Central helps prepare and operate a store. The seller portal keeps its own shell and information architecture.
2. **Hierarchy before decoration.** Every page should make its title, key decision, primary action and supporting information obvious before adding visual effects.
3. **Evidence before persuasion.** Never invent review scores, seller verification, delivery guarantees, sales counts, customer logos or conversion metrics. Label fixtures and prototype-only behavior clearly. Only show social proof when its source and meaning are real and explainable.
4. **Price clarity.** Keep TND formatting consistent; distinguish item price, discount, delivery estimate and total. Never imply a fee is zero unless the checkout calculation proves it.
5. **Navigation that explains location.** Keep global destinations stable, show active state, use predictable labels, make search easy to reach, and keep buyer and seller navigation separate.
6. **Product pages answer buying questions.** Prioritize image quality, exact listing identity, price, seller identity, availability status, variants, delivery estimate, returns/inspection terms and a clear add-to-cart action. Keep secondary information accessible without competing with the purchase panel.
7. **Trust is contextual.** Ratings need a count and source; seller verification needs an actual verification state; delivery information must be identified as estimated or confirmed; review claims must distinguish verified purchases from general feedback.
8. **Responsive behavior is designed, not compressed.** Reorder content for mobile, preserve touch targets, keep purchase actions accessible, and avoid horizontal overflow.
9. **Accessible interaction states are part of the design.** Keyboard focus, labels, error/help text, loading/empty/success states, reduced motion, contrast and RTL layout must be designed alongside default states.
10. **Consistency through shared primitives.** Reuse tokens, buttons, inputs, badges, cards, tables, alerts and status treatments. Feature styles should compose these primitives instead of adding another competing visual language.

## Application priorities

### P0 — Trust and clarity
- Remove unsupported marketplace performance claims from the homepage.
- Distinguish illustrative catalogue content from live inventory and verified seller data.
- Make price, delivery and demo checkout status explicit at the point of decision.

### P1 — Buyer journey
- Refine global navigation and search around buyer tasks and clear category discovery.
- Improve search result scanability, filter visibility, sort controls and empty states.
- Make product detail purchase information easier to scan and compare.
- Reduce cart and checkout friction; keep delivery charges and multi-seller totals transparent.
- Use authentic, attributable reviews and seller proof only when supported by data.

### P1 — Seller journey
- Preserve the independent seller shell.
- Give onboarding a clear sequence, progress indication, save/resume behavior and plain-language requirements.
- Make Seller Central navigation task-oriented and keep each workspace visually consistent.
- Keep operational states, warnings, empty states and next actions explicit.

### P2 — Brand and lifecycle
- Create consistent email templates when real email delivery exists.
- Create reusable seller announcement and campaign formats when there is a real publishing workflow.
- Create route-specific Open Graph assets with a single focal point and a consistent MARCHY brand system.
- Use deck-style narrative structure for help, onboarding and marketplace education.

## Review checklist for every significant UI change

- Can a first-time user identify the page purpose and next action within a few seconds?
- Is the most important information visually dominant without excessive badges or competing CTAs?
- Are all numbers, trust claims, ratings, prices and statuses supported by actual data?
- Does the page handle loading, empty, error, success and disabled states?
- Does the layout work at mobile, tablet and desktop widths?
- Does keyboard navigation and focus order make sense?
- Does Arabic RTL preserve alignment, order, icons and controls?
- Does dark mode preserve contrast and hierarchy?
- Does the change reuse the existing design system instead of introducing another one?
- Are existing route, storage and demo-only boundaries preserved?

## Research sources

- https://land-book.com/
- https://supahero.io/
- https://pricingpages.design/
- https://socialproofexamples.com/
- https://reallygoodmails.com/
- https://deck.gallery/
- https://posts.design/
- https://adfolio.design/
- https://www.navbar.gallery/
- https://www.ogimage.gallery/

The reference galleries are inspiration sources. MARCHY's product requirements, real data contracts, accessibility needs and Tunisia-specific checkout context remain authoritative.



---

## Implementation pass 1 — buyer trust and navigation

Applied to the buyer experience on the `khalil` branch:

- Product cards identify catalogue ratings, review counts, prices, discounts and merchandising badges as sample data. Removed the unsupported verified-merchant badge and unsupported COD/local-dispatch attributes.
- Product detail no longer presents hard-coded governorate fees, delivery windows, free-shipping thresholds, inspection guarantees or exchange guarantees as live services. It tells shoppers which details must be confirmed with the seller.
- Multi-seller comparison labels ratings, stock and offers as illustrative and no longer claims merchants are verified or quotes delivery charges/timing as confirmed.
- Product Q&A makes clear that questions and sample responses are local preview content, not seller messaging or verified answers.
- Checkout explicitly says no seller receives the order, no courier is booked and no payment or buyer-protection service is activated.
- Buyer navigation's seller entry points to the seller introduction page (`/sell`) rather than dropping merchants directly into Seller Central.
- Global search exposes expanded/collapsed state and a labelled suggestions dialog.
- Added regression coverage for these trust and navigation boundaries.

**Validation note:** the Vercel status check for this pass reported a build-rate-limit failure. This is not evidence of a code build failure, but it also means the latest changes have not yet been validated by a successful hosted build. Run the repository build and Playwright suite when CI capacity is available.
