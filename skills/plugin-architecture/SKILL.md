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

### Bundle mode note

If the files above are not on disk, you are in bundle mode. The decision trees and setup summary below work standalone. For the full pattern docs and project-setup walkthrough, clone `figma-plugin-forge` as a sibling:

```
git clone https://github.com/sallzzbr/figma-plugin-forge.git ../figma-plugin-forge
```

### Archetype summaries (for bundle mode)

If you cannot read the full pattern files, here are one-paragraph summaries:

- **local-audit** — Main thread traverses the current page, applies pure rules (accessibility, naming, spacing), and returns findings. UI renders filters, severity groups, and focus-back navigation. No backend. No network calls. Settings in client storage.
- **llm-analysis** — Main thread exports selected frames. UI collects user context, sends exports + context to an optional backend that calls an LLM, and renders structured feedback. Backend is optional but typical.
- **spec-generation** — Main thread extracts structured data from selected nodes (layout, tokens, constraints). UI renders a JSON preview with copy/download. Optional backend for enrichment. Schema is versioned and stable.
- **library-sync** — Main thread reads library component and variable state. UI shows diffs between local and remote state. Optional backend for persistence. Fingerprinting and diff logic are the core concerns.

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
