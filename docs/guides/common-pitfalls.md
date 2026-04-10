# Common Pitfalls

Errors that every AI (and many humans) makes when building Figma plugins. Each entry follows: **error**, **why it breaks**, **fix**.

Read [figma-api-reference.md](figma-api-reference.md) for the full context behind each API.

---

## 1. Modifying text without loading the font first

**Error:**
```ts
textNode.characters = 'Hello'
// throws: "Cannot change text without loading font first"
```

**Why it breaks:** The Figma API requires all fonts used by a TextNode to be loaded before any text property can be written. This is the single most common plugin crash.

**Fix:**
```ts
const fonts = textNode.getRangeAllFontNames(0, textNode.characters.length)
for (const font of fonts) {
  await figma.loadFontAsync(font)
}
textNode.characters = 'Hello'
```

---

## 2. Assuming fills are always solid colors

**Error:**
```ts
const color = node.fills[0].color // crashes on gradients and images
```

**Why it breaks:** `fills` is an array of `Paint` objects. Each paint can be `SOLID`, `GRADIENT_LINEAR`, `GRADIENT_RADIAL`, `GRADIENT_ANGULAR`, `GRADIENT_DIAMOND`, or `IMAGE`. Only `SOLID` has `.color`.

**Fix:**
```ts
const fills = node.fills
if (!Array.isArray(fills)) return null
const solid = fills.find((f): f is SolidPaint => f.type === 'SOLID' && f.visible !== false)
if (!solid) return null
const { r, g, b } = solid.color  // safe
```

---

## 3. Not narrowing node types before accessing properties

**Error:**
```ts
for (const node of figma.currentPage.selection) {
  console.log(node.characters)  // Property 'characters' does not exist on type 'SceneNode'
}
```

**Why it breaks:** `SceneNode` is a union of all node types. `.characters` only exists on `TextNode`. TypeScript catches this at compile time; at runtime, the property is `undefined`.

**Fix:**
```ts
for (const node of figma.currentPage.selection) {
  if (node.type === 'TEXT') {
    console.log(node.characters)  // TypeScript narrows to TextNode
  }
}
```

---

## 4. Passing raw node objects to the UI

**Error:**
```ts
figma.ui.postMessage({ node: selectedNode })
// UI receives an empty object or crashes
```

**Why it breaks:** Figma node objects are not JSON-serializable. They contain circular references, internal symbols, and getters. `postMessage` silently drops or corrupts them.

**Fix:**
```ts
figma.ui.postMessage({
  type: 'selection-changed',
  items: selection.map((node) => ({
    id: node.id,
    name: node.name,
    type: node.type,
    // extract only the data you need as plain values
  })),
})
```

**Rule:** always serialize to plain objects with only the fields you need. Never send node references across the runtime boundary.

---

## 5. Exporting at unbounded resolution

**Error:**
```ts
const bytes = await node.exportAsync({ format: 'PNG' })
// exports at the node's native resolution, which can be enormous
```

**Why it breaks:** A large frame (e.g., 4000x3000px) at default resolution produces a multi-megabyte PNG. Sending it via `postMessage` can freeze the UI or crash the plugin.

**Fix:**
```ts
const bytes = await node.exportAsync({
  format: 'PNG',
  constraint: { type: 'WIDTH', value: 800 },
})
```

**Rule:** always set a `constraint` on exports. Use `WIDTH` or `SCALE` to cap the output size.

---

## 6. Treating `imageHash` as image data

**Error:**
```ts
const imageData = node.fills[0].imageHash
// imageHash is a string hash, not the image bytes
```

**Why it breaks:** An `IMAGE` fill stores an `imageHash` (a string identifier), not the actual image. You need a second API call to get the bytes.

**Fix:**
```ts
const fill = node.fills[0]
if (fill.type === 'IMAGE' && fill.imageHash) {
  const image = figma.getImageByHash(fill.imageHash)
  if (image) {
    const bytes = await image.getBytesAsync()
    // now you have the Uint8Array of image data
  }
}
```

---

## 7. Using `fontName` as a string instead of an object

**Error:**
```ts
await figma.loadFontAsync('Inter')
// type error: expected FontName, got string
```

**Why it breaks:** `FontName` is `{ family: string, style: string }`, not a plain string. The style (Regular, Bold, Italic, etc.) is required.

**Fix:**
```ts
await figma.loadFontAsync({ family: 'Inter', style: 'Regular' })
```

---

## 8. Calling `figma.*` from the UI iframe

**Error:**
```ts
// in UI code (React/Preact component)
const selection = figma.currentPage.selection
```

**Why it breaks:** `figma.*` only exists in the main thread sandbox. The UI iframe is a regular browser context with no access to the Figma API. The variable `figma` is `undefined` in UI code.

