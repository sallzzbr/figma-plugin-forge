# plugins/ -- Agent Context

## Responsibility
This is the parent directory for all plugin workspaces. Each subdirectory is an independent Figma plugin, but all follow the same structural model.

## Standard Files
By convention, each plugin has:
- `src/main.ts`: runs in the Figma sandbox (no DOM, no network)
- `src/ui.tsx`: bootstrap for the UI iframe
- `src/App.tsx`: root UI component
- `package.json` and `manifest.json`: plugin configuration

## Shared Conventions
- UI: Preact with Tailwind CSS
- Build: @create-figma-plugin/build
- Shared components and services: @figma-forge/shared
- Plugins must be closed and reopened in Figma to reflect code changes

## Plugin Overview

| Plugin | Role |
|--------|------|
| ds-audit | Local design system audit -- checks colors, spacing, typography against DS standards |
| ui-review | AI-powered UX/UI analysis -- sends frames to LLM for heuristic evaluation |
| ds-library-sync | DS library extraction and sync -- extracts components/tokens and pushes to backend |
| spec-generator | Requirements generation -- creates structured specs from selected frames via LLM |

## How to Work Here

### Selection, export, storage, or focus flows
Start at `src/main.ts` and the bridge services.

### UI-only flows
Start at `src/App.tsx`, `src/components/`, and imports from `@figma-forge/shared/ui`.

### Backend-dependent flows
Read together:
- The plugin's controller or service
- `packages/shared/services` if there is a shared helper
- `backend/supabase/functions`

### Recommended Reading Order
1. `plugins/AGENTS.md` (this file)
2. `plugins/<plugin>/README.md`
3. `plugins/<plugin>/AGENTS.md`

## Sensitive Contracts
- Do not alter backend payloads without reviewing consumers and types in all affected plugins
- Do not replicate components from `@figma-forge/shared` locally -- always use the shared package
