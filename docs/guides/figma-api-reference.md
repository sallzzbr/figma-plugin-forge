# Figma Plugin API — Curated Reference

This guide covers the Figma Plugin API surfaces that matter most for the four archetypes in this repo. It is not a rewrite of the [official Figma Plugin API docs](https://www.figma.com/plugin-docs/); it is a curated subset focused on what AIs and humans get wrong.

Every section follows the same shape: **what it is**, **gotcha**, **correct example**.

## Node Types and Type Narrowing

### What it is

Every element on a Figma canvas is a node. Nodes form a tree rooted at `figma.root`. The most common types:

| Type | When you see it | Key properties |
| --- | --- | --- |
| `PageNode` | A page in the file | `children`, `name` |
| `FrameNode` | Auto-layout containers, top-level frames | `children`, `layoutMode`, `paddingLeft/Right/Top/Bottom`, `itemSpacing` |
| `ComponentNode` | A reusable component definition | `children`, `componentPropertyDefinitions` |
| `InstanceNode` | An instance of a component | `mainComponent`, `componentProperties` |
| `TextNode` | Any text layer | `characters`, `fontSize`, `fontName`, `fills` |
| `RectangleNode` | A rectangle shape | `fills`, `strokes`, `cornerRadius` |
| `VectorNode` | Pen/pencil paths, icons | `vectorPaths`, `fills` |
| `GroupNode` | A group (not a frame) | `children` (no layout properties) |
| `BooleanOperationNode` | Union/subtract/intersect | `booleanOperation`, `children` |

The union type `SceneNode` covers all nodes that can appear on a page. It is the type of elements inside `children` arrays and `selection`.

### Gotcha

`SceneNode` is a wide union. You cannot access `.characters` on a `SceneNode` — only on a `TextNode`. You cannot access `.children` on a `VectorNode`. Always narrow the type before accessing type-specific properties.

### Correct example

```ts
function getTextContent(node: SceneNode): string | null {
  if (node.type !== 'TEXT') return null
  // After this check, TypeScript narrows `node` to TextNode
  return node.characters
}

function walkChildren(node: SceneNode, visitor: (n: SceneNode) => void): void {
  visitor(node)
  if ('children' in node) {
    for (const child of node.children) {
      walkChildren(child, visitor)
    }
  }
}
```

**Rule**: always check `node.type` or use `'property' in node` before accessing properties that do not exist on all node types.

## Selection

### What it is

`figma.currentPage.selection` returns an array of `SceneNode` representing what the user has selected. It is the most common input to any plugin.

### Gotcha

1. **It is a snapshot, not live.** Reading it gives you the array at that moment. If the user changes the selection while your code runs, you see the old value.
2. **It can be empty.** Always handle `selection.length === 0`.
3. **It can contain mixed types.** The user may select a frame, a text node, and a vector all at once.
4. **Writing to it replaces the selection.** `figma.currentPage.selection = [node]` selects that node and deselects everything else.

### Correct example

```ts
figma.on('selectionchange', () => {
  const selection = figma.currentPage.selection
  if (selection.length === 0) {
    figma.ui.postMessage({ type: 'selection-cleared' })
    return
  }

  const items = selection.map((node) => ({
    id: node.id,
    name: node.name,
    type: node.type,
  }))

  figma.ui.postMessage({ type: 'selection-changed', items })
})
```

## Node Traversal

### What it is

Walking the node tree to find, filter, or collect nodes. Three main approaches:

1. **`node.findAll(predicate)`** — returns all descendants matching the predicate (only on nodes with `children`)
2. **`node.findOne(predicate)`** — returns the first matching descendant or `null`
3. **Manual recursion** — when you need custom traversal order or early exit

### Gotcha

1. `findAll` and `findOne` only exist on nodes that have `children` (`FrameNode`, `ComponentNode`, `PageNode`, `GroupNode`, etc.). They do not exist on `TextNode`, `RectangleNode`, `VectorNode`, etc.
2. These methods are synchronous but can be slow on large trees. On pages with thousands of nodes, prefer narrowing the scope (e.g., traverse only selected frames, not the entire page).
3. The predicate receives `SceneNode`, so you still need to narrow the type inside.

### Correct example

```ts
// Find all text nodes in the current page
const textNodes = figma.currentPage.findAll(
  (node) => node.type === 'TEXT'
) as TextNode[]

// Find all frames with auto-layout
const autoLayoutFrames = figma.currentPage.findAll(
  (node) => node.type === 'FRAME' && node.layoutMode !== 'NONE'
) as FrameNode[]

// Manual recursion with early exit
function findFirstText(node: SceneNode): TextNode | null {
  if (node.type === 'TEXT') return node
  if ('children' in node) {
    for (const child of node.children) {
      const found = findFirstText(child)
      if (found) return found
    }
  }
  return null
}
```

## Export

### What it is

`node.exportAsync(settings)` renders a node to an image buffer. Supported formats: `'PNG'`, `'JPG'`, `'SVG'`, `'PDF'`.

### Gotcha

1. **It is async.** Always `await` it.
2. **High resolution = high memory.** `exportAsync({ format: 'PNG', constraint: { type: 'SCALE', value: 4 } })` on a large frame can produce a multi-megabyte buffer that crashes the plugin or the UI if you try to postMessage it directly.
3. **Use `constraint` to control size.** `{ type: 'SCALE', value: 1 }` exports at 1x. `{ type: 'WIDTH', value: 400 }` constrains the width to 400px.
4. **The result is a `Uint8Array`, not a URL or base64.** You need to convert it before sending to the UI or a backend.

### Correct example

```ts
async function exportFrameAsBase64(
  node: SceneNode,
  maxWidth: number = 800
): Promise<string> {
  const bytes = await node.exportAsync({
    format: 'PNG',
    constraint: { type: 'WIDTH', value: maxWidth },
  })

  // Convert Uint8Array to base64 for postMessage or backend
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}
```

**Rule**: always constrain export size. Never export at unbounded resolution.

## Fills, Strokes, and Colors

### What it is

Most visible nodes have `fills` and `strokes` arrays. Each entry is a `Paint` object that can be a solid color, gradient, or image.

### Gotcha

1. **Fills is an array, not a single color.** A node can have zero, one, or many fills stacked on top of each other.
2. **Not all fills are solid.** A `Paint` can be `'SOLID'`, `'GRADIENT_LINEAR'`, `'GRADIENT_RADIAL'`, `'GRADIENT_ANGULAR'`, `'GRADIENT_DIAMOND'`, or `'IMAGE'`. If you assume `.color` exists, you crash on gradients and images.
3. **Colors are 0-1 floats, not 0-255 integers.** `{ r: 1, g: 0, b: 0 }` is red, not `{ r: 255, g: 0, b: 0 }`.
4. **`fills` is read-only by default.** To modify fills, clone the array: `node.fills = [newFill]`.
5. **Image fills contain an `imageHash`, not the image data.** Use `figma.getImageByHash(hash)` then `.getBytesAsync()` to get the actual image bytes.

### Correct example

```ts
function getSolidFillHex(node: SceneNode & { fills: readonly Paint[] }): string | null {
  const fills = node.fills
  if (!Array.isArray(fills)) return null

  const solidFill = fills.find(
    (f): f is SolidPaint => f.type === 'SOLID' && f.visible !== false
  )
  if (!solidFill) return null

  const { r, g, b } = solidFill.color
  const toHex = (v: number) => Math.round(v * 255).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}
```

## Variables and Styles

### What it is

Figma variables (`figma.variables`) hold design tokens (colors, numbers, strings, booleans). Styles (`figma.getLocalPaintStyles()`, `figma.getLocalTextStyles()`, etc.) are the older system for reusable paint and text properties.

### Gotcha

1. **Variables are async to create and resolve.** `figma.variables.getVariableByIdAsync(id)` is async. `figma.variables.getLocalVariablesAsync()` is async. Do not mix them with synchronous traversal without awaiting.
2. **Variable collections group variables.** A variable belongs to a collection. Use `figma.variables.getLocalVariableCollectionsAsync()` to list collections.
3. **Bound variables on nodes.** A node's fill might be bound to a variable. Check `node.boundVariables` to see if a property is token-driven rather than hard-coded.
4. **Styles vs variables.** Styles are the legacy system. Variables are the current system. Both can coexist. Check both when auditing a file.

### Correct example

```ts
async function getColorVariables(): Promise<Array<{ name: string; hex: string }>> {
  const variables = await figma.variables.getLocalVariablesAsync('COLOR')
  return variables.map((v) => {
    // Variables can have multiple modes; read the default mode
    const collection = figma.variables.getVariableCollectionById(v.variableCollectionId)
    const defaultModeId = collection?.defaultModeId ?? ''
    const value = v.valuesByMode[defaultModeId]

    let hex = '#000000'
    if (value && typeof value === 'object' && 'r' in value) {
      const { r, g, b } = value as RGBA
      const toHex = (n: number) => Math.round(n * 255).toString(16).padStart(2, '0')
      hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`
    }

    return { name: v.name, hex }
  })
}
```

## Client Storage

### What it is

`figma.clientStorage` is a per-plugin, per-user key-value store persisted across sessions. Useful for saving settings, preferences, and cached state.

### Gotcha

1. **All methods are async.** `getAsync(key)`, `setAsync(key, value)`, `deleteAsync(key)`, `keysAsync()`.
2. **Values must be JSON-serializable.** No functions, no circular references, no `Uint8Array`.
3. **Size is limited.** Figma does not publish an exact limit, but treat it as "small settings store", not "database". Keep stored values under a few KB.
4. **Failure is silent.** If storage is full or unavailable, `setAsync` may fail without throwing. Always handle the error case.

### Correct example

```ts
type AuditSettings = { level: 'AA' | 'AAA'; minTextSize: number }

