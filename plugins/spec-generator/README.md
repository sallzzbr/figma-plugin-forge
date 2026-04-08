# spec-generator

A Figma plugin that generates structured product specifications from selected frames using an LLM backend.

## What it demonstrates

- Frame selection monitoring and JPEG export from the Figma main thread
- Sending frame screenshots + text context to a Supabase Edge Function
- LLM-powered generation of structured output (requirements, acceptance criteria, test scenarios)
- Rendering diverse result schemas with shared UI components (Card, Badge, Collapsible)
- Shows that the figma-plugin-forge framework supports output schemas beyond simple analysis

## Backend setup

1. Deploy the `generate-spec` edge function from `backend/supabase/functions/generate-spec/`
2. Set the `OPENAI_API_KEY` secret in your Supabase project
3. Update `packages/shared/services/supabaseConfig.ts` with your project URL and anon key
4. Update `networkAccess.allowedDomains` in `package.json` and `manifest.json` with your Supabase URL

## How to run

```bash
# From the monorepo root
npm install
npm run spec-generator:dev

# Or from this directory
npm run dev
```

Load the plugin in Figma via "Import plugin from manifest" pointing to `plugins/spec-generator/manifest.json`.

## Usage

1. Select one or more frames/components in Figma
2. Click "Capture selection" to export them as screenshots
3. Enter a context description for the feature/product
4. Click "Generate Spec" to send to the LLM
5. Review the generated specification (summary, requirements, acceptance criteria, test scenarios)
6. Click "Copy all" to export as plain text
