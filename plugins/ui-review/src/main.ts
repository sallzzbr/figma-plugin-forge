/**
 * main.ts
 * ----------------------------------------------------------------
 * Main thread for the UI Review plugin — runs in Figma's sandbox.
 *
 * Responsibilities:
 * - Initialize plugin UI (figma.showUI)
 * - Monitor selection changes in real time
 * - Export selected frames/components as base64 JPEG images
 * - Bridge communication between UI (Preact) and Figma API
 */

export default function () {
  figma.showUI(__html__, { width: 480, height: 600, themeColors: true })

  // ---- Selection ----
  const SUPPORTED = new Set(["FRAME", "COMPONENT", "COMPONENT_SET", "INSTANCE"])
  const selectable = () => figma.currentPage.selection.filter(n => SUPPORTED.has(n.type))

  function notifySelection() {
    const nodes = selectable()
    figma.ui.postMessage({
      type: "selection-changed",
      count: nodes.length,
      names: nodes.map(n => n.name),
    })
  }

  figma.on("selectionchange", notifySelection)
  // Emit initial state when UI opens
  notifySelection()

  // ---- Export selection as base64 (with downscale to reduce payload) ----
  async function exportSelection() {
    const nodes = selectable()
    if (nodes.length === 0) throw new Error("Select at least one Frame, Component, or Instance.")

    const MAX_PIXELS = 900_000
    const MIN_SCALE = 0.25

    function scaleFor(node: SceneNode) {
      const w = (node as any).width ?? 0
      const h = (node as any).height ?? 0
      const area = Math.max(1, w * h)
      const s = Math.sqrt(MAX_PIXELS / area)
      return Math.max(MIN_SCALE, Math.min(1, s))
    }

    const frames: Array<{
      id: string
      name: string
      imageBase64: string
      imageType: "image/jpeg" | "image/png"
    }> = []

    for (const node of nodes) {
      const scale = scaleFor(node as SceneNode)
      const bytes = await (node as SceneNode).exportAsync({
        format: "JPG",
        constraint: { type: "SCALE", value: scale },
        contentsOnly: true,
      })
      const imageBase64 = figma.base64Encode(bytes)
      frames.push({
        id: (node as any).id,
        name: (node as any).name,
        imageBase64,
        imageType: "image/jpeg",
      })
    }
    return frames
  }

  // ---- Navigate to a node (scroll + zoom + select) ----
  async function focusNode(nodeId: string) {
    try {
      const node = await figma.getNodeByIdAsync(nodeId)
      if (node && node.type !== 'DOCUMENT' && node.type !== 'PAGE') {
        figma.currentPage.selection = [node as SceneNode]
        figma.viewport.scrollAndZoomIntoView([node as SceneNode])
      }
    } catch (e) {
      console.error('Error focusing node:', e)
    }
  }

  // ---- Messages from UI ----
  figma.ui.onmessage = async (msg: any) => {
    if (!msg) return

    if (msg.type === "check-selection") {
      notifySelection()
      return
    }

    if (msg.type === "focus-node") {
      await focusNode(msg.nodeId)
      return
    }

    if (
      msg.pluginMessage === "request-selection-export" ||
      msg.type === "request-selection-export"
    ) {
      try {
        const frames = await exportSelection()
        figma.ui.postMessage({ type: "selection-exported", frames })
      } catch (e: any) {
        figma.ui.postMessage({
          type: "selection-export-error",
          error: e?.message ?? String(e),
        })
      }
      return
    }
  }
}
