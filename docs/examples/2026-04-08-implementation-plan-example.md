# Frame Review Assistant - Implementation Plan

**Date**: 2026-04-08
**Design doc**: `docs/examples/2026-04-08-design-doc-example.md`
**Target repo**: new project
**Assumed repo structure**: the target repo contains `manifest.json`, `src/`, and `docs/features/`
**Status**: Approved

> For assistants: use the `executing-plans` skill to implement this plan task by task.

## Goal

Implement a frame analysis plugin that exports selected frames, sends them with user context to an optional backend, and renders structured feedback in the UI.

## Scope

- Included: selection monitoring, image export, backend request, grouped results, focus-back navigation
- Excluded: auth, persistent history, model selection UI

## Tasks

### Task 1: Create the runtime shell

**Files to create or modify**

- `manifest.json`
- `src/main.ts`
- `src/ui.tsx`
- `src/App.tsx`

**Outcome**

The project has a clear main/UI split, renders a basic UI, and can open inside Figma.

**Verification**

Open the plugin in Figma and confirm the UI loads without runtime boundary violations.

**Commit message**

`feat(shell): create plugin runtime shell`

### Task 2: Add selection messaging and export

**Files to create or modify**

- `src/main.ts`
- `src/types/messages.ts`

**Outcome**

Main emits normalized selection state and supports an export request that returns downscaled frame images.

**Verification**

Select frames in Figma and confirm the UI receives `selection-changed`. Trigger an export request and confirm the response contains exported frame data.

**Commit message**

`feat(selection): add selection and export contracts`

### Task 3: Add UI state and backend request

**Files to create or modify**

- `src/App.tsx`
- `src/services/analyze.ts`
- `src/types/api.ts`

**Outcome**

The UI can collect context, request exports, call the backend, and render loading and error states.

**Verification**

Run the plugin against a mocked or real backend and confirm success, loading, and failure states all render correctly.

**Commit message**

`feat(ui): connect analysis request flow`

### Task 4: Add result rendering and focus-back flow

**Files to create or modify**

- `src/App.tsx`
- `src/components/ResultPanel.tsx`
- `src/types/api.ts`

**Outcome**

Results render in sections, and findings with `nodeId` can ask main to focus the related node.

**Verification**

Click a result item tied to `nodeId` and confirm the node is selected and focused in Figma.

**Commit message**

`feat(results): render findings and focus related nodes`

### Task 5: Sync target-repo docs and run final verification

**Files to create or modify**

- `README.md`
- `docs/features/frame-review-assistant.md`

**Outcome**

The target repo docs match the final request and response shapes, runtime split, and verification steps.

**Verification**

Re-read the design doc, implementation plan, and final code together. Run the target repo's final checks and confirm there is no contract drift.

**Commit message**

`docs(frame-review): sync target-repo docs with final implementation`

## Post-completion checklist

- [ ] All tasks were implemented
- [ ] Verification was run and read
- [ ] Design doc and plan still match reality
- [ ] Runtime boundaries stayed clear
- [ ] Contract changes were documented
- [ ] The assumed repo structure was still accurate
