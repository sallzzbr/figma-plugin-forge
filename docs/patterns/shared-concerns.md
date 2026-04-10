# Pattern: Shared Concerns

Do not start from a shared package. Start from duplicated needs.

## Extract only after real reuse

Good candidates:

- message helpers used across multiple plugins
- domain types shared by multiple flows
- design tokens or UI primitives with real cross-plugin reuse

Bad candidates:

- plugin-specific controllers
- one-off state machines
- fake "shared" layers created before a second consumer exists

## Rule

Document the contract before you extract the concern. Otherwise you only move confusion into another folder.

## Related

- [messaging-bridge](messaging-bridge.md) — message helpers are a common extraction candidate
- [runtime-split](runtime-split.md) — understand the boundary before extracting across it
- [source-of-truth](../guides/source-of-truth.md) — ownership rules for shared vs local
