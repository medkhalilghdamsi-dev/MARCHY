# MARCHY documentation index

This folder contains current frontend implementation guidance, product/UX references, and historical or integration-planning documents. Read the status labels below before treating a document as a source of truth.

## Current frontend references

| Document | Purpose | Status |
|---|---|---|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Current source tree, module ownership, runtime flow and CSS entry point | **Canonical frontend architecture** |
| [FRONTEND_ARCHITECTURE_AUDIT.md](./FRONTEND_ARCHITECTURE_AUDIT.md) | Cleanup record, CSS risks, remaining organization work and verification guardrails | **Current cleanup log** |
| [DESIGN_INSPIRATION_PLAYBOOK.md](./DESIGN_INSPIRATION_PLAYBOOK.md) | Translates requested design references into MARCHY-specific UX principles | Current design guidance |
| [UX_ARCHITECTURE.md](./UX_ARCHITECTURE.md) | Buyer, seller and shared experience structure | Product/UX reference |

## Product and integration planning

| Document | Purpose | Status |
|---|---|---|
| [MARCHY_MASTER_ARCHITECTURE.md](./MARCHY_MASTER_ARCHITECTURE.md) | Marketplace operating model, domains, phased launch and target architecture | Strategic target; not a description of implemented backend |
| [MARCHY_API_CONTRACTS.md](./MARCHY_API_CONTRACTS.md) | Proposed frontend/backend data and service contracts | Integration specification; not proof that APIs exist |
| [FRONTEND_HANDOFF.md](./FRONTEND_HANDOFF.md) | Frontend integration notes for a future backend team | Handoff reference; validate against current source before implementation |

## Historical material

| Document | Purpose | Status |
|---|---|---|
| [ANTIGRAVITY_AUDIT.md](./ANTIGRAVITY_AUDIT.md) | Initial pre-cleanup audit and baseline findings | **Historical snapshot — do not use for current file counts or architecture** |

## Maintenance rules

- Keep `ARCHITECTURE.md` aligned with the real source tree and runtime ownership.
- Record cleanup decisions and verification evidence in `FRONTEND_ARCHITECTURE_AUDIT.md`.
- Keep product ambitions and backend target-state proposals separate from statements about what the frontend currently implements.
- Date and label historical audits; never silently present old branch snapshots or test results as current.
- Do not duplicate full architecture descriptions across documents. Link to the canonical source instead.
- Frontend-only implementation changes stay on branch `khalil`; backend work is out of scope for this cleanup.
