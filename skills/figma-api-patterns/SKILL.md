---
name: figma-api-patterns
description: Use when working with the Figma Plugin API — runtime boundaries, selection, export, variables, styles, storage, text, and message passing
---

# Figma API Patterns

This skill is a workflow adapter with an inline quick-reference. The canonical method lives in `AGENTS.md` plus `docs/`.

## Read first

1. `docs/guides/figma-api-reference.md` — curated API with gotchas and correct examples
2. `docs/guides/common-pitfalls.md` — the 15 most common mistakes and their fixes
3. `docs/patterns/runtime-split.md` — which side owns which API
4. `docs/patterns/messaging-bridge.md` — typed message contract
5. `docs/snippets/main-thread.md` — main-thread starter with typed messages
6. `docs/snippets/ui-iframe.md` — UI-side starter with type guards

### Bundle mode note

If files 1-2 above are not on disk, you are in bundle mode. The quick-references below cover the most critical patterns, but they are not a full replacement. For the complete API reference and the 15 pitfalls with detailed fixes, clone `figma-plugin-forge` as a sibling:

```
git clone https://github.com/sallzzbr/figma-plugin-forge.git ../figma-plugin-forge
```

Then read `../figma-plugin-forge/docs/guides/figma-api-reference.md` and `../figma-plugin-forge/docs/guides/common-pitfalls.md`.

## Before you write any Figma API code

1. Read `docs/guides/common-pitfalls.md` and keep it open as a checklist.
2. If setting up a new project, follow `docs/guides/project-setup.md` for the recommended stack.
3. Define the message contract in a single `types/messages.ts` file before writing main or UI code.

## Quick reference: type narrowing

Always narrow `SceneNode` before accessing type-specific properties:

```ts
// BAD — crashes at runtime
node.characters

// GOOD — TypeScript narrows after the check
if (node.type === 'TEXT') {
  node.characters
}

// GOOD — check for children
if ('children' in node) {
  for (const child of node.children) { ... }
}
```

Common node types and their exclusive properties:
- `TEXT` → `.characters`, `.fontSize`, `.fontName`, `.getRangeAllFontNames()`
- `FRAME` → `.layoutMode`, `.paddingLeft/Right/Top/Bottom`, `.itemSpacing`
- `COMPONENT` → `.componentPropertyDefinitions`
- `INSTANCE` → `.mainComponent`, `.componentProperties`
- `RECTANGLE`, `ELLIPSE`, `POLYGON`, `STAR` → geometry-specific props

## Quick reference: async APIs

These APIs are async and MUST be awaited:

| API | Returns |
| --- | --- |
| `node.exportAsync(settings)` | `Uint8Array` |
| `figma.loadFontAsync(fontName)` | `void` |
| `figma.getNodeByIdAsync(id)` | `BaseNode \| null` |
| `figma.clientStorage.getAsync(key)` | stored value |
| `figma.clientStorage.setAsync(key, value)` | `void` |
| `figma.variables.getLocalVariablesAsync(type?)` | `Variable[]` |
| `figma.variables.getVariableByIdAsync(id)` | `Variable \| null` |
| `image.getBytesAsync()` | `Uint8Array` |

If an AI writes `figma.variables.getLocalVariables()` (sync), correct it to the async version.

## Quick reference: export patterns

```ts
// Constrained PNG — always set a constraint
const bytes = await node.exportAsync({
  format: 'PNG',
  constraint: { type: 'WIDTH', value: 800 },
})

// SVG — useful for icons
const svg = await node.exportAsync({ format: 'SVG' })
const svgString = new TextDecoder().decode(svg)
```

Never export without a `constraint`. High-resolution exports crash plugins.

## Quick reference: fills

```ts
// Safe solid fill extraction
function getSolidFillColor(node: SceneNode & { fills: readonly Paint[] }): RGB | null {
  const fills = node.fills
  if (!Array.isArray(fills)) return null
  const solid = fills.find((f): f is SolidPaint => f.type === 'SOLID' && f.visible !== false)
  return solid?.color ?? null
}
```

Colors are 0–1 floats, not 0–255 integers. `{ r: 1, g: 0, b: 0 }` is red.

## Quick reference: text modification

```ts
// ALWAYS load fonts first
async function setText(node: TextNode, text: string) {
  const fonts = node.getRangeAllFontNames(0, node.characters.length)
  for (const font of fonts) {
    await figma.loadFontAsync(font)
  }
  node.characters = text
}
```

`fontName` is `{ family: string, style: string }`, not a string.

## Checklist

Before finishing any Figma API work:

- [ ] main thread owns `figma.*`, selection, traversal, export, storage
- [ ] UI iframe owns DOM, fetch, rendering
- [ ] every node property access is guarded by a type narrowing check
- [ ] every async API is properly awaited
- [ ] every export has a size constraint
- [ ] every text modification is preceded by `loadFontAsync`
- [ ] fills are checked for type before assuming `.color` exists
- [ ] all message types are in a single shared file
- [ ] `manifest.json` has correct `documentAccess` and `networkAccess`

## Rule

If you are unsure about an API, read `docs/guides/figma-api-reference.md` before guessing. The pitfalls doc exists because guessing is the most common source of bugs.
