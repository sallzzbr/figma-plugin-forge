# Contrast Auditor - Design Doc

**Date**: 2026-04-09
**Status**: Approved
**Target repo**: new project
**Related pattern(s)**: `docs/patterns/local-audit.md`, `docs/patterns/runtime-split.md`, `docs/patterns/messaging-bridge.md`
**Related plan**: `docs/examples/2026-04-09-local-audit-implementation-plan-example.md`

## Problem

Designers need to know whether text and icon layers on the current page meet WCAG AA contrast against their background, without leaving Figma and without sending node data to any third-party service.

## Solution

Build a local-only plugin that walks the current page, derives text-on-background and shape-on-background pairs, computes WCAG contrast ratios, and shows the failures grouped by frame with a direct focus-back action. No backend, no network, no exported images.

## Architecture

- Pattern choice from `figma-plugin-forge`: local audit with a runtime split between Figma traversal (main) and filtering UI (UI iframe), and a typed messaging contract between them
- Target repo decisions: rules live in a pure module that the main thread calls, findings are cached per page in client storage, and the UI filters severities without re-running the audit
- Runtime pieces: Figma main thread plus UI iframe, no backend

## UI Layout

- Single screen with four sections
- Summary row (counts per severity: error, warning, info)
- Filter chips to toggle severities and "only failures"
- Findings list grouped by frame with a focus action per item
- Settings collapse with WCAG level toggle (AA or AAA) and minimum text size override

## Runtime Responsibilities

### Main thread

- Traverse `figma.currentPage` to collect text and shape nodes with resolvable fills and backgrounds
- Run the pure contrast rules over the collected pairs
- Focus and scroll to a node when the UI asks
- Persist the last audit settings in `figma.clientStorage`

### UI iframe

- Render summary, filters, findings, and settings
- Request audits and renders results
- Ask main to focus a specific node on click
- Never call `figma.*` directly

### Backend

- None. This plugin runs entirely inside Figma.

## User Flow

1. User opens the plugin on a page they want to audit
2. Plugin loads saved settings from client storage
3. User clicks "Audit current page"
4. Plugin runs traversal and rules, returns grouped findings
5. User filters by severity or jumps directly to a failing node
6. User adjusts the WCAG level or minimum text size and re-runs the audit

## Data Flow

Traversal input is the current page node tree. The main thread derives `(foreground, background)` pairs from text and shape nodes, computes contrast ratios from sRGB fills, and tags each result with a severity based on the selected WCAG level and font size. The UI receives a flat list of findings grouped by frame id, and filters them locally without re-requesting.

## Interfaces and Contracts

All messages are typed via discriminated unions. Contract documented once and reused by both runtimes.

```ts
type Severity = 'info' | 'warning' | 'error'
type WcagLevel = 'AA' | 'AAA'

type AuditSettings = {
  level: WcagLevel
  minTextSize: number
}

type Finding = {
  id: string            // stable hash of nodeId + backgroundId
  nodeId: string
  nodeName: string
  frameId: string
  frameName: string
  ratio: number
  required: number
  severity: Severity
  foreground: string    // hex
  background: string    // hex
}

type FindingGroup = {
  frameId: string
  frameName: string
  findings: Finding[]
}

// ui -> main
type UiToMainMessage =
  | { type: 'audit-request'; settings: AuditSettings }
  | { type: 'focus-node'; nodeId: string }
  | { type: 'save-settings'; settings: AuditSettings }

// main -> ui
type MainToUiMessage =
  | { type: 'audit-ready'; settings: AuditSettings }   // initial load
  | { type: 'audit-result'; groups: FindingGroup[]; totalFailing: number }
  | { type: 'audit-error'; message: string }
  | { type: 'focus-node-error'; message: string }
```

- Stable identifiers: `Finding.id` is derived from `nodeId` plus the background source so the UI can key react lists without collisions.
- Storage key: `contrast-auditor.settings-v1` in `figma.clientStorage`. The `-v1` suffix allows future schema changes without losing backward compatibility.

## Error Handling

- Empty page or no text nodes: main returns `audit-result` with an empty `groups` array and `totalFailing: 0`; the UI shows a friendly "nothing to audit" state.
- Unresolvable background (gradient, image fill, unknown parent): the pair is skipped and counted separately in a "skipped" count in `audit-result` (added as an optional field in the response shape if the count is non-zero).
- `focus-node` failure (node deleted between audit and click): main responds with `focus-node-error` and the UI shows an inline error next to the finding without breaking the list.
- Settings persistence failure: main logs the error but still runs the audit with the current in-memory settings.

## Verification Criteria

- Running the plugin on a page with a known pass and a known fail correctly groups the fail under its frame with the expected ratio.
- The UI never imports `figma.*`; a grep over the UI source for `figma\.` returns only string literals in comments.
- Changing the WCAG level from AA to AAA re-runs the audit and reports strictly more failures on the same page.
- Clicking a finding focuses the correct node on the canvas.
- The saved settings survive a plugin reload.

## Notes

- Gradient and image backgrounds are explicitly out of scope for this first version. Adding them later is a pure-rule change; the message contract does not need to change.
- Non-text shapes (icons) are audited only if they have a solid fill. Vector-only icons without a solid fill are skipped.
- A future version may add a "fix suggestions" panel, but that is deferred: it would move this toward the `spec-generation` archetype.