const SETTINGS_KEY = 'contrast-auditor.settings-v1'

async function loadSettings(): Promise<AuditSettings> {
  try {
    const stored = await figma.clientStorage.getAsync(SETTINGS_KEY)
    if (stored && typeof stored === 'object' && 'level' in stored) {
      return stored as AuditSettings
    }
  } catch {
    // Storage unavailable; fall through to defaults
  }
  return { level: 'AA', minTextSize: 14 }
}

async function saveSettings(settings: AuditSettings): Promise<void> {
  try {
    await figma.clientStorage.setAsync(SETTINGS_KEY, settings)
  } catch {
    console.warn('Failed to persist settings')
  }
}
```

**Rule**: always version your storage keys (e.g., `settings-v1`) so you can migrate later without corrupting old data.

## Fonts and Text Modification

### What it is

To modify text content (`.characters`) or text properties (`.fontSize`, `.fontName`) on a `TextNode`, you must first load the font.

### Gotcha

This is the single most common AI mistake with the Figma API.

1. **`loadFontAsync` MUST be called before modifying any text property.** If you skip it, the API throws `"Cannot change text without loading font first"`.
2. **A single TextNode can use multiple fonts** (different spans have different fontName). You must load ALL fonts used in the node, not just one.
3. **`fontName` is an object `{ family: string, style: string }`, not a string.** `"Inter"` is wrong. `{ family: "Inter", style: "Regular" }` is correct.
4. **Missing fonts.** If the file uses a font not installed on the machine, `loadFontAsync` will fail. Handle the error.

### Correct example

```ts
async function setTextContent(node: TextNode, newText: string): Promise<void> {
  // Load ALL fonts used in this text node
  const fontNames = node.getRangeAllFontNames(0, node.characters.length)
  for (const fontName of fontNames) {
    await figma.loadFontAsync(fontName)
  }

  node.characters = newText
}

