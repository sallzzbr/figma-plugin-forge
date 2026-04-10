# Component Spec Extractor - Design Doc

**Date**: 2026-04-09
**Status**: Approved
**Target repo**: new project
**Related pattern(s)**: `docs/patterns/spec-generation.md`, `docs/patterns/runtime-split.md`, `docs/patterns/messaging-bridge.md`, `docs/patterns/optional-backend.md`
**Related plan**: `docs/examples/2026-04-09-spec-generation-implementation-plan-example.md`

## Problem

Product and engineering teams regularly rebuild ad-hoc handoff notes for components that already exist in Figma. Designers want a single action that turns the current selection into a stable JSON spec they can paste into a PR, an issue, or a design system doc, optionally enriched by a backend that normalizes constraints and naming.

## Solution

Build a plugin that takes one or more selected frames or components, extracts a structured `ComponentSpec` (tokens, layout, constraints, variants), and offers two modes: copy raw JSON locally, or POST to an optional backend for enrichment before copying. The schema is stable and documented, so downstream tools can consume it without guessing.

## Architecture

- Pattern choice from `figma-plugin-forge`: spec generation with a runtime split, typed messaging, and an optional backend that does not block the local path
- Target repo decisions: the schema is declared once and shared between main, UI, and backend; the backend is purely additive and never required; the UI renders a JSON preview with copy, download, and "enrich" actions
- Runtime pieces: Figma main thread, UI iframe, optional backend

## UI Layout

- Single screen with three sections
- Selection summary (counts of frames, components, instances)
- Actions row (extract, enrich, copy, download)
- Preview panel with collapsible JSON tree and copy-to-clipboard

## Runtime Responsibilities

### Main thread

- Watch selection changes
- Extract a `ComponentSpec` from each selected frame or component
- Resolve style variables to stable names (not raw color/number values) when available
- Never call network directly

### UI iframe

- Display the selection summary
- Trigger extraction via a typed request
- Render the JSON preview
- Call the optional backend enrichment endpoint
- Copy or download the final spec

### Backend

- Validate the incoming `ComponentSpec[]`
- Normalize variant names, constraint labels, and token references
- Return a typed `ComponentSpec[]` with the same shape plus optional `enriched: true` markers
- Is strictly optional: the UI must always be able to copy the raw local spec without a backend call

## User Flow

1. User selects one or more frames or components
2. Plugin shows a selection summary
3. User clicks "Extract spec"
4. Plugin returns `ComponentSpec[]` and renders the JSON preview
5. User either copies/downloads directly, or clicks "Enrich via backend" to get a normalized version
6. User copies or downloads the final spec

## Data Flow

Selection is tracked by the main thread. On `extract-request`, main walks the selected nodes, reads geometry, auto-layout config, resolved style variables, and variant properties, and returns a typed `ComponentSpec[]`. The UI renders the raw result immediately. If the user clicks enrich, the UI POSTs the raw spec to the backend and replaces its local state with the enriched response. Copy and download act on whichever version is currently in UI state.

## Interfaces and Contracts

```ts
type TokenRef = {
  name: string        // e.g. "color/primary/500"
  source: 'variable' | 'style' | 'inline'
  fallback: string    // hex or raw value for consumers that cannot resolve tokens
}

type Constraint = {
  horizontal: 'LEFT' | 'RIGHT' | 'CENTER' | 'SCALE' | 'STRETCH'
  vertical: 'TOP' | 'BOTTOM' | 'CENTER' | 'SCALE' | 'STRETCH'
}

type AutoLayout = {
  mode: 'HORIZONTAL' | 'VERTICAL' | 'NONE'
  padding: { top: number; right: number; bottom: number; left: number }
  itemSpacing: number
  primaryAlign: 'MIN' | 'CENTER' | 'MAX' | 'SPACE_BETWEEN'
  counterAlign: 'MIN' | 'CENTER' | 'MAX'
}

type ComponentSpec = {
  schema: 'figma-plugin-forge/component-spec@1'  // stable contract version
  id: string
  name: string
  type: 'FRAME' | 'COMPONENT' | 'INSTANCE'
  width: number
  height: number
  fills: TokenRef[]
  strokes: TokenRef[]
  constraint: Constraint
  autoLayout: AutoLayout
  variants: Record<string, string>   // empty for non-variant nodes
  enriched?: boolean
}

// ui -> main
type UiToMainMessage =
  | { type: 'extract-request' }

// main -> ui
type MainToUiMessage =
  | { type: 'selection-summary'; frames: number; components: number; instances: number }
  | { type: 'extract-result'; specs: ComponentSpec[] }
  | { type: 'extract-error'; message: string }

// backend request/response
type EnrichRequest = {
  specs: ComponentSpec[]
}

type EnrichResponse = {
  specs: ComponentSpec[]   // same shape, with enriched: true
}

type EnrichError = {
  code: 'unauthorized' | 'bad_request' | 'server_error' | 'network_error'
  message: string
}
```

- Stable contract version: `'figma-plugin-forge/component-spec@1'`. Any breaking change bumps this to `@2` and requires updating the backend validator in the same commit as the schema change.
- Storage keys: none for this plugin; the spec is transient per session.

## Error Handling

- Empty selection: extract button is disabled and the summary shows "select a frame or component to start".
- Unsupported node type (vector, text layer at the top level): the node is skipped and counted in a "skipped" footer note; the extraction still returns the remaining specs.
- Backend enrichment failure: the UI keeps the local spec visible, shows the typed error with a retry button, and allows copy/download of the raw version as a fallback.
- Schema mismatch (backend returns a different `schema` value): the UI treats the response as invalid, shows a clear error, and falls back to the raw local spec.

## Verification Criteria

- Selecting a component with an auto-layout frame produces a spec whose `autoLayout.mode` and `padding` match Figma's displayed values.
- Copying the raw spec, pasting it into a JSON validator, and running it against the declared TypeScript schema produces zero errors.
- The backend enrichment round-trip preserves the `id`, `name`, `type`, `schema`, and non-token fields exactly, only modifying `fills`, `strokes`, `variants`, and adding `enriched: true`.
- The UI never imports `figma.*`. Grep confirms.
- Copying or downloading works offline (no backend) and the spec version is always `'figma-plugin-forge/component-spec@1'`.

## Notes

- The backend is deliberately additive. A user who never clicks "enrich" gets a complete local spec and never makes a network call.
- Variant handling assumes the node has `componentPropertyDefinitions`. Plain frames without variants return an empty `variants` object, not `undefined`, so downstream consumers can always enumerate keys without a null check.
- A future version may add an "apply suggestions" mode that writes token references back to the Figma variables, but that crosses into edit-territory and is deliberately out of scope for v1.
