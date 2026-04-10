# Component Spec Extractor - Implementation Plan

**Date**: 2026-04-09
**Design doc**: `docs/examples/2026-04-09-spec-generation-design-doc-example.md`
**Target repo**: new project
**Assumed repo structure**: the target repo contains `manifest.json`, `src/`, and `docs/features/`, and optionally a `backend/` directory if enrichment is enabled
**Status**: Approved

> For assistants: use the `executing-plans` skill to implement this plan task by task.

## Goal

Implement a component spec extractor that turns selected frames and components into a stable `ComponentSpec[]` JSON artifact, with an optional backend enrichment path. The local path must always work without a backend.

## Scope

- Included: selection summary, spec extraction, stable schema version, JSON preview, copy/download, optional backend enrichment with typed errors
- Excluded: writing tokens back to Figma, image export, auth beyond an injected token, persistent history

## Tasks

### Task 1: Create the runtime shell

**Files to create or modify**

- `manifest.json`
- `src/main.ts`
- `src/ui.tsx`
- `src/App.tsx`

**Outcome**

Main/UI split is in place, the UI renders a placeholder, and the plugin opens without runtime boundary violations.

**Verification**

Open the plugin in Figma and confirm the UI loads. Grep UI sources for `figma\.` and confirm no direct usage.

**Commit message**

`feat(shell): create plugin runtime shell`

### Task 2: Declare the typed message and spec contract

**Files to create or modify**

- `src/types/spec.ts`
- `src/types/messages.ts`

**Outcome**

A single module exports `TokenRef`, `Constraint`, `AutoLayout`, `ComponentSpec` (with the stable `schema: 'figma-plugin-forge/component-spec@1'`), `UiToMainMessage`, `MainToUiMessage`, `EnrichRequest`, `EnrichResponse`, and `EnrichError` exactly as specified in the design doc. All runtimes import from this file.

**Verification**

`tsc --noEmit --strict` reports no errors. The `schema` literal is the exact string `'figma-plugin-forge/component-spec@1'`.

**Commit message**

`feat(contract): declare component spec and messaging contracts`

### Task 3: Extract the spec from selected nodes

**Files to create or modify**

- `src/main/extract.ts`

**Outcome**

`extractSpecs(nodes: SceneNode[]): ComponentSpec[]` reads geometry, fills, strokes, constraints, auto-layout config, and variant properties for each supported node type. Unsupported node types are skipped and counted. Token references resolve to `TokenRef` with a fallback value.

**Verification**

Write a focused unit test with fixture nodes (or a scripted Figma selection) covering a frame with auto-layout, a component with variants, and an unsupported vector. The result matches the expected `ComponentSpec[]` exactly.

**Commit message**

`feat(extract): extract component spec from selected nodes`

### Task 4: Wire the main thread message handler

**Files to create or modify**

- `src/main.ts`

**Outcome**

`figma.ui.onmessage` uses a type guard to narrow incoming `UiToMainMessage`, dispatches to `extractSpecs`, and replies with the typed `MainToUiMessage` shapes. Selection changes emit `selection-summary` with the counts of frames, components, and instances.

**Verification**

Select different combinations in Figma and confirm the UI receives matching summary counts. Trigger `extract-request` and confirm the UI receives an `extract-result` with a valid spec array.

**Commit message**

`feat(main): wire typed extract handler and selection summary`

### Task 5: Build the UI preview and local actions

**Files to create or modify**

- `src/App.tsx`
- `src/components/SelectionSummary.tsx`
- `src/components/ActionsRow.tsx`
- `src/components/JsonPreview.tsx`

**Outcome**

The UI renders the selection summary, an actions row (extract, enrich, copy, download), and a collapsible JSON preview. Copy uses the Clipboard API; download triggers a blob-url download of `component-spec.json`. The UI never imports from `figma.*`.

**Verification**

Run the plugin on a real selection. Confirm copy places valid JSON on the clipboard, download produces a file with the same content, and the JSON preview collapses/expands correctly.

**Commit message**

`feat(ui): render preview and local copy/download actions`

### Task 6: Add the optional backend enrichment path

**Files to create or modify**

- `src/services/enrich.ts`
- `src/App.tsx`

**Outcome**

`enrichSpecs(request, { endpoint, getAuthToken })` returns a typed `{ ok: true; data } | { ok: false; error: EnrichError }` result (see `docs/snippets/optional-backend.md`). The UI handles the enrich button: disables it while in flight, replaces local state on success, renders the typed error on failure with a retry button. The raw local spec remains copyable throughout.

**Verification**

Point `endpoint` at a mock that returns a valid enriched response and confirm the UI swaps to the enriched version. Point it at a mock that returns 401, 500, and a network error; confirm each renders the correct error code without losing the raw local spec.

**Commit message**

`feat(enrich): optional backend enrichment with typed errors`

### Task 7: Handle edge cases and schema drift

**Files to create or modify**

- `src/App.tsx`
- `src/services/enrich.ts`

**Outcome**

- Empty selection disables the extract button and explains what to do.
- Unsupported nodes are shown in a "skipped" footer with count.
- A backend response whose `schema` value does not match `'figma-plugin-forge/component-spec@1'` is treated as invalid; the UI shows a clear error and keeps the raw local spec.
- Copy and download always use the version currently visible in the preview.

**Verification**

Manually trigger each edge case (empty selection, vector-only selection, mock backend returning the wrong schema). Confirm each path renders the expected UI state and that the raw local copy path still works.

**Commit message**

`feat(ux): handle empty, skipped, and schema-mismatch states`

### Task 8: Sync target-repo docs and run final verification

**Files to create or modify**

- `README.md`
- `docs/features/component-spec-extractor.md`

**Outcome**

The target repo docs describe the stable schema version, the runtime split, the optional backend contract, and the local-first guarantee. The plan and design doc still accurately describe the code.

**Verification**

Re-read the design doc, implementation plan, and final code together. Run `tsc --noEmit --strict`, unit tests, and a manual smoke test with and without the backend. Confirm the schema version is still `'figma-plugin-forge/component-spec@1'` everywhere.

**Commit message**

`docs(component-spec): sync target-repo docs with final implementation`

## Post-completion checklist

- [ ] All tasks were implemented
- [ ] Verification was run and read
- [ ] Design doc and plan still match reality
- [ ] Runtime boundaries stayed clear
- [ ] Contract changes were documented
- [ ] The assumed repo structure was still accurate
