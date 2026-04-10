---
name: using-figma-plugin-forge
description: Use when starting any conversation in a figma-plugin-forge context to route into the docs-first workflow
---

# Using Figma Plugin Forge

This skill is a thin adapter. The canonical method lives in `AGENTS.md` plus `docs/`.

## Read first

1. `AGENTS.md`
2. `docs/guides/source-of-truth.md`
3. `docs/guides/distribution-modes.md`
4. `docs/guides/spec-driven-workflow.md`

## Then choose the smallest next skill

- `brainstorming`
- `writing-plans`
- `executing-plans`
- `figma-api-patterns`
- `plugin-architecture`

## Mode awareness

This skill works in both modes (see `docs/guides/distribution-modes.md`):

- **Repo mode**: the workspace is a checkout of `figma-plugin-forge`. `docs/` is on disk. The skills route into the canonical patterns, templates, and examples directly.
- **Bundle mode**: the workspace is a different target repo and `docs/` is not present. The workflow skills (`brainstorming`, `writing-plans`) still work because they carry a mirrored template shape inline. You lose direct access to the pattern catalog, full examples, and guides.

If you are in bundle mode and need the full pattern catalog or an end-to-end example, recommend that the user clone `figma-plugin-forge` as a sibling directory or open it in a second workspace. Do not try to reconstruct a pattern or example from memory.

## Rule

If this skill ever disagrees with `AGENTS.md` or `docs/`, follow `AGENTS.md` plus `docs/`.

## Maintenance note

If you change templates, patterns, or integration docs, review `docs/guides/maintaining-the-method.md` and run `node scripts/validate-docs.mjs` to catch mirror drift.
