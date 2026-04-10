---
name: figma-api-patterns
description: Use when working with the Figma Plugin API: runtime boundaries, selection, export, variables, styles, storage, and message passing
---

# Figma API Patterns

This skill is a thin adapter. The canonical method lives in `AGENTS.md` plus `docs/`.

## Read first

- `docs/patterns/runtime-split.md`
- `docs/patterns/messaging-bridge.md`
- `docs/snippets/main-thread.md`
- `docs/snippets/messaging-bridge.md`

## Checklist

- main thread owns `figma.*`
- UI iframe owns DOM and fetch
- export in main, not UI
- document every UI-main message
- treat variables, styles, and storage keys as explicit contracts
