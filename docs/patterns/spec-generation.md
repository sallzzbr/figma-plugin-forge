# Pattern: Spec Generation

Use this when the plugin turns a visual selection into a structured product artifact.

## Good fit

- requirements generation
- acceptance criteria drafting
- QA scenario generation
- product documentation starter output

## Core shape

- Main thread exports the selection
- UI collects product context
- Optional backend calls the model and normalizes the output
- UI renders a structured artifact that can be copied or exported

## Key decisions

- Which schema must stay stable
- Whether the output is editable in place
- How much traceability back to frames or flows is required

## Failure modes

- schema drift between backend and renderer
- vague context leading to generic output
- oversized selections producing weak or partial results

## Related

- [Component Spec Extractor example](../examples/2026-04-09-spec-generation-design-doc-example.md) — end-to-end design doc proving this pattern
- [optional-backend](optional-backend.md) — backend enrichment path
- [runtime-split](runtime-split.md) — extraction in main, preview in UI
- [messaging-bridge](messaging-bridge.md) — typed contract for extract request/response
- [optional-backend snippet](../snippets/optional-backend.md) — typed backend call with error handling
- [figma-api-reference](../guides/figma-api-reference.md) — node traversal, variables, fills, export
- [common-pitfalls](../guides/common-pitfalls.md) — type narrowing, mixed fills, export constraints
