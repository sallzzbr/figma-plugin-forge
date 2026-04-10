# Pattern: Local Audit

Use this when the plugin inspects existing nodes and returns findings without requiring a backend.

## Good fit

- design system audits
- accessibility checks
- naming and structure validation
- style and variable compliance

## Core shape

- Main thread reads selection and traverses nodes
- Rules stay pure and return findings
- UI shows filters, summaries, and drill-down details
- Local storage is optional for settings and disabled rules

## Key decisions

- Which node types enter the audit
- Which checks are stable contracts versus project-specific rules
- Whether results are only informational or can guide navigation/focus

## Failure modes

- empty selection
- unsupported node types
- hidden or ignored nodes affecting counts
- unclear severity labels in the UI

## Related

- [Contrast Auditor example](../examples/2026-04-09-local-audit-design-doc-example.md) — end-to-end design doc proving this pattern
- [runtime-split](runtime-split.md) — main thread traversal vs UI rendering
- [messaging-bridge](messaging-bridge.md) — typed contract between main and UI
- [main-thread snippet](../snippets/main-thread.md) — starter code for the sandbox side
- [ui-iframe snippet](../snippets/ui-iframe.md) — starter code for the UI side
- [figma-api-reference](../guides/figma-api-reference.md) — node traversal, selection, fills
- [common-pitfalls](../guides/common-pitfalls.md) — type narrowing, empty selection, mixed fills
