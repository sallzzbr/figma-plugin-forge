---
name: plugin-architecture
description: Use when questions arise about plugin structure, runtime split, manifests, backend boundaries, or reusable concerns
---

# Plugin Architecture

This skill is a thin adapter. The canonical method lives in `AGENTS.md` plus `docs/`.

## Read first

1. `docs/patterns/runtime-split.md`
2. `docs/patterns/messaging-bridge.md`
3. `docs/patterns/optional-backend.md`
4. `docs/patterns/shared-concerns.md`

Then read the matching snippet in `docs/snippets/` only if you need code shape.

## Checklist

- keep main and UI responsibilities separate
- document message contracts explicitly
- add backend only when needed
- extract shared concerns only after real reuse appears
- keep decisions anchored in the target repo, not in this method repo
