// Main thread (Figma sandbox). Owns figma.*, selection, traversal, viewport.
// No DOM or browser-only APIs here (no window, no fetch, no btoa).

import {
  isUiToMainMessage,
  type MainToUiMessage,
  type SelectionItem,
} from './types/messages'

// __html__ is provided by Figma at runtime: it is the contents of the file named
// in the manifest "ui" field (build/ui.html). It is NOT inlined by the bundler.
figma.showUI(__html__, { width: 360, height: 520 })

function postToUi(message: MainToUiMessage): void {
  figma.ui.postMessage(message)
}

function sendSelection(): void {
  const items: SelectionItem[] = figma.currentPage.selection.map((node) => ({
    id: node.id,
    name: node.name,
    type: node.type,
  }))
  postToUi({ type: 'selection-changed', items, pageName: figma.currentPage.name })
}

// Send the current state once on open, then on every change.
sendSelection()
figma.on('selectionchange', sendSelection)

figma.ui.onmessage = async (raw: unknown) => {
  if (!isUiToMainMessage(raw)) return

  switch (raw.type) {
    case 'focus-node': {
      // getNodeByIdAsync is required under documentAccess: "dynamic-page".
      const node = await figma.getNodeByIdAsync(raw.nodeId)
      if (!node || node.type === 'DOCUMENT' || node.type === 'PAGE') {
        postToUi({ type: 'focus-node-error', message: `Cannot focus node ${raw.nodeId}` })
        return
      }
      figma.currentPage.selection = [node as SceneNode]
      figma.viewport.scrollAndZoomIntoView([node as SceneNode])
      return
    }
  }
}
