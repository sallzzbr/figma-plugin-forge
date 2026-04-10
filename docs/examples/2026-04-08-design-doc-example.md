# Frame Review Assistant - Design Doc

**Date**: 2026-04-08
**Status**: Approved
**Target repo**: new project
**Related pattern(s)**: `docs/patterns/llm-analysis.md`, `docs/patterns/runtime-split.md`, `docs/patterns/messaging-bridge.md`
**Related plan**: `docs/examples/2026-04-08-implementation-plan-example.md`

## Problem

Product designers want quick, structured feedback on selected frames without leaving Figma, but they do not want a fully automated redesign tool.

## Solution

Build a plugin that exports selected frames, collects short context from the user, sends both to an optional backend, and returns sectioned feedback focused on strengths, issues, and recommendations.

## Architecture

- Pattern choice from `figma-plugin-forge`: LLM analysis with explicit runtime split and typed messaging
- Target repo decisions: a single-screen UI, one optional backend endpoint, and result items that can focus nodes back on canvas
- Runtime pieces: Figma main thread, UI iframe, optional backend

## UI Layout

- Single screen with three sections
- Selection summary
- Context textarea plus analyze action
- Result panel with grouped findings

## Runtime Responsibilities

### Main thread

- Watch selection changes
- Export selected frames as downscaled images
- Focus a node when the user clicks a finding

### UI iframe

- Display current selection
- Collect product context
- Call the backend
- Render grouped feedback

### Backend

- Validate request shape
- Call the model
- Normalize output into a stable response schema

## User Flow

1. User selects one or more frames
2. Plugin shows the current selection summary
3. User adds product context
4. User clicks analyze
5. Plugin renders grouped findings and allows focus-back navigation

## Data Flow

Selection changes in Figma trigger a normalized message from main to UI. When the user requests analysis, the UI asks main for exported images, then sends the export plus context to the backend. The backend returns structured findings that the UI renders directly.

## Interfaces and Contracts

- `selection-changed`: `{ items, pageName }`
- `export-selection-request`: `{ format }`
- `export-selection-response`: `{ frames }`
- Backend request: `{ context, frames: [{ id, name, imageBase64, imageType }] }`
- Backend response: `{ sections: [{ title, items: [{ summary, severity, nodeId? }] }] }`

## Error Handling

- Empty selection disables analysis
- Export failures surface a user-readable error
- Backend failures return a retryable message in the UI
- Malformed backend output is treated as a rendering error with fallback copy

## Verification Criteria

- A selected frame can be exported and analyzed
- The UI never accesses `figma.*` directly
- Clicking a finding with `nodeId` focuses the related node
- The documented request and response shapes match the implementation

## Notes

The backend is optional at the repository level but required for this plugin pattern.
