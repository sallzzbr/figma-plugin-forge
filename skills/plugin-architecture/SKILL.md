---
name: plugin-architecture
description: Use when questions arise about plugin structure, runtime split, manifests, backend boundaries, project setup, or reusable concerns
---

# Plugin Architecture

Decision guidance for plugin structure, with the full pattern catalog in this skill's `references/`.

## Read first

1. [`references/project-setup.md`](references/project-setup.md) — opinionated stack and file structure
2. [`references/patterns/index.md`](references/patterns/index.md) — the pattern catalog (archetypes + supporting decisions)
3. [`references/snippets/messaging-bridge.md`](references/snippets/messaging-bridge.md) — typed message contract code shape

## Archetypes

Four archetypes cover most plugins. Read the one closest to your idea:

- [`local-audit`](references/patterns/local-audit.md) — traverse the page, apply pure rules (a11y, naming, spacing), return findings. No backend.
- [`llm-analysis`](references/patterns/llm-analysis.md) — export selection, send to an (optional) backend that calls an LLM, render structured feedback.
- [`spec-generation`](references/patterns/spec-generation.md) — turn a selection into a structured artifact (spec, JSON, QA doc). Optional backend for enrichment.
- [`library-sync`](references/patterns/library-sync.md) — read library component/variable state and diff local vs remote. Optional backend for persistence.

Supporting decisions: [`runtime-split`](references/patterns/runtime-split.md), [`messaging-bridge`](references/patterns/messaging-bridge.md), [`optional-backend`](references/patterns/optional-backend.md), [`shared-concerns`](references/patterns/shared-concerns.md).

## Decision tree: which archetype?

```
Does the plugin inspect existing nodes and return findings?
  → local-audit

Does the plugin send data to an LLM and return structured feedback?
  → llm-analysis

Does the plugin turn a selection into a structured artifact (spec, JSON, doc)?
  → spec-generation

Does the plugin sync or compare library/token state?
  → library-sync
```

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
  NO, or secret keys are involved → add a backend.
```

When a backend is involved, switch to the [`figma-backend-integration`](../figma-backend-integration/SKILL.md) skill.

## Verified templates

Two build-verified scaffolds live under `templates/` — copy one verbatim, then adapt. Never retype `manifest.json`, `build.mjs`, or `tsconfig.json` from the prose.

- [`templates/starter-plugin/`](../../templates/starter-plugin/) — local-only plugin (no network).
- [`templates/starter-plugin-backend/`](../../templates/starter-plugin-backend/) — the local starter plus a vendor-agnostic backend layer and local fallback.

The typed message bridge lives in the local starter at [`src/types/messages.ts`](../../templates/starter-plugin/src/types/messages.ts) (the contract), [`src/bridge.ts`](../../templates/starter-plugin/src/bridge.ts) (UI side), and [`src/main-bridge.ts`](../../templates/starter-plugin/src/main-bridge.ts) (main side).

## Setting up a new project

Follow [`references/project-setup.md`](references/project-setup.md) for the full walkthrough. Summary:

1. Copy a template from `templates/` instead of hand-building the scaffold.
2. Set `manifest.json` `id`, keep `documentAccess: "dynamic-page"`, and make `networkAccess.allowedDomains` specific.
3. Keep `src/main.ts` (Figma sandbox), `src/ui.tsx` (iframe), and `src/types/messages.ts` (contract) as the three anchors.
4. `npm run build`, import the manifest in Figma, test.

## Checklist

- [ ] main and UI responsibilities are separate (runtime-split)
- [ ] message contracts are defined in a single shared types file
- [ ] manifest declares only the capabilities actually used
- [ ] backend is added only when needed, not by default
- [ ] shared concerns are extracted only after real reuse appears
- [ ] project setup follows [`references/project-setup.md`](references/project-setup.md) or the user's equivalent
- [ ] [`../figma-api-patterns/references/common-pitfalls.md`](../figma-api-patterns/references/common-pitfalls.md) has been read before writing API code

## Rule

This skill helps you make the architectural decision; the implementation lives in the target repo. Anchor decisions there, not in this method repo.
