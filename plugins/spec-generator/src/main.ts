/**
 * main.ts -- Spec Generator
 * ----------------------------------------------------------------
 * Main thread of the plugin. Runs in Figma's isolated sandbox
 * (no network/DOM access). All communication with the UI is via
 * postMessage (figma.ui.postMessage / figma.ui.onmessage).
 *
 * Responsibilities:
 *  - Initialize the UI (figma.showUI)
 *  - Monitor selection in real time and notify the UI
 *  - Export selected frames as base64 JPEG (with downscale)
 *  - Bridge for figma.clientStorage (get/set)
 *  - Navigate/focus a node on the canvas (scroll + zoom + select)
 *
 * Messages received from the UI:
 *  check-selection          -> resends the current selection state
 *  focus-node               -> focuses a node by id
 *  request-selection-export -> exports frames and responds with base64
 *  get-storage              -> reads a value from clientStorage
 *  set-storage              -> writes a value to clientStorage
 */

export default function () {
  figma.showUI(__html__, { width: 630, height: 640, themeColors: true })

  // Send fileKey on open so the UI can build real Figma links
  figma.ui.postMessage({ type: "file-key", fileKey: figma.fileKey ?? null })

  // ---- Selection ----

  const SUPPORTED = new Set(["FRAME", "COMPONENT", "COMPONENT_SET", "INSTANCE"])
  const selectable = () => figma.currentPage.selection.filter(n => SUPPORTED.has(n.type))

  /** Sends count and names of selected nodes to the UI. */
  function notifySelection() {
    const nodes = selectable()
    figma.ui.postMessage({
      type: "selection-changed",
      count: nodes.length,
      names: nodes.map(n => n.name),
    })
  }

  figma.on("selectionchange", notifySelection)
  notifySelection() // initial state on open

  // ---- Selection export ----

  /**
   * Exports each selected node as JPEG base64.
   * Applies automatic downscale to keep the payload below ~900 kpx.
   */
  async function exportSelection() {
    const nodes = selectable()
    if (nodes.length === 0) throw new Error("Select at least one Frame/Component/Instance.")

    const MAX_PIXELS = 900_000
    const MIN_SCALE = 0.25

    function scaleFor(node: SceneNode) {
      const w = (node as any).width ?? 0
      const h = (node as any).height ?? 0
      const area = Math.max(1, w * h)
      return Math.max(MIN_SCALE, Math.min(1, Math.sqrt(MAX_PIXELS / area)))
    }

    const frames: Array<{
      id: string
      name: string
      imageBase64: string
      imageType: "image/jpeg"
      figmaUrl: string | undefined
    }> = []

    for (const node of nodes) {
      const bytes = await (node as SceneNode).exportAsync({
        format: "JPG",
        constraint: { type: "SCALE", value: scaleFor(node as SceneNode) },
        contentsOnly: true,
      })
      const nodeId = (node as any).id as string
      frames.push({
        id: nodeId,
        name: (node as any).name,
        imageBase64: figma.base64Encode(bytes),
        imageType: "image/jpeg",
        figmaUrl: figma.fileKey
          ? `https://www.figma.com/design/${figma.fileKey}/?node-id=${nodeId.replace(':', '-')}`
          : undefined,
      })
    }
    return frames
  }

  // ---- Storage bridge ----

  async function getStorage(key: string, defaultValue: string, requestId: number) {
    try {
      const v = (await figma.clientStorage.getAsync(key)) ?? defaultValue
      figma.ui.postMessage({ type: "storage-value", key, value: v, requestId, defaultValue })
    } catch (e: any) {
      figma.ui.postMessage({ type: "storage-error", key, error: String(e), requestId })
    }
  }

  async function setStorage(key: string, value: string, requestId: number) {
    try {
      await figma.clientStorage.setAsync(key, value)
      figma.ui.postMessage({ type: "storage-set", key, success: true, requestId })
    } catch (e: any) {
      figma.ui.postMessage({ type: "storage-error", key, error: String(e), requestId })
    }
  }

  // ---- Focus node on canvas ----

  async function focusNode(nodeId: string) {
    try {
      const node = await figma.getNodeByIdAsync(nodeId)
      if (node && node.type !== 'DOCUMENT' && node.type !== 'PAGE') {
        figma.currentPage.selection = [node as SceneNode]
        figma.viewport.scrollAndZoomIntoView([node as SceneNode])
      }
    } catch (e) {
      console.error('Error focusing node', nodeId, e)
    }
  }

  // ---- UI message router ----

  figma.ui.onmessage = async (msg: any) => {
    if (!msg) return

    if (msg.type === "check-selection") {
      notifySelection()
      return
    }

    if (msg.type === "request-file-key") {
      figma.ui.postMessage({ type: "file-key", fileKey: figma.fileKey ?? null })
      return
    }

    if (msg.type === "focus-node") {
      await focusNode(msg.nodeId)
      return
    }

    if (msg.pluginMessage === "request-selection-export" || msg.type === "request-selection-export") {
      try {
        const frames = await exportSelection()
        figma.ui.postMessage({ type: "file-key", fileKey: figma.fileKey ?? null })
        figma.ui.postMessage({ type: "selection-exported", frames })
      } catch (e: any) {
        figma.ui.postMessage({ type: "selection-export-error", error: e?.message ?? String(e) })
      }
      return
    }

    if (msg.type === "get-storage") {
      getStorage(msg.key, msg.defaultValue ?? "", msg.requestId)
      return
    }

    if (msg.type === "set-storage") {
      setStorage(msg.key, msg.value ?? "", msg.requestId)
      return
    }
  }
}
