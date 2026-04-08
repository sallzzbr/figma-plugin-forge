# spec-generator -- Agent Context

## Architecture

```
src/
  main.ts                      # Figma sandbox: selection monitoring, JPEG export, storage bridge
  ui.tsx                       # Preact bootstrap (entry point for @create-figma-plugin/build)
  App.tsx                      # Single-mode UI: select -> context -> generate -> results
  types.ts                     # SpecResult type definition
  hooks/
    useFigmaSelection.ts       # Selection state, frame export, reorder/remove
    useSpecGeneration.ts       # Generation lifecycle (idle/loading/success/error)
  controllers/
    generate-spec.ts           # HTTP POST to generate-spec edge function
  components/
    SpecResult.tsx             # Renders structured spec with Card, Badge, Collapsible
```

## Data flow

1. **Selection** -- `main.ts` monitors `figma.on("selectionchange")` and posts `selection-changed` to UI
2. **Export** -- UI sends `request-selection-export`, main thread exports as JPEG base64, responds with `selection-exported`
3. **Generation** -- `useSpecGeneration` hook calls `generateSpec()` controller
4. **Controller** -- `POST ${SUPABASE_URL}/functions/v1/generate-spec` with `{ context, frames }`
5. **Result** -- Edge function returns `SpecResult` JSON, rendered by `SpecResultView`

## generate-spec endpoint contract

### Request

```
POST /functions/v1/generate-spec
Content-Type: application/json
Authorization: Bearer <ANON_KEY>

{
  "context": "string -- description of the product/feature",
  "frames": [
    {
      "name": "string -- frame name",
      "imageBase64": "string -- base64-encoded JPEG"
    }
  ]
}
```

### Response (200)

```json
{
  "summary": "Brief overview of the feature",
  "requirements": [
    {
      "id": "REQ-001",
      "title": "Requirement title",
      "description": "Detailed description",
      "priority": "must | should | could | wont"
    }
  ],
  "acceptanceCriteria": [
    "Given X, when Y, then Z"
  ],
  "testScenarios": [
    {
      "name": "Scenario name",
      "steps": ["Step 1", "Step 2"],
      "expected": "Expected outcome"
    }
  ]
}
```

## Key patterns

- Uses `@figma-forge/shared/ui` for all UI components (Button, Card, Badge, Input, LoadingSpinner, ErrorMessage, Collapsible)
- Uses `@figma-forge/shared/services` for Figma bridge (selection, storage, file key) and Supabase config
- Preact with `h` from preact (NOT React)
- Entry point: `export default function(rootNode: HTMLElement)` required by @create-figma-plugin/build
- NEVER use `innerHTML` with HTML tags -- use `textContent` (Figma sandbox restriction)
- NEVER use JSX fragments (`<>...</>`) -- use wrapper `<div>` instead
