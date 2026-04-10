---
name: writing-plans
description: Use after a design doc is approved to create a task-by-task implementation plan
---

# Writing Implementation Plans

This skill is a workflow adapter. The canonical method lives in `AGENTS.md` plus `docs/` (see [docs/guides/distribution-modes.md](../../docs/guides/distribution-modes.md) for repo mode vs bundle mode).

## Read first

1. the approved design doc
2. the relevant pattern docs
3. [docs/templates/implementation-plan.md](../../docs/templates/implementation-plan.md)
4. [docs/guides/distribution-modes.md](../../docs/guides/distribution-modes.md)

## Checklist

- include exact file paths for every task
- include typed contracts for any new boundary (message shapes, backend requests, storage keys)
- include verification for every task
- include commit message for every task
- include the assumed target repo structure
- split cross-runtime contract changes into explicit steps

## Decision-complete definition

A plan is decision-complete when all of the following are true:

- Every task names the exact files to create or modify, by relative path.
- Every task has a concrete outcome, not a vague description.
- Every task has a verification step: a command, a manual check, or an observable behavior that proves the task is done.
- Every task has a commit message following the target repo's convention.
- Any new message type, storage key, or backend endpoint is declared once as a typed contract and referenced by subsequent tasks.
- The target repo structure is stated up front so the reader does not have to guess which folders exist.
- Cross-runtime changes (main thread, UI iframe, backend) are split into separate tasks so each runtime can be reviewed independently.

If any of these are missing, the plan is not ready to execute. Return to the design doc or ask the user the missing question.

## Output

Save the plan to:

- `docs/plans/YYYY-MM-DD-<feature-slug>.md` in the current workspace if a `docs/plans/` directory exists (repo mode or any target repo that already uses this layout); or
- the same `figma-plugin-forge-plans/` directory used by the matching design doc; or
- a path the user explicitly chooses.

Never write the file to an implicit or guessed path.

## Embedded implementation-plan template (mirror)

> Mirror provenance: [docs/templates/implementation-plan.md](../../docs/templates/implementation-plan.md). Canonical file wins on conflict. Drift-checked by `scripts/validate-docs.mjs`.

```markdown
# <Feature Name> - Implementation Plan

**Date**: YYYY-MM-DD
**Design doc**: <path to design doc>
**Target repo**: <path, repo name, or "new project">
**Assumed repo structure**: <one-line summary of folders or files the plan assumes exist>
**Status**: Draft | Approved | In Progress | Done

> For assistants: use the `executing-plans` skill to implement this plan task by task.

## Goal

One paragraph describing what this plan achieves and why.

## Scope

- Included:
- Excluded:

## Tasks

### Task 1: <Short title>

**Files to create or modify**

- <relative path>

**Outcome**

Describe the exact result this task should produce.

**Verification**

Describe the command, manual check, or observable behavior that proves the task is done.

**Commit message**

`feat(<area>): <what this task accomplished>`

### Task 2: <Short title>

**Files to create or modify**

- <relative path>

**Outcome**

Describe the exact result this task should produce.

**Verification**

Describe the command, manual check, or observable behavior that proves the task is done.

**Commit message**

`feat(<area>): <what this task accomplished>`

## Post-completion checklist

- [ ] All tasks were implemented
- [ ] Verification was run and read
- [ ] Design doc and plan still match reality
- [ ] Runtime boundaries stayed clear
- [ ] Contract changes were documented
- [ ] The assumed repo structure was still accurate
```

## Maintenance note

If you change the canonical template in [docs/templates/implementation-plan.md](../../docs/templates/implementation-plan.md), also update the mirror above and run `node scripts/validate-docs.mjs` to confirm the drift check passes. Review [docs/examples/](../../docs/examples/) and [docs/guides/maintaining-the-method.md](../../docs/guides/maintaining-the-method.md) for knock-on changes.
