---
name: executing-plans
description: Use when a plan exists and it is time to implement task by task with verification
---

# Executing Implementation Plans

This skill is a workflow adapter. The canonical method lives in `AGENTS.md` plus `docs/` (see [docs/guides/distribution-modes.md](../../docs/guides/distribution-modes.md) for repo mode vs bundle mode).

## Read first

1. the plan
2. the linked design doc
3. the relevant patterns
4. the target repo structure
5. `docs/guides/common-pitfalls.md` — keep open as a checklist during implementation
6. [`AGENTS.md § Happy path`](../../AGENTS.md#happy-path) — the 7 canonical moves every task must preserve

### Bundle mode note

If the task references a pattern file (e.g., `docs/patterns/local-audit.md`) that does not exist in the current workspace, you are in bundle mode. Clone `figma-plugin-forge` as a sibling directory and read from there:

```
git clone https://github.com/sallzzbr/figma-plugin-forge.git ../figma-plugin-forge
```

Then reference patterns as `../figma-plugin-forge/docs/patterns/local-audit.md`. Do not skip pattern reading — it defines the architecture the plan assumes.

## Execution checklist

For each task in order:

1. Announce the task by name and list the files it will touch.
2. Read every file the task references before making changes.
3. Implement only what the task describes. Do not bundle extra scope.
4. **Happy-path gate:** before writing code, confirm the task still uses the 7 canonical moves from [`AGENTS.md § Happy path`](../../AGENTS.md#happy-path) — manifest shape, `figma.showUI`, `postMessage`-only boundary, typed messages file, `src/main.ts` / `src/ui.tsx` split, esbuild output, no DOM in main / no `figma.*` in UI. If the task diverges, stop and surface the divergence to the user before implementing. Do not invent custom patterns.
5. Run the verification the task lists. If there is no verification, stop and add one before proceeding.
6. Compare the observed output with the expected outcome stated in the plan and design doc.
7. If the observed output matches, mark the task complete and move on.
8. If anything is unclear or diverges, stop and either update the plan or surface the question.

## Verification gate

Do not mark a task complete until:

- the listed verification command, check, or behavior has been executed; and
- its output has been read and compared to the expected outcome.

If the verification command cannot be run in the current environment, say so explicitly and ask the user how to proceed. Do not mark the task complete based on "it looks right".

If the verification output is ambiguous, surface it to the user with the raw output and the expected shape, and wait for a decision before continuing.

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
