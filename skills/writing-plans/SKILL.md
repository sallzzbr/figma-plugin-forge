---
name: writing-plans
description: Use after a design doc is approved to create a task-by-task implementation plan
---

# Writing Implementation Plans

Turn an approved design doc into a decision-complete, task-by-task plan.

## Read first

1. the approved design doc
2. the relevant patterns in [`../plugin-architecture/references/patterns/`](../plugin-architecture/references/patterns/index.md)
3. the plan template: [`references/plan-template.md`](references/plan-template.md)
4. a worked example pair in [`references/examples/`](references/examples/README.md)

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

## Examples

The [`references/examples/`](references/examples/README.md) folder holds three filled design-doc + implementation-plan pairs (one each for `llm-analysis`, `local-audit`, and `spec-generation`). Use the closest one to anchor the shape and depth of your own plan.

## Output

Save the plan to:

- `docs/plans/YYYY-MM-DD-<feature-slug>.md` in the target repo if that repo already uses a `docs/plans/` layout; or
- the same directory used by the matching design doc; or
- a path the user explicitly chooses.

Never write the file to an implicit or guessed path. Then hand off to the [`executing-plans`](../executing-plans/SKILL.md) skill to implement it task by task.
