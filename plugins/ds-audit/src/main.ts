/**
 * main.ts - Plugin main thread (Figma sandbox)
 * ----------------------------------------------------------------
 * Runs in the Figma sandbox (main thread).
 *
 * RESPONSIBILITIES:
 * - Initialize plugin UI
 * - Monitor selection changes in real time
 * - Persist rules config via figma.clientStorage
 * - Bridge communication between UI and Figma API
 *
 * LIMITATIONS:
 * - No network/fetch access (only UI thread can)
 * - Communication via postMessage is async
 */

import { defaultRulesConfig, runEnabledRules } from './rules'
import type { UIMessage } from './types'

const STORAGE_KEY_RULES = 'ds-audit:rulesConfig'

// ---- Selection ----

/** Supported node types for analysis */
const SUPPORTED = new Set(["FRAME", "SECTION", "COMPONENT", "COMPONENT_SET", "INSTANCE"])

/** Returns selected nodes filtered by supported type */
const selectable = () =>
  figma.currentPage.selection.filter(n => SUPPORTED.has(n.type))

/** Notifies the UI about selection changes */
function notifySelection() {
  const nodes = selectable()
  figma.ui.postMessage({
    type: "selection-changed",
    count: nodes.length,
    items: nodes.map(n => ({ name: n.name, type: n.type })),
    pageName: figma.currentPage.name,
  })
}

// ---- Rules config persistence ----

/** Loads rules config from storage and sends to UI */
async function loadRulesConfig() {
  try {
    const saved = await figma.clientStorage.getAsync(STORAGE_KEY_RULES)
    const config = saved ?? defaultRulesConfig()
    figma.ui.postMessage({ type: 'rules-config-loaded', config })
  } catch {
    figma.ui.postMessage({ type: 'rules-config-loaded', config: defaultRulesConfig() })
  }
}

/** Saves rules config to storage */
async function saveRulesConfig(config: Record<string, boolean>) {
  try {
    await figma.clientStorage.setAsync(STORAGE_KEY_RULES, config)
  } catch (e) {
    console.error('Error saving rules config:', e)
  }
}

// ---- Analysis ----

/** Runs enabled rules on target nodes and sends results to UI */
async function runAnalysis(rulesConfig: Record<string, boolean>) {
  try {
    // Determine nodes: filtered selection or all page children
    const selected = selectable()
    const nodes: readonly SceneNode[] =
      selected.length > 0
        ? selected
        : figma.currentPage.children

    const violations = runEnabledRules(nodes, rulesConfig)

    figma.ui.postMessage({ type: 'analysis-results', violations })
  } catch (e: any) {
    figma.ui.postMessage({
      type: 'analysis-error',
      error: e?.message ?? String(e),
    })
  }
}

// ---- Navigation ----

/** Selects and navigates to a specific node on the canvas */
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

// ---- Entry point ----

export default function () {
  figma.showUI(__html__, { width: 480, height: 640, themeColors: true })

  figma.on("selectionchange", notifySelection)
  notifySelection()

  figma.ui.onmessage = async (msg: UIMessage) => {
    if (!msg) return

    switch (msg.type) {
      case 'ping':
        figma.ui.postMessage({ type: 'pong' })
        break
      case 'load-rules-config':
        await loadRulesConfig()
        break
      case 'save-rules-config':
        await saveRulesConfig(msg.config)
        break
      case 'analyze-selection':
        await runAnalysis(msg.rulesConfig)
        break
      case 'focus-node':
        await focusNode(msg.nodeId)
        break
    }
  }
}
