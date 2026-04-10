---
name: plugin-architecture
description: Use when questions arise about plugin structure, runtime split, manifests, backend boundaries, project setup, or reusable concerns
---

# Plugin Architecture

This skill is a workflow adapter. The canonical method lives in `AGENTS.md` plus `docs/`.

## Read first

1. `docs/guides/project-setup.md` — opinionated stack and file structure
2. `docs/patterns/runtime-split.md` — which code goes where
3. `docs/patterns/messaging-bridge.md` — typed message contract
4. `docs/patterns/optional-backend.md` — when and how to add a backend
5. `docs/patterns/shared-concerns.md` — when to extract shared code

Then read the matching snippet in `docs/snippets/` only if you need code shape.

## Decision tree: do I need a backend?

```
Is the plugin local-only (audit, lint, rename)?
  YES → no backend. Use the local-audit pattern.
  NO ↓

Does the plugin call an external API (LLM, search, storage)?
  YES ↓
  NO → probably no backend. Double-check.

Can the external API be called directly from the UI iframe?
  YES, and no secret keys are needed → call from UI, no backend.
  NO, or secret keys are involved → add a backend. Use the optional-backend pattern.
```

## Decision tree: which archetype?

```
Does the plugin inspect existing nodes and return findings?
  → local-audit (docs/patterns/local-audit.md)

Does the plugin send data to an LLM and return structured feedback?
  → llm-analysis (docs/patterns/llm-analysis.md)

Does the plugin turn a selection into a structured artifact (spec, JSON, doc)?
  → spec-generation (docs/patterns/spec-generation.md)

Does the plugin sync or compare library/token state?
  → library-sync (docs/patterns/library-sync.md)
```

## Setting up a new project

Follow `docs/guides/project-setup.md` for the full walkthrough. Summary:

1. Create `manifest.json`, `package.json`, `tsconfig.json`
2. Install `@figma/plugin-typings`, `esbuild`, `typescript`, `preact`
3. Create `src/main.ts` (Figma sandbox), `src/ui.tsx` (iframe), `src/types/messages.ts` (contract)
4. Create `build.mjs` that bundles main and inlines UI HTML
5. `npm run build`, import manifest in Figma, test

## Checklist

- [ ] main and UI responsibilities are separate (runtime-split)
- [ ] message contracts are defined in a single shared types file
- [ ] manifest declares only the capabilities actually used
- [ ] backend is added only when needed, not by default
- [ ] shared concerns are extracted only after real reuse appears
- [ ] project setup follows `docs/guides/project-setup.md` or the user's equivalent
- [ ] `docs/guides/common-pitfalls.md` has been read before writing API code

## Rule

Keep architectural decisions anchored in the target repo, not in this method repo. This skill helps you make the decision; the implementation lives elsewhere.
