# Contrast Auditor - Implementation Plan

**Date**: 2026-04-09
**Design doc**: `docs/examples/2026-04-09-local-audit-design-doc-example.md`
**Target repo**: new project
**Assumed repo structure**: the target repo contains `manifest.json`, `src/`, and `docs/features/`
**Status**: Approved

> For assistants: use the `executing-plans` skill to implement this plan task by task.

## Goal

Implement a local-only contrast auditor that walks the current Figma page, computes WCAG AA/AAA contrast for every resolvable foreground/background pair, and renders grouped failures with a focus-back action. No backend, no network calls.

## Scope

- Included: page traversal, pure contrast rules, filter UI, focus-back navigation, settings persistence in client storage
- Excluded: gradient/image backgrounds, non-text icon-only layers without solid fills, fix suggestions, any backend call

## Tasks

### Task 1: Create the runtime shell

**Files to create or modify**

- `manifest.json`
- `src/main.ts`
- `src/ui.tsx`
- `src/App.tsx`

**Outcome**

The project has a clear main/UI split, boots a placeholder UI, and opens without runtime boundary violations. `manifest.json` matches the `local-audit` archetype per [`docs/snippets/manifest.md`](../snippets/manifest.md) — minimal, with no network access:

```json
{
  "name": "Contrast Auditor",
  "id": "YOUR_PLUGIN_ID",
  "api": "1.0.0",
  "editorType": ["figma"],
  "main": "build/main.js",
  "ui": "build/ui.html",
  "documentAccess": "dynamic-page"
}
```

No `networkAccess` block (the plugin never calls out). No `enablePrivatePluginApi` (not needed).

**Verification**

Open the plugin in Figma and confirm the UI loads. Grep `src/ui.tsx` and `src/App.tsx` for `figma\.` and confirm no direct usage exists.

**Commit message**

`feat(shell): create plugin runtime shell`

### Task 2: Declare the typed message contract

**Files to create or modify**

- `src/types/messages.ts`

**Outcome**

A single module exports `Severity`, `WcagLevel`, `AuditSettings`, `Finding`, `FindingGroup`, `UiToMainMessage`, and `MainToUiMessage` exactly as specified in the design doc. Both main and UI import from this file.

**Verification**

`tsc --noEmit --strict` reports no errors. Opening `src/main.ts` and `src/App.tsx` in the editor shows the imported types.

**Commit message**

`feat(contract): declare audit message contract`

### Task 3: Implement pure contrast rules

**Files to create or modify**

- `src/rules/contrast.ts`
- `src/rules/contrast.test.ts`

**Outcome**

A pure module exports `computeContrast(fg: string, bg: string): number` and `classify(ratio: number, level: WcagLevel, fontSizePx: number): Severity`. Inputs are hex strings; outputs are a number and a severity. No Figma APIs are referenced.

**Verification**

Unit tests cover: black-on-white (21), white-on-white (1), mid-grey pairs at AA and AAA thresholds, small-text vs large-text threshold switches. All tests pass.

**Commit message**

`feat(rules): add pure contrast computation and classification`

### Task 4: Traverse the current page and build pairs

**Files to create or modify**

- `src/main.ts`
- `src/main/traversal.ts`

**Outcome**

`runAudit(settings)` walks `figma.currentPage`, collects text and solid-filled shape nodes, derives `(foreground, background)` pairs by reading the nearest parent with a solid fill, and returns an array of `Finding` objects grouped by frame id.

**Verification**

Open a test file with one failing and one passing pair. Trigger an audit via a temporary hard-coded call in `main.ts` and log the result. Confirm the failing pair appears with the expected ratio and severity.

**Commit message**

`feat(audit): traverse current page and build contrast pairs`

### Task 5: Wire the message handler in main

**Files to create or modify**

- `src/main.ts`
- `src/main/storage.ts`

**Outcome**

`figma.ui.onmessage` uses a type guard to narrow incoming `UiToMainMessage`, dispatches to `runAudit`, `focus-node`, or `save-settings`, and replies with the typed `MainToUiMessage` shapes. On startup, main reads `contrast-auditor.settings-v1` from client storage and posts `audit-ready`.

**Verification**

Send each message type from the UI (or a test harness) and confirm main replies with the expected shape. Confirm settings persist across plugin reloads.

**Commit message**

`feat(main): wire typed message handler and settings storage`

### Task 6: Build the UI screen

**Files to create or modify**

- `src/App.tsx`
- `src/components/SummaryRow.tsx`
- `src/components/FilterChips.tsx`
- `src/components/FindingsList.tsx`
- `src/components/SettingsPanel.tsx`

**Outcome**

`App.tsx` renders the summary, filters, findings list, and settings panel. It requests an audit on mount after receiving `audit-ready`, filters findings locally by severity, and sends `focus-node` on click. The UI never imports from `figma.*`.

**Verification**

Run the plugin against the test file from Task 4. Confirm the summary counts match, filter chips update the visible list without re-requesting from main, and clicking a finding focuses the correct node on canvas.

**Commit message**

`feat(ui): render summary, filters, findings, and settings`

### Task 7: Handle edge cases and error states

**Files to create or modify**

- `src/App.tsx`
- `src/main.ts`

**Outcome**

- Empty page shows a "nothing to audit" state.
- `focus-node-error` is rendered inline next to the finding without breaking the list.
- Skipped pairs (unresolvable backgrounds) are counted and shown in the summary row.
- Settings persistence failures log a warning but do not block the audit.

**Verification**

Manually trigger each failure mode: empty page, delete a node between audit and click, audit on a frame with a gradient background, simulate a client storage failure. Confirm each path renders the expected UI state.

**Commit message**

`feat(ux): handle empty, missing, skipped, and storage failure states`

### Task 8: Sync target-repo docs and run final verification

**Files to create or modify**

- `README.md`
- `docs/features/contrast-auditor.md`

**Outcome**

The target repo docs match the final contract, runtime split, and WCAG thresholds used by the rules. The plan and design doc still accurately describe the code.

**Verification**

Re-read the design doc, implementation plan, and final code together. Run the target repo's final checks (`tsc --noEmit --strict`, unit tests, manual smoke test in Figma) and confirm there is no contract drift.

**Commit message**

`docs(contrast-auditor): sync target-repo docs with final implementation`

## Post-completion checklist

- [ ] All tasks were implemented
- [ ] Verification was run and read
- [ ] Design doc and plan still match reality
- [ ] Runtime boundaries stayed clear
- [ ] Contract changes were documented
- [ ] The assumed repo structure was still accurate
