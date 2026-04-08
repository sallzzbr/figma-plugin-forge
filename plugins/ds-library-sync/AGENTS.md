# DS Library Sync — Agent Guide

## Architecture

```
src/
  main.ts              # Figma sandbox thread — extraction, storage bridge
  ui.tsx               # Preact bootstrap (entry point for @create-figma-plugin/build)
  App.tsx              # Root UI component — state machine + orchestration
  types.ts             # All type definitions (state, models, messages)
  services/
    api.ts             # HTTP client for Supabase Edge Functions
    diff.ts            # Diff engine: compare extracted vs stored components
    extract.ts         # Post-processing helpers (dedup, sort)
  components/
    SyncPanel.tsx      # Main panel — shows different content per state
    DiffView.tsx       # Diff visualization (added/removed/changed lists)
    LoginPanel.tsx     # Email/password auth form
```

## State Machine

```
init ──> extracting ──> comparing ──> diff_ready ──> [login] ──> pushing ──> done
  ^                                       |                                    |
  +───────────────────── (reset) ─────────+────────────────────────────────────+
  
Any state ──> error ──> (retry returns to retryState)
```

### States

| State        | What happens                                              |
|-------------|-----------------------------------------------------------|
| `init`       | Waiting for user to click "Start Extraction"              |
| `extracting` | main.ts iterates pages, extracts components + tokens      |
| `comparing`  | UI fetches stored state from backend, computes diff       |
| `diff_ready` | Shows diff summary + detail; user can push or reset       |
| `login`      | Auth form shown when no valid session exists               |
| `pushing`    | Sending updated library state to backend                  |
| `done`       | Push complete, shows results                               |
| `error`      | Error occurred; retry button returns to `retryState`       |

## Message Contracts

### Main -> UI

| Message                | Payload                                       |
|------------------------|-----------------------------------------------|
| `file-key`             | `{ fileKey, fileName }`                       |
| `extraction-progress`  | `{ current, total }` (pages scanned)          |
| `extraction-complete`  | `{ components[], tokens[] }`                  |
| `extraction-error`     | `{ error: string }`                           |
| `storage-value`        | `{ key, value, requestId }`                   |
| `storage-set`          | `{ key, success, requestId }`                 |
| `storage-error`        | `{ key, error, requestId }`                   |

### UI -> Main

| Message         | Payload                                  |
|-----------------|------------------------------------------|
| `extract-data`  | `{}` (triggers full extraction)          |
| `get-storage`   | `{ key, defaultValue?, requestId }`      |
| `set-storage`   | `{ key, value, requestId }`              |

## Key Conventions

- **Preact, not React** — Use `import { h } from 'preact'`, never `import React`
- **Shared UI components** — Always import from `@figma-forge/shared/ui`
- **Shared services** — Auth and config from `@figma-forge/shared/services`
- **No JSX fragments** — Use `<div>` wrappers instead of `<>...</>`
- **No innerHTML with HTML** — Use `textContent` to avoid breaking Figma's sandbox
- **enablePrivatePluginApi** — Must be in both `manifest.json` and `package.json`
- **Build pipeline** — `tailwindcss` -> `build-figma-plugin` -> `build-html.js`
