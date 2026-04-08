# @figma-forge/shared -- Agent Context

## Responsibility

Shared package across all Figma plugins. Exports UI components, services, types, and styles. Any change here can impact more than one workspace.

## Core files

- `ui/index.ts` -- reusable Preact components
- `services/figmaBridge.ts` -- UI <-> Figma sandbox communication, storage, export, and focus
- `types/` -- shared TypeScript types
- `styles/base.css` -- base CSS and visual tokens
- `scripts/build-html.js` -- pipeline to generate ui.html with embedded CSS and JS

## Contracts

Export paths defined in `package.json`:

| Export | Path | Provides |
|--------|------|----------|
| `@figma-forge/shared/ui` | `./ui/index.ts` | Reusable Preact components |
| `@figma-forge/shared/services` | `./services/index.ts` | Figma bridge and shared services |
| `@figma-forge/shared/types` | `./types/index.ts` | Shared TypeScript types |
| `@figma-forge/shared/styles` | `./styles/base.css` | Base CSS and visual tokens |

## Dependencies

- Preact (UI)
- Figma Plugin API (via figmaBridge)
- Consumed by: all plugins in this monorepo

## Limits and restrictions

- Do not promote plugin-specific code to shared without real reuse across more than one workspace
- Changes in `ui/` affect multiple plugins simultaneously
- Changes in `services/` can break bridge or fetches
- The CSS pipeline depends on `styles/base.css` being imported by each plugin's `input.css`

## How to work here

- Visual change: read `ui/index.ts` and the corresponding exported component
- Bridge or HTTP change: read `services/index.ts` and the concrete service
- Contract change: read `types/index.ts` and then all consumers of the changed type

CSS pipeline:

```text
packages/shared/styles/base.css
  -> plugins/<plugin>/src/input.css
  -> plugins/<plugin>/src/output.css
  -> plugins/<plugin>/build/ui.html
```

## Sensitive contracts

- Changes in `types/` are contract changes and require synchronization with all consumer plugins
- When modifying a shared type, review: (1) the data producer, (2) the data consumer, (3) documentation for the affected area
- Changes in `ui/` and `services/` must also be validated against all dependent workspaces before merge
