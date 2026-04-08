# UI Review Plugin — Agent Context

## Architecture

This is a Figma plugin using the `@create-figma-plugin/build` toolchain with Preact for UI rendering.

### Thread model
- **Main thread** (`src/main.ts`): Runs in Figma's sandbox. Has access to `figma.*` APIs but NO network access. Handles selection monitoring and frame export.
- **UI thread** (`src/ui.tsx` + all Preact components): Runs in an iframe. Has network access (fetch) but NO direct Figma API access. Communicates with main via `postMessage`.

### Data flow
```
Figma Canvas
  -> main.ts (selectionchange event)
  -> postMessage("selection-changed")
  -> useFigmaSelection hook (updates UI state)

User clicks "Add frames"
  -> postMessage("request-selection-export")
  -> main.ts exports frames as JPEG base64
  -> postMessage("selection-exported", frames[])
  -> useFigmaSelection stores frames

User clicks "Analyze UI"
  -> useAnalysis.run(frames, context)
  -> controllers/analyze.ts -> POST /functions/v1/analyze
  -> AnalyzeResponse -> ResultView renders sections/scores/verdict
```

## Contracts

### Message types (main <-> UI)
| Direction | Type | Payload |
|-----------|------|---------|
| main -> UI | `selection-changed` | `{ count, names[] }` |
| UI -> main | `request-selection-export` | (none) |
| main -> UI | `selection-exported` | `{ frames: ExportedFrame[] }` |
| main -> UI | `selection-export-error` | `{ error: string }` |
| UI -> main | `focus-node` | `{ nodeId: string }` |
| UI -> main | `check-selection` | (none) |

### Backend endpoint
- **URL**: `${SUPABASE_URL}/functions/v1/analyze`
- **Method**: POST
- **Headers**: anon key auth (via `anonHeaders()`)
- **Request body**: `{ context: string, frames: [{ name, image, imageType }] }`
- **Response**: `{ slug, prompt_version, result: AnalysisContent }`

### Key types
- `ExportedFrame` — `{ id, name, imageBase64, imageType }`
- `AnalysisContent` — `{ sections[], score?, verdict? }`
- `AnalysisSection` — `{ title, items: AnalysisItem[] }`
- `AnalysisItem` — `{ label, status, description, recommendation? }`
- `ScoreBreakdown` — `{ overall, categories[] }`
- `AnalysisVerdict` — `{ label, description, level }`

## Dependencies
- `@figma-forge/shared/ui` — Button, Card, Badge, Input, LoadingSpinner, ErrorMessage, Collapsible, ScoreDisplay
- `@figma-forge/shared/services` — requestSelectionExport, onSelectionChange, SUPABASE_CONFIG, anonHeaders
- `@figma-forge/shared/types` — AnalysisContent, AnalysisSection, AnalysisItem, etc.

## Build
```bash
npm run build   # CSS -> JS -> HTML
npm run dev     # build + watch
```
The `build:html` step uses the shared `build-html.js` script to embed CSS+JS into a single `ui.html`.
