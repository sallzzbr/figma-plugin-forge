---
name: writing-plans
description: Use after a design doc is approved to create a detailed, task-by-task implementation plan for a Figma plugin
---

# Writing Implementation Plans

You are writing a step-by-step implementation plan for a Figma plugin feature. The plan must be detailed enough that any engineer (or AI agent) with zero prior context can execute it without guessing.

## When to use this skill

- A design doc or spec has been approved and it is time to break it into executable tasks
- A feature request is well-understood and needs a concrete action plan before coding begins
- You want to hand off implementation to another session or agent

## Plan file location

Save the plan to: `docs/plans/YYYY-MM-DD-<feature-slug>.md`

Use today's date. Use a short kebab-case slug that describes the feature (e.g., `2026-04-08-layer-rename-tool.md`).

## Plan header template

Every plan starts with this header:

```markdown
# <Feature Name> — Implementation Plan

**Date**: YYYY-MM-DD
**Design doc**: <link or path to the design doc, if any>
**Plugin**: plugins/<plugin-name>
**Status**: Draft | Approved | In Progress | Done

> **For Claude**: use the `executing-plans` skill to implement this plan task by task.

## Goal

<One paragraph: what this plan achieves and why.>

## Scope

- What is included
- What is explicitly excluded
```

## Task structure

Break the work into numbered tasks. Each task should take 2-5 minutes to implement. If a task feels larger, split it further.

### Task template

```markdown
### Task N: <Short title>

**Files to create or modify**:
- `plugins/<name>/src/types.ts` — add `FooPayload` type
- `plugins/<name>/src/main.ts` — register new message handler
- `plugins/<name>/src/components/FooPanel.tsx` — new component

**Shared types** (if any):
- `packages/shared/types/<file>.ts` — add shared contract

**Backend function** (if applicable):
- `backend/supabase/functions/<function-name>/index.ts`

**What to do**:
1. Exact step-by-step instructions
2. Include code snippets for non-obvious logic
3. Reference existing patterns in the codebase when possible

**How to verify**:
- `npm run build -w plugins/<name>` completes without errors
- <Describe expected behavior or output>

**Commit**: `feat(<plugin>): <what this task accomplished>`
```

## Writing guidelines

### Be explicit about files

Every task must list the exact file paths to create or modify. Use paths relative to the repo root. Never say "update the relevant file" — name it.

### Specify which runtime boundary

Figma plugins have two separate runtimes. Each task must be clear about which side it affects:

- **Main thread** (`src/main.ts`): Figma API access, node traversal, storage, message handling. No DOM, no network.
- **UI iframe** (`src/ui.tsx`, `src/App.tsx`, `src/components/`): Preact rendering, network calls, browser APIs. No direct Figma API access.
- **Backend** (`backend/supabase/functions/`): validation, auth, persistence, LLM calls.

If a task touches the message boundary between main and UI, spell out the message type, its payload shape, and which side sends vs. receives.

### Respect the shared package

Before creating any local utility, component, or type, check `packages/shared/`. The plan should reference shared imports when they exist:

- `@figma-forge/shared/ui` — Button, Card, Badge, Input, LoadingSpinner, ErrorMessage, Tabs
- `@figma-forge/shared/services` — bridge, auth, config helpers
- `@figma-forge/shared/types` — cross-plugin contracts
- `@figma-forge/shared/styles` — base Tailwind config and CSS

### Include build verification

Every task that changes code must end with:

```
npm run build -w plugins/<name>
```

If the task changes shared code, also verify all consuming plugins:

```
npm run build:all
```

### Keep commits granular

Each task should produce exactly one commit. Use conventional commit format:

- `feat(<plugin>): add layer rename panel component`
- `fix(<plugin>): handle empty selection in export flow`
- `refactor(shared): extract message types to shared/types`
- `docs(<plugin>): update AGENTS.md with new message contracts`

### Build constraints to mention when relevant

Remind the implementer of these constraints when a task could trigger them:

- No JSX fragments (`<>...</>`) — use a wrapper `<div>` instead
- No `innerHTML` with closing HTML tags — use `textContent` instead
- UI entry must be `export default function(rootNode: HTMLElement)`
- `figma.fileKey` requires `"enablePrivatePluginApi": true` in manifest

## Plan footer template

End every plan with:

```markdown
## Post-completion checklist

- [ ] All tasks committed with descriptive messages
- [ ] `npm run build -w plugins/<name>` passes
- [ ] Plugin can be loaded in Figma (close and reopen after rebuild)
- [ ] Affected `AGENTS.md` files updated if contracts or structure changed
- [ ] No local duplicates of shared components or types
```

## After writing the plan

1. Present the plan to the user for review
2. Ask if any tasks need adjustment, reordering, or splitting
3. Once approved, offer two execution paths:
   - **This session**: use the `executing-plans` skill (or `subagent-driven-development` for parallel tasks)
   - **Separate session**: the user can open a new conversation and invoke `executing-plans` with the plan path

## Example task (for reference)

```markdown
### Task 3: Add selection-changed message handler in main.ts

**Files to modify**:
- `plugins/ds-audit/src/main.ts` — add handler for `selection-changed`
- `plugins/ds-audit/src/types.ts` — add `SelectionPayload` type

**What to do**:
1. In `types.ts`, add:
   ```ts
   export interface SelectionPayload {
     nodeIds: string[];
     nodeNames: string[];
   }
   ```
2. In `main.ts`, inside the existing `figma.on('selectionchange', ...)` callback:
   - Build a `SelectionPayload` from `figma.currentPage.selection`
   - Send it to the UI via `figma.ui.postMessage({ type: 'selection-changed', payload })`

**How to verify**:
- `npm run build -w plugins/ds-audit` completes without errors
- After loading in Figma, selecting nodes should trigger the message (verify via console)

**Commit**: `feat(ds-audit): send selection-changed message to UI`
```