async function setTextOnSingleFontNode(
  node: TextNode,
  newText: string,
  font: FontName = { family: 'Inter', style: 'Regular' }
): Promise<void> {
  await figma.loadFontAsync(font)
  node.fontName = font
  node.characters = newText
}
```

**Rule**: never write to `.characters`, `.fontSize`, or `.fontName` without `loadFontAsync` first.

## Messaging (postMessage)

See [docs/snippets/main-thread.md](../snippets/main-thread.md) and [docs/snippets/ui-iframe.md](../snippets/ui-iframe.md) for the full typed messaging pattern.

Key points:

- `figma.ui.postMessage(data)` sends from main to UI
- `parent.postMessage({ pluginMessage: data }, '*')` sends from UI to main
- `figma.ui.onmessage = (msg) => { ... }` receives in main
- `window.addEventListener('message', (e) => { e.data.pluginMessage })` receives in UI
- Always type both directions with a discriminated union
- Always use a type guard before branching on `msg.type`

## Plugin Lifecycle

### What it is

- `figma.showUI(__html__, { width, height })` opens the UI panel. `__html__` is a magic global injected by the bundler from your HTML file.
- `figma.closePlugin(message?)` closes the plugin. Optional message shows as a toast.
- `figma.notify(message, options?)` shows a toast notification without closing.
- `figma.on('selectionchange', callback)` fires when the user changes their selection.
- `figma.on('close', callback)` fires when the plugin is about to close.

### Gotcha

1. **`__html__` is not a file path.** It is the HTML content as a string, inlined by the bundler at build time. If your build does not inline it, `figma.showUI(__html__)` shows an empty panel.
2. **`figma.closePlugin()` is final.** After calling it, no more API calls work. Close only when you are truly done.
3. **`figma.notify` supports `error: true` and `timeout` options.** Use `figma.notify('Something went wrong', { error: true })` for error toasts.

## Quick Reference Table

| Task | API | Async? | Common mistake |
| --- | --- | --- | --- |
| Read selection | `figma.currentPage.selection` | No | Not handling empty |
| Find nodes | `page.findAll(pred)` | No | Not narrowing type in predicate |
| Export image | `node.exportAsync(settings)` | Yes | Unbounded resolution |
| Read fills | `node.fills` | No | Assuming solid, not checking type |
| Get image data | `figma.getImageByHash(hash).getBytesAsync()` | Yes | Using imageHash as if it were data |
| Modify text | `node.characters = '...'` | No (but needs font) | Not calling `loadFontAsync` first |
| Load font | `figma.loadFontAsync(fontName)` | Yes | Passing a string instead of `{ family, style }` |
| Save settings | `figma.clientStorage.setAsync(k, v)` | Yes | Not versioning keys |
| Get variables | `figma.variables.getLocalVariablesAsync()` | Yes | Calling sync version that no longer exists |
| Show UI | `figma.showUI(__html__, opts)` | No | Not inlining HTML in build |
| Notify user | `figma.notify(msg, opts)` | No | Using `console.log` instead (invisible to user) |
| Close plugin | `figma.closePlugin(msg?)` | No | Calling API after close |

## Related

- [common-pitfalls.md](common-pitfalls.md) — condensed list of errors and fixes
- [project-setup.md](project-setup.md) — how to set up a working plugin project
- [runtime-split pattern](../patterns/runtime-split.md) — which side owns which API
- [messaging-bridge snippet](../snippets/messaging-bridge.md) — typed message contract