**Fix:** Request the data from main via a typed message:
```ts
// UI sends request
parent.postMessage({ pluginMessage: { type: 'get-selection' } }, '*')

// Main handles it
figma.ui.onmessage = (msg) => {
  if (msg.type === 'get-selection') {
    figma.ui.postMessage({
      type: 'selection-changed',
      items: figma.currentPage.selection.map(/* serialize */),
    })
  }
}
```

---

## 9. Calling `fetch` from the main thread

**Error:**
```ts
// in main.ts
const response = await fetch('https://api.example.com/analyze')
```

**Why it breaks:** The Figma main thread sandbox does not have `fetch`. Network calls can only be made from the UI iframe.

**Fix:** Make the fetch call in UI code, then send the result to main via `postMessage` if needed.

---

## 10. Not handling empty selection

**Error:**
```ts
const node = figma.currentPage.selection[0]
const name = node.name  // crashes if nothing is selected
```

**Why it breaks:** `selection` can be an empty array. Index `[0]` is `undefined`, and `.name` on `undefined` throws.

**Fix:**
```ts
const selection = figma.currentPage.selection
if (selection.length === 0) {
  figma.notify('Please select at least one element')
  return
}
const node = selection[0]
```

---

## 11. Wrong `documentAccess` in manifest.json

**Error:**
```json
{
  "documentAccess": "dynamic-page"
}
```
... but the plugin tries to access nodes on pages other than the current one.

**Why it breaks:** `dynamic-page` restricts API access to `figma.currentPage` only. To access other pages, use `"documentAccess": "dynamic"` (which prompts the user for permission).

**Fix:** Choose the right access level:
- `"dynamic-page"` (default): access current page only. Cheapest, safest.
- `"dynamic"`: access the whole document. User sees a permission prompt.

---

## 12. Not declaring `networkAccess` in manifest.json

**Error:** The UI tries to `fetch` an external API but the request silently fails or is blocked.

**Why it breaks:** Figma sandboxes network access. The manifest must declare which domains the UI is allowed to reach.

**Fix:**
```json
{
  "networkAccess": {
    "allowedDomains": ["https://api.example.com"]
  }
}
```

**Rule:** only declare the domains you actually use. Wildcard `"*"` is not recommended.

---

## 13. Forgetting that `figma.variables` methods are async

**Error:**
```ts
const variables = figma.variables.getLocalVariables('COLOR')
```

**Why it breaks:** In newer API versions, many variable methods are async-only. The sync versions have been deprecated. Calling the old name either throws or returns `undefined`.

**Fix:**
```ts
const variables = await figma.variables.getLocalVariablesAsync('COLOR')
```

---

## 14. Colors as 0-255 instead of 0-1

**Error:**
```ts
node.fills = [{ type: 'SOLID', color: { r: 255, g: 0, b: 0 } }]
// creates an out-of-range fill, not red
```

**Why it breaks:** Figma colors use floats from 0 to 1, not integers from 0 to 255.

**Fix:**
```ts
node.fills = [{ type: 'SOLID', color: { r: 1, g: 0, b: 0 } }]  // red
```

---

## 15. Not inlining HTML for `__html__`

**Error:** `figma.showUI(__html__)` shows a blank panel.

**Why it breaks:** `__html__` is a magic global that your bundler must replace with the actual HTML content as a string at build time. If your build does not inline it, the variable is `undefined` or empty.

**Fix:** Configure your bundler to inline the HTML. With esbuild:
```js
// in build config
esbuild.build({
  entryPoints: ['src/ui.tsx'],
  bundle: true,
  outfile: 'build/ui.js',
  // then use a script to wrap the JS output into an HTML string
})
```

See [project-setup.md](project-setup.md) for the complete build configuration.

---

## Summary

| # | Pitfall | One-line fix |
| --- | --- | --- |
| 1 | Text without font load | `await loadFontAsync()` before writing |
| 2 | Assuming solid fills | Check `fill.type === 'SOLID'` |
| 3 | No type narrowing | Check `node.type` before property access |
| 4 | Raw nodes to UI | Serialize to plain objects |
| 5 | Unbounded export | Set `constraint` on `exportAsync` |
| 6 | imageHash as data | Use `getImageByHash().getBytesAsync()` |
| 7 | fontName as string | Use `{ family, style }` object |
| 8 | `figma.*` in UI | Use postMessage from main |
| 9 | `fetch` in main | Fetch from UI only |
| 10 | Empty selection | Check `selection.length` |
| 11 | Wrong documentAccess | Match to actual page access needs |
| 12 | Missing networkAccess | Declare domains in manifest |
| 13 | Sync variable methods | Use `Async` variants |
| 14 | Colors as 0-255 | Use 0-1 floats |
| 15 | `__html__` blank | Configure bundler to inline HTML |

## Related

- [figma-api-reference.md](figma-api-reference.md) — full API context for each surface
- [project-setup.md](project-setup.md) — how to set up the build so `__html__` works
- [runtime-split pattern](../patterns/runtime-split.md) — which side owns which capability
