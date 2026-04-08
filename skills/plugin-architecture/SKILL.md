---
name: plugin-architecture
description: Use when questions arise about the build pipeline, shared package, CSS/Tailwind, manifest.json, or plugin project structure
---

# Plugin Architecture

Reference skill for Figma plugin project structure, build pipeline, shared package
organization, CSS/Tailwind setup, and manifest configuration.

## Build Pipeline

Three-step build process:

```
1. tailwindcss --input ./src/input.css --output ./src/output.css
2. build-figma-plugin --typecheck --minify  ->  build/main.js + build/ui.js
3. node ../../packages/shared/scripts/build-html.js  ->  build/ui.html
```

`build-html.js` does the following:
- Reads `build/ui.js` and `src/output.css`
- Embeds CSS in a `<style>` tag
- Declares `__FIGMA_COMMAND__` and `__SHOW_UI_DATA__` globals in a script tag before plugin JS
- Embeds JS in a separate `<script>` tag (two-tag pattern, no escaping needed)
- Wraps content in `<div id="create-figma-plugin">`
- Outputs `build/ui.html`

IMPORTANT: The two-separate-script-tags pattern (globals in one, plugin JS in another)
is the correct approach. Copy it exactly for new plugins.

## Standard Plugin Folder Layout

```
plugins/<name>/
├── package.json
├── manifest.json
├── tsconfig.json
├── tailwind.config.js
├── README.md
├── AGENTS.md
├── src/
│   ├── main.ts          # Figma sandbox (no DOM, no network)
│   ├── ui.tsx            # Bootstrap: export default function(rootNode)
│   ├── App.tsx           # Root Preact component
│   ├── input.css         # Tailwind input
│   ├── output.css        # Generated — do not edit
│   ├── types.ts          # Local types
│   ├── components/       # UI components
│   ├── hooks/            # Preact hooks
│   ├── controllers/      # Backend HTTP controllers
│   ├── services/         # Local services
│   └── rules/            # (audit plugins) Rule definitions
└── build/                # Generated output — do not edit
```

Not every plugin needs all folders. The key separation is:
- `main.ts`: Figma APIs, selection, export, navigation, storage bridge
- `ui.tsx`: UI bootstrap (`export default function(rootNode: HTMLElement)`)
- `App.tsx`: state orchestration and main UI flow
- `controllers/` or `services/`: API calls, transformations, side effects
- `components/`: visual building blocks

## manifest.json

```json
{
  "api": "1.0.0",
  "editorType": ["figma", "dev"],
  "id": "YOUR_PLUGIN_ID",
  "name": "Plugin Name",
  "main": "build/main.js",
  "ui": "build/ui.html",
  "capabilities": ["inspect"],
  "permissions": [],
  "documentAccess": "dynamic-page",
  "networkAccess": {
    "allowedDomains": ["https://YOUR_PROJECT_ID.supabase.co"]
  }
}
```

Notable fields:
- `enablePrivatePluginApi: true` — required if you need `figma.fileKey`
- `documentAccess: "dynamic-page"` — standard for plugins that traverse nodes
- `capabilities: ["inspect"]` — enables Dev Mode inspection panel
- `networkAccess.allowedDomains` — whitelist domains the UI iframe can reach

## package.json Scripts

```json
{
  "scripts": {
    "dev": "npm run build && npm run watch",
    "build": "npm run build:css && npm run build:js && npm run build:html",
    "build:css": "tailwindcss --input ./src/input.css --output ./src/output.css",
    "build:js": "build-figma-plugin --typecheck --minify",
    "build:html": "node ../../packages/shared/scripts/build-html.js",
    "watch": "npm run build:css && concurrently npm:watch:css npm:watch:js",
    "watch:css": "tailwindcss --input ./src/input.css --output ./src/output.css --watch",
    "watch:js": "build-figma-plugin --typecheck --watch"
  }
}
```

`build-figma-plugin` config goes in package.json under `"figma-plugin"` key:
```json
{
  "figma-plugin": {
    "id": "YOUR_PLUGIN_ID",
    "name": "Plugin Name",
    "main": "src/main.ts",
    "ui": "src/ui.tsx"
  }
}
```

## Shared Package (@figma-forge/shared)

Four export paths:

### `/ui` — Shared UI components
Button, Card, Tabs, Badge, LoadingSpinner, ErrorMessage, Input, Switch,
Collapsible, ContentInfo. ALL UI components that appear in 2+ plugins MUST
live here. Never duplicate shared components locally.

### `/services` — Bridge and infrastructure
- `figmaBridge` — storage, selection, focus communication helpers
- `supabaseConfig` — Supabase client initialization
- `supabaseAuth` — authentication helpers

### `/types` — Cross-plugin contracts
- Common types: `ApiFrame`, `SelectionInfo`
- Analysis types: `AnalysisResult`, `AnalysisSection`
- Shared types are contracts — changes affect all consumers

### `/styles` — Base CSS
- `base.css` with CSS custom properties for theming
- Imported by all plugins via their `input.css`

## CSS Pipeline

```
packages/shared/styles/base.css (CSS variables, base styles)
  |
  v
packages/shared/tailwind.config.base.js (theme extension using CSS vars)
  |
  v
plugins/<name>/tailwind.config.js (extends base + local content paths)
  |
  v
plugins/<name>/src/input.css (@import tailwindcss, @source shared, @import base.css)
  |
  v
tailwindcss CLI -> plugins/<name>/src/output.css
  |
  v
build-html.js -> embedded in build/ui.html <style> tag
```

Each plugin's `tailwind.config.js` must include content paths for both local
components and shared UI components so that Tailwind scans all used classes.

## How to Add a New Plugin

1. Create folder in `plugins/<name>/`
2. Copy config files from an existing plugin (simplest reference plugin is best)
3. Update `manifest.json` with new ID, name, and capabilities
4. Update root `package.json` with new workspace scripts
5. Run `npm install` from root to link workspaces
6. `npm run <name>:dev` to start developing
7. Create `README.md` (human-facing) and `AGENTS.md` (agent-facing)

## When to Modify Shared vs Local

| Scenario | Location |
|---|---|
| New component used by 2+ plugins | `packages/shared/ui/` |
| New component used by 1 plugin | plugin's `src/components/` |
| New cross-plugin type | `packages/shared/types/` |
| Plugin-specific types | plugin's `src/types.ts` |
| Bridge/messaging helper | `packages/shared/services/figmaBridge.ts` |
| Plugin-specific controller | plugin's `src/controllers/` |
| Base style or CSS variable | `packages/shared/styles/base.css` |
| Plugin-specific style | plugin's `src/input.css` |

## Runtime Separation Rules

- `main.ts` MUST NOT import DOM, browser, or network code
- UI code MUST NOT import `figma.*` APIs
- All communication crosses the message bridge — keep it typed
- Backend contract changes require updating producer, consumer, and types together
- Storage keys in `figma.clientStorage` are stable contracts — never rename without migration

## Common Mistakes

- Mixing Figma runtime logic with iframe code without clear boundary
- Duplicating shared primitives locally instead of importing from `@figma-forge/shared/ui`
- Changing backend payloads without updating shared types and all consumers
- Creating local docs that repeat global rules instead of referencing them
- Editing generated files (`output.css`, `build/`) instead of their sources
- Using `innerHTML` with `</script>` in UI code — breaks Figma's iframe sandbox
- Using JSX fragments `<>...</>` — build doesn't support `jsxFragmentFactory`
- Forgetting `export default function(rootNode: HTMLElement)` in `ui.tsx`
