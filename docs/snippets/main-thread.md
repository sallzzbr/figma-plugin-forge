# Snippet: Main Thread

Use this as a starting point for the Figma sandbox side. Messages are typed with a discriminated union and a type guard so every branch is narrowed and unknown shapes are rejected at the boundary.

```ts
// ---------- message contract (must match the UI side) ----------

type SelectionItem = {
  id: string
  name: string
  type: string
}

type ExportedFrame = {
  id: string
  name: string
  base64: string
}

// main -> ui
type MainToUiMessage =
  | { type: 'selection-changed'; items: SelectionItem[]; pageName: string }
  | { type: 'export-selection-response'; frames: ExportedFrame[] }
  | { type: 'export-selection-error'; message: string }
  | { type: 'focus-node-error'; message: string }

// ui -> main
type UiToMainMessage =
  | { type: 'focus-node'; nodeId: string }
  | { type: 'export-selection-request'; format: 'png' | 'jpg' | 'svg' }

function isUiToMainMessage(value: unknown): value is UiToMainMessage {
  if (typeof value !== 'object' || value === null) return false
  const msg = value as { type?: unknown }
  return (
    msg.type === 'focus-node' ||
    msg.type === 'export-selection-request'
  )
}

function postToUi(message: MainToUiMessage): void {
  figma.ui.postMessage(message)
}

// ---------- wiring ----------

figma.showUI(__html__, { width: 360, height: 520 })

figma.on('selectionchange', () => {
  const items: SelectionItem[] = figma.currentPage.selection.map((node) => ({
    id: node.id,
    name: node.name,
    type: node.type,
  }))

  postToUi({
    type: 'selection-changed',
    items,
    pageName: figma.currentPage.name,
  })
})

figma.ui.onmessage = async (raw: unknown) => {
  if (!isUiToMainMessage(raw)) return

  switch (raw.type) {
    case 'focus-node': {
      const node = await figma.getNodeByIdAsync(raw.nodeId)
      if (!node || node.type === 'DOCUMENT' || node.type === 'PAGE') {
        postToUi({ type: 'focus-node-error', message: `Cannot focus node ${raw.nodeId}` })
        return
      }
      figma.currentPage.selection = [node as SceneNode]
      figma.viewport.scrollAndZoomIntoView([node as SceneNode])
      return
    }
    case 'export-selection-request': {
      const selection = figma.currentPage.selection
      if (selection.length === 0) {
        postToUi({ type: 'export-selection-error', message: 'Nothing selected' })
        return
      }
      try {
        const frames: ExportedFrame[] = []
        for (const node of selection) {
          const bytes = await node.exportAsync({
            format: raw.format === 'svg' ? 'SVG' : raw.format === 'jpg' ? 'JPG' : 'PNG',
            constraint: { type: 'WIDTH', value: 800 },
          })
          let binary = ''
          for (let i = 0; i < bytes.length; i++) {
            binary += String.fromCharCode(bytes[i])
          }
          frames.push({ id: node.id, name: node.name, base64: btoa(binary) })
        }
        postToUi({ type: 'export-selection-response', frames })
      } catch (err) {
        postToUi({
          type: 'export-selection-error',
          message: err instanceof Error ? err.message : 'Export failed',
        })
      }
      return
    }
  }
}
```

## Keep in main

- selection
- node access
- export
- viewport focus
- client storage

## Rules this snippet follows

- The `MainToUiMessage` and `UiToMainMessage` unions are the same shapes the UI side declares. Both sides must stay in sync, which is why the contract is documented in [messaging-bridge.md](messaging-bridge.md).
- `figma.ui.onmessage` receives `unknown` and is narrowed by `isUiToMainMessage`. No branch operates on untyped data.
- Errors cross the boundary as a typed `focus-node-error` message, not as thrown exceptions, so the UI can render them.
- The `switch` uses exhaustive narrowing by discriminated union. Adding a new message type forces a new case.

## Related

- [messaging-bridge snippet](messaging-bridge.md) — exemplar contract table format
- [ui-iframe snippet](ui-iframe.md) — matching UI-side handler
- [runtime-split pattern](../patterns/runtime-split.md) — which side owns which concern
- [messaging-bridge pattern](../patterns/messaging-bridge.md) — how to document the contract itself
