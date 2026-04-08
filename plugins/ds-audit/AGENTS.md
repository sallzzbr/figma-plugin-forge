# DS Audit - Agent Instructions

## Architecture

```
ds-audit/
  package.json          # Workspace config, scripts, figma-plugin metadata
  manifest.json         # Figma plugin manifest (loaded by Figma)
  tsconfig.json         # Extends @create-figma-plugin/tsconfig
  tailwind.config.js    # Extends shared base + local content paths
  src/
    input.css           # Tailwind entry (imports shared styles)
    main.ts             # Figma sandbox (main thread) -- no DOM, no fetch
    ui.tsx              # UI entry point -- renders App into rootNode
    App.tsx             # Root component with Tabs (Analyze, Settings)
    types.ts            # All type contracts (rules, violations, messages)
    rules/
      index.ts          # RULES registry + runEnabledRules()
      walk.ts           # Recursive node traversal with skip logic
      helpers.ts        # createViolation(), type guards
      color-variables.ts    # Color rule implementation
      spacing-variables.ts  # Spacing rule implementation
    components/
      AnalyzePanel.tsx  # Main analysis UI with results grouped by rule
      SettingsPanel.tsx  # Rule toggle switches
```

## Contracts

### Message types (UI <-> Main thread)

UI -> Main:
- `ping` -- health check
- `load-rules-config` -- request stored config
- `save-rules-config` -- persist config changes
- `analyze-selection` -- run enabled rules on selection (or full page)
- `focus-node` -- navigate to a specific node

Main -> UI:
- `pong` -- health check response
- `selection-changed` -- selection updated (count, items, pageName)
- `rules-config-loaded` -- stored config data
- `analysis-results` -- violations array
- `analysis-error` -- error string

### Storage keys

- `ds-audit:rulesConfig` -- `Record<string, boolean>` persisted via `figma.clientStorage`

## Rules engine

Each rule:
1. Receives `readonly SceneNode[]` (root nodes)
2. Uses `walkNodes()` to traverse, which handles skip logic (hidden, internal, underscore-prefix, etc.)
3. Returns `RuleViolation[]` with nodeId, message, layerPath, parentName

To add a rule: create file in `rules/`, export check function, register in `RULES` array in `rules/index.ts`.

## Build pipeline

1. `build:css` -- Tailwind compiles `src/input.css` -> `src/output.css`
2. `build:js` -- `@create-figma-plugin/build` compiles TS/TSX -> `build/main.js` + `build/ui.js`
3. `build:html` -- `build-html.js` embeds CSS + JS into `build/ui.html`

## Key constraints

- UI framework: **Preact** (not React). Use `h` from preact.
- Entry pattern: `export default function(rootNode: HTMLElement)` required by @create-figma-plugin/build
- No JSX fragments -- use wrapper `<div>` instead
- Never use `innerHTML` with HTML tags -- breaks Figma's embedded UI sandbox
- No network access -- this plugin runs entirely locally
- Shared components from `@figma-forge/shared/ui`: Button, Card, Badge, Tabs, Switch, Collapsible, etc.
