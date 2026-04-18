---
name: brainstorming
description: Use when the user wants to shape a new Figma plugin or a major feature before implementation
---

# Brainstorming a Figma Plugin

This skill is a workflow adapter. The canonical method lives in `AGENTS.md` plus `docs/` (see [docs/guides/distribution-modes.md](../../docs/guides/distribution-modes.md) for repo mode vs bundle mode).

## Read first

- `docs/guides/spec-driven-workflow.md`
- `docs/guides/distribution-modes.md`
- the closest file in `docs/patterns/`

## Checklist

Cover these nine areas in order. For each area, ask the user a clarifying question whenever the answer is not already explicit. Do not fill gaps with assumptions.

1. Purpose
2. User interaction in Figma
3. UI shape
4. Canvas interaction
5. Backend needs
6. Authentication needs
7. AI or LLM role
8. Local storage needs
9. Data flow summary

## Iterative clarification rule

Whenever the user gives a vague or partial answer, restate what you heard and ask a follow-up before moving on. Do not move to the next area until the current one has an explicit, confirmed decision. If the user pushes to "just start", summarize what is still unresolved and let them choose which gaps to leave open on purpose.

## Decision-complete gate

Only write the design doc when every area in the checklist has an explicit decision the user has confirmed. "Confirmed" means the user either said so directly or reviewed a restatement without correction. If any area is deliberately deferred, record that deferral in the `Notes` section of the design doc.

## Output

Write a design doc using the shape below (canonical file: [docs/templates/design-doc.md](../../docs/templates/design-doc.md)).

Save it to:

- `docs/plans/YYYY-MM-DD-<topic>-design.md` in the current workspace if a `docs/plans/` directory exists (repo mode or any target repo that already uses this layout); or
- a new `figma-plugin-forge-plans/` directory the user agrees to create at the workspace root; or
- a path the user explicitly chooses.

Never write the file to an implicit or guessed path.

## Embedded design-doc template (mirror)

> Mirror provenance: [docs/templates/design-doc.md](../../docs/templates/design-doc.md). Canonical file wins on conflict. Drift-checked by `scripts/validate-docs.mjs`.

```markdown
# <Feature Name> - Design Doc

**Date**: YYYY-MM-DD
**Status**: Draft | Approved | Replaced | Archived
**Target repo**: <path, repo name, or "new project">
**Related pattern(s)**: <docs/patterns/...>
**Related plan**: <docs/plans/... or docs/examples/...>

## Problem

What user problem are we solving? Why is this worth building?

## Solution

What are we building at a high level? Keep this concrete.

## Architecture

- Which pattern(s) from `figma-plugin-forge` are we intentionally using?
- Which decisions are specific to the target repo or product?
- Which runtime pieces exist?

## UI Layout

- What screens, tabs, or panels exist?
- What does each one let the user do?

## Runtime Responsibilities

### Main thread

- What stays in the Figma sandbox?

### UI iframe

- What stays in the browser/UI layer?

### Backend

- What is optional or required outside Figma?

## User Flow

Describe the user journey step by step.

## Data Flow

Describe the flow of data from selection/input to final result.

## Interfaces and Contracts

- Message types between UI and main
- Backend request and response shapes
- Stable identifiers, storage keys, and state contracts

## Manifest Decisions

Fill in every field. These answers drive `manifest.json` per [`docs/snippets/manifest.md`](../snippets/manifest.md).

- `editorType`: figma / figjam / slides / dev (one or more, with reason)
- `documentAccess`: `dynamic-page` (current page only) vs `dynamic` (cross-page, triggers permission prompt) — which and why
- `networkAccess.allowedDomains`: exact domains the UI will call, or empty if none
- `enablePrivatePluginApi`: true or false + reason (only true if `figma.fileKey` or other private APIs are required)
- Plugin ID source: new from [Figma Plugin Dashboard](https://www.figma.com/developers), reusing an existing ID, or placeholder for development

## Error Handling

- What can fail?
- How will the user see and recover from errors?

## Verification Criteria

- How will we know the design worked?
- Which behaviors must be demonstrable?

## Notes

Anything intentionally deferred, risky, or worth revisiting later.
```

## Rule

Do not write implementation code until the design is explicit enough to capture in the design doc, and the design doc's nine-area checklist has been walked through with the user.
