# Source of Truth

This document defines where meaning lives in `figma-plugin-forge`.

## Rule

`AGENTS.md` plus `docs/` are the canonical source of truth.

If any other surface disagrees with them, treat that surface as stale.

## Ownership by file family

- `README.md`
  Human-facing positioning, path selection, and top-level navigation
- `AGENTS.md`
  AI-facing contract, invariants, reading order, and conflict rule
- `docs/guides/`
  Explanations of how to use and maintain the method
- `docs/patterns/`
  Architecture and decision guidance
- `docs/snippets/`
  Example code shapes with context and limits
- `docs/templates/`
  Blank artifacts that define expected structure
- `docs/examples/`
  Filled artifacts that prove the templates and workflow
- `skills/`
  Thin workflow adapters that route into the docs
- `.claude-plugin/`, `.cursor-plugin/`, `.codex/`, `hooks/`
  Optional tool-specific adapters and metadata

## Conflict resolution

When in doubt:

1. `AGENTS.md`
2. `docs/guides/`
3. `docs/patterns/`
4. `docs/templates/` and `docs/examples/`
5. `skills/`
6. adapter metadata and helper scripts

## What should not be duplicated

- repo positioning
- canonical workflow steps
- pattern-level decisions
- template structure
- adapter limitations

Summaries are fine. Parallel definitions are not.

## Mirrored content in bundles

Bundle mode skills (see [distribution-modes.md](distribution-modes.md)) may embed a mirror of `docs/templates/*.md` so they can operate without access to this repo's `docs/` tree.

Rules for mirrors:

- The canonical file in `docs/templates/` is authoritative. If a mirror disagrees, the canonical file wins.
- Mirrors must declare their provenance at the top of the embedding file, for example: `Mirror provenance: docs/templates/design-doc.md. Canonical file wins on conflict.`
- Mirrors must be drift-checked by `scripts/validate-docs.mjs`, which compares the structural headings of the mirror against the canonical file.
- Mirrored content is not the same as a summary. A mirror copies the shape; a summary paraphrases it. Summaries do not need drift checks, but they also must not contradict the canonical file.

Non-template content must not be mirrored. Patterns, guides, examples, and snippets are never copied into skills; skills reference them by path in repo mode only.
