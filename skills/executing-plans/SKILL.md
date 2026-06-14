---
name: executing-plans
description: Use when a plan exists and it is time to implement task by task with verification
---

# Executing Implementation Plans

Implement an approved plan one task at a time, verifying each before moving on.

## Read first

1. the plan
2. the linked design doc
3. the relevant patterns in [`../plugin-architecture/references/patterns/`](../plugin-architecture/references/patterns/index.md)
4. the target repo structure
5. [`../figma-api-patterns/references/common-pitfalls.md`](../figma-api-patterns/references/common-pitfalls.md) — keep open as a checklist during implementation

## Scaffold first

When the plan creates a new plugin (rather than editing an existing one), the first task is to copy a verified template into the target repo verbatim, then adapt it:

- [`templates/starter-plugin/`](../../templates/starter-plugin/) for a local-only plugin, or
- [`templates/starter-plugin-backend/`](../../templates/starter-plugin-backend/) when it needs a backend.

Do not retype `manifest.json`, `build.mjs`, or `tsconfig.json` from the references — that is where the "basic things wrong" come from. The scaffold already encodes the correct manifest, build, and runtime wiring.

## Execution checklist

For each task in order:

1. Announce the task by name and list the files it will touch.
2. Read every file the task references before making changes.
3. Implement only what the task describes. Do not bundle extra scope.
4. Run the verification the task lists. If there is no verification, stop and add one before proceeding.
5. Compare the observed output with the expected outcome stated in the plan and design doc.
6. If the observed output matches, mark the task complete and move on.
7. If anything is unclear or diverges, stop and either update the plan or surface the question.

## Verification gate

Do not mark a task complete until:

- the listed verification command, check, or behavior has been executed; and
- its output has been read and compared to the expected outcome.

If the verification command cannot be run in the current environment, say so explicitly and ask the user how to proceed. Do not mark the task complete based on "it looks right".

If the verification output is ambiguous, surface it to the user with the raw output and the expected shape, and wait for a decision before continuing.

## Definition of Done

Before declaring the whole plugin done:

- `node scripts/validate-scaffold.mjs --path <plugin-dir>` passes;
- `npm run build` and `npm run typecheck` succeed in the plugin;
- the manifest has a real `id`, `documentAccess: "dynamic-page"`, and a specific `networkAccess.allowedDomains`;
- the plugin imports and runs in Figma against the design doc's verification criteria.

## Doc-sync rule

If the actual implementation has to diverge from the plan (because the plan was wrong, incomplete, or based on stale assumptions):

- Update the plan file to reflect the new reality before moving to the next task.
- If the divergence changes a contract, update the design doc's "Interfaces and Contracts" section too.
- Never accumulate silent drift. A plan that no longer matches the code has lost its value as a source of truth.

## Surface blockers, do not freelance

If a blocker appears (missing dependency, unclear requirement, broken assumption about the target repo), stop and surface it. Describe:

- the task that hit the blocker
- what the plan said
- what you observed
- what decision you need from the user

Do not guess scope. Do not expand the task to "fix it properly". Do not skip verification to keep moving.

## Rule

If the plan is wrong, update the plan instead of silently changing scope.
