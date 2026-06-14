// Main thread (Figma sandbox). Owns figma.*, selection, traversal, viewport,
// and clientStorage. No DOM or browser-only APIs here (no window, fetch, btoa).

import { emit, serve } from './main-bridge'
import type { SelectionItem } from './types/messages'

// __html__ is the contents of the file named in the manifest "ui" field
// (build/ui.html), provided by Figma at runtime. The iframe cannot fetch
// sibling files, so the build inlines everything into that one HTML file.
figma.showUI(__html__, { width: 360, height: 520 })

function emitSelection(): void {
  const items: SelectionItem[] = figma.currentPage.selection.map((node) => ({
    id: node.id,
    name: node.name,
    type: node.type,
  }))
  emit({ type: 'selection-changed', items, pageName: figma.currentPage.name })
}

// Send the current state once on open, then on every change.
emitSelection()
figma.on('selectionchange', emitSelection)

serve(
  {
    // Round-trip handlers. clientStorage is async and main-only, so the UI
    // reaches it through these typed requests.
    'get-storage': async ({ key }) => {
      const value = await figma.clientStorage.getAsync(key)
      return typeof value === 'string' ? value : null
    },
    'set-storage': async ({ key, value }) => {
      await figma.clientStorage.setAsync(key, value)
      return true
    },
  },
  async (event) => {
    // Fire-and-forget UI events.
    if (event.type === 'focus-node') {
      // getNodeByIdAsync is required under documentAccess: "dynamic-page".
      const node = await figma.getNodeByIdAsync(event.nodeId)
      if (!node || node.type === 'DOCUMENT' || node.type === 'PAGE') return
      const scene = node as SceneNode
      figma.currentPage.selection = [scene]
      figma.viewport.scrollAndZoomIntoView([scene])
    }
  },
)
