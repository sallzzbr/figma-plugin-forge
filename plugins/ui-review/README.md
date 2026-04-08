# UI Review Plugin

A simplified Figma plugin that sends selected frames to an LLM for UX/UI analysis via a Supabase Edge Function backend.

## What it demonstrates

- **Frame export**: Selecting frames in Figma and exporting them as downscaled JPEG base64 images
- **LLM analysis**: Sending frame images + user context to a backend for AI-powered review
- **Structured results**: Rendering scored, sectioned analysis with verdict banners and status icons
- **Shared UI**: Using `@figma-forge/shared/ui` components (Button, Card, Badge, Collapsible, etc.)
- **Figma Bridge**: Real-time selection monitoring via the shared `figmaBridge` service

## Backend setup required

This plugin calls `POST ${SUPABASE_URL}/functions/v1/analyze` with:

```json
{
  "context": "string — user-provided product/screen description",
  "frames": [
    { "name": "Frame 1", "image": "base64...", "imageType": "image/jpeg" }
  ]
}
```

You must deploy an `analyze` Edge Function in your Supabase project that:
1. Accepts the payload above
2. Sends frame images + context to an LLM (e.g., GPT-4o, Claude)
3. Returns an `AnalyzeResponse` matching the schema in `src/types.ts`

Update `manifest.json` and `package.json` with your Supabase project URL.

## How to run

```bash
# From the monorepo root
npm install
npm run ui-review:dev

# Or from the plugin directory
cd plugins/ui-review
npm run dev
```

Load the plugin in Figma via `Plugins > Development > Import plugin from manifest...` and select `plugins/ui-review/manifest.json`.

## Architecture

```
src/
  main.ts              — Figma sandbox: selection monitoring + JPEG export
  ui.tsx               — Preact bootstrap (entry point)
  App.tsx              — Single-screen flow: select → context → analyze → results
  types.ts             — Local types + re-exports from shared
  hooks/
    useFigmaSelection  — Selection state + frame export
    useAnalysis         — Loading/result/error state for analysis
  controllers/
    analyze.ts         — HTTP client for the analyze edge function
  components/
    AnalysisPanel.tsx   — Frame thumbnails, context input, analyze button
    ResultView.tsx      — Verdict banner, scores, sectioned items
```
