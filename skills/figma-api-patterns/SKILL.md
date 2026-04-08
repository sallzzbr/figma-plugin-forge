---
name: figma-api-patterns
description: Use when working with Figma Plugin API -- selection handling, node traversal, export, variables, styles, boundVariables, and storage patterns
---

# Figma API Patterns

Reference skill for working with the Figma Plugin API. Covers runtime boundaries,
selection handling, node traversal, image export, variables/styles, storage, and
common gotchas.

## Runtime Boundaries

### Main thread (`src/main.ts`) — Figma sandbox
- Can access: `figma.currentPage`, `figma.on()`, `figma.clientStorage`, node properties, `exportAsync`
- CANNOT access: DOM, `fetch`, browser APIs, `window`, `document`

### UI thread (`src/ui.tsx`, `App.tsx`) — iframe
- Can access: DOM, `fetch`, Preact rendering, `window`, browser APIs
- CANNOT access: `figma.*` directly

### Communication between threads
```typescript
// Main -> UI
figma.ui.postMessage({ type: 'some-event', payload })

// UI -> Main
parent.postMessage({ pluginMessage: { type: 'some-action', payload } }, '*')

// Listening in main
figma.ui.onmessage = (msg) => { /* handle msg */ }

// Listening in UI
window.onmessage = (event) => {
  const msg = event.data.pluginMessage
  if (!msg) return
  // handle msg
}
```

## Selection Handling

```typescript
figma.on("selectionchange", () => {
  const selection = figma.currentPage.selection
  const filtered = selection.filter(n => SUPPORTED_TYPES.has(n.type))
  figma.ui.postMessage({
    type: 'selection-changed',
    count: filtered.length,
    items: filtered.map(n => ({ name: n.name, type: n.type, id: n.id })),
    pageName: figma.currentPage.name,
  })
})
```

Keep `SUPPORTED_TYPES` in `main.ts` — changing it affects which nodes enter analysis flows.

## Node Traversal

Recursive walk pattern used by the rules engine:

```typescript
function walkNodes(nodes: readonly SceneNode[], visitor: (node: SceneNode) => void) {
  for (const node of nodes) {
    // Skip invisible nodes
    if ('visible' in node && node.visible === false) continue
    // Skip infrastructure types
    if (node.type === 'PAGE' || node.type === 'DOCUMENT') continue
    // Skip user-ignored nodes (names starting with _)
    if (node.name.startsWith('_')) continue

    // SECTION: skip the section itself but still walk children
    if (node.type === 'SECTION') {
      if ('children' in node) walkNodes(node.children, visitor)
      continue
    }

    visitor(node)

    if ('children' in node) {
      walkNodes((node as any).children, visitor)
    }
  }
}
```

Key points:
- Use `await figma.getNodeByIdAsync(id)` for deferred node access
- `getMainComponentAsync()` resolves instances to their main component
- Normalize variants to `COMPONENT_SET` parent when applicable

## Image Export

```typescript
const bytes = await node.exportAsync({
  format: 'JPG',
  constraint: { type: 'SCALE', value: 0.5 } // downscale for payload size
})
const base64 = figma.base64Encode(bytes)
```

Always downscale exports intended for AI or network payloads — full resolution
images produce unnecessarily large payloads.

## Variables and Styles (CRITICAL GOTCHAS)

### 1. boundVariables on nodes

Object mapping property names to variable bindings:
- `node.boundVariables?.fills` — array of fill variable bindings
- `node.boundVariables?.strokes` — stroke variable bindings
- `node.boundVariables?.paddingTop/Right/Bottom/Left` — spacing variables
- `node.boundVariables?.itemSpacing` — auto-layout gap variable
- `node.boundVariables?.cornerRadiusTopLeft/etc.` — border radius variables

### 2. fillStyleId vs boundVariables.fills — DIFFERENT concepts

- `fillStyleId`: references a **Color Style** (named style in Figma library)
- `boundVariables.fills`: references **Color Variables**
- Design systems often use Styles, not Variables. Rules must check BOTH.
- `fillStyleId: string | typeof figma.mixed` — empty string `""` when no style

### 3. StyledTextSegment.boundVariables — limited keys

Only supports `VariableBindableTextField` keys:
- `fontSize`, `fontFamily`, `letterSpacing`, `lineHeight`
- `paragraphSpacing`, `paragraphIndent`
- **`fills` is NOT valid** on text segments — `seg.boundVariables?.fills` is always `undefined`

### 4. Text fill colors — check multiple locations

```typescript
// Variable binding on the node itself
node.boundVariables?.fills
// Text-range specific variable binding
node.boundVariables?.textRangeFills
// Color Style reference
node.fillStyleId  // string | mixed — "" when no style
```

### 5. Paint-level variable bindings

`SolidPaint.boundVariables?.color` for individual paint variable binding.

### 6. strokeStyleId

`string` type — empty string `""` when no style is applied.

## Resolving Variables

```typescript
// Get variable details from a binding
const binding = node.boundVariables?.fills?.[0]
if (binding) {
  const variable = await figma.variables.getVariableByIdAsync(binding.id)
  // variable.name, variable.resolvedType, variable.variableCollectionId
}
```

## Storage Patterns

```typescript
// In main thread only — clientStorage is async
const STORAGE_KEY = 'ds-audit:rulesConfig'
const saved = await figma.clientStorage.getAsync(STORAGE_KEY)
await figma.clientStorage.setAsync(STORAGE_KEY, config)
```

Storage keys are stable contracts — never rename without migration.

## Node Focus / Navigation

```typescript
async function focusNode(nodeId: string) {
  const node = await figma.getNodeByIdAsync(nodeId)
  if (node && !['DOCUMENT', 'PAGE'].includes(node.type)) {
    figma.currentPage.selection = [node as SceneNode]
    figma.viewport.scrollAndZoomIntoView([node as SceneNode])
  }
}
```

## Common Gotchas Checklist

- Never use `innerHTML` with closing-script tags in UI code — it breaks Figma's iframe sandbox
- Never use JSX fragments `<>...</>` — the build pipeline doesn't support `jsxFragmentFactory`. Use a wrapper `<div>` instead.
- `figma.fileKey` requires `enablePrivatePluginApi: true` in `manifest.json` — without it, always returns `null`
- Plugin must be closed and reopened in Figma to see code changes after rebuild
- `export default function(rootNode: HTMLElement)` is required by `@create-figma-plugin/build`
- Use `h` from `preact`, NOT from `react`
- `node.visible` may not exist on all node types — check with `'visible' in node`
- Always type messages between UI and main — no loose strings

## Rules Engine Pattern

For audit plugins that check design system compliance:

1. `index.ts` registers rules with `id`, `label`, `shortLabel`, `defaultEnabled`, `check`
2. `runEnabledRules()` executes each enabled rule
3. Each rule receives `readonly SceneNode[]`, uses `walkNodes()`, returns `RuleViolation[]`
4. Rules must be pure — no side effects, only inspect and return violations
5. `helpers.ts` provides `createViolation(ruleId, node, parentPath, message)`
6. Rule `id` is a stable contract — filters and storage depend on it; never rename without migration

### Adding a new rule

1. Create `src/rules/<category>-variables.ts`
2. Export a function returning `RuleViolation[]`
3. Register in `src/rules/index.ts` with metadata
4. Use `walkNodes()` from `walk.ts` — never implement custom traversal
5. Use `createViolation()` from `helpers.ts`
