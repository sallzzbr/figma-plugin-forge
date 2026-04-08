/**
 * main.ts — DS Library Sync plugin main thread
 * Runs in the Figma sandbox (no DOM access).
 *
 * Responsibilities:
 *  - Emit figma.fileKey to the UI (requires enablePrivatePluginApi)
 *  - Extract components (COMPONENT / COMPONENT_SET) from all pages
 *  - Extract tokens (Variables) from local collections
 *  - Bridge figma.clientStorage for the UI (auth persistence)
 */

import type { ExtractedComponent, ExtractedToken } from './types'

export default function () {
  figma.showUI(__html__, { width: 480, height: 600, themeColors: true })

  // Send fileKey + fileName as soon as UI loads
  figma.ui.postMessage({
    type: 'file-key',
    fileKey: figma.fileKey,
    fileName: figma.root.name,
  })

  figma.ui.onmessage = async (msg: any) => {
    if (!msg || typeof msg !== 'object') return

    // ------------------------------------------------------------------
    // Data extraction
    // ------------------------------------------------------------------
    if (msg.type === 'extract-data') {
      try {
        const components = await extractComponents()
        const tokens = await extractTokens()

        figma.ui.postMessage({
          type: 'extraction-complete',
          components,
          tokens,
        })
      } catch (err: any) {
        figma.ui.postMessage({
          type: 'extraction-error',
          error: err?.message || String(err),
        })
      }
    }

    // ------------------------------------------------------------------
    // Storage bridge (figma.clientStorage)
    // ------------------------------------------------------------------
    if (msg.type === 'get-storage') {
      try {
        const value = await figma.clientStorage.getAsync(msg.key)
        figma.ui.postMessage({
          type: 'storage-value',
          key: msg.key,
          value: value ?? msg.defaultValue ?? null,
          requestId: msg.requestId,
        })
      } catch (err: any) {
        figma.ui.postMessage({
          type: 'storage-error',
          key: msg.key,
          error: err?.message || String(err),
          requestId: msg.requestId,
        })
      }
    }

    if (msg.type === 'set-storage') {
      try {
        await figma.clientStorage.setAsync(msg.key, msg.value)
        figma.ui.postMessage({
          type: 'storage-set',
          key: msg.key,
          success: true,
          requestId: msg.requestId,
        })
      } catch (err: any) {
        figma.ui.postMessage({
          type: 'storage-error',
          key: msg.key,
          error: err?.message || String(err),
          requestId: msg.requestId,
        })
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Component Extraction
// ---------------------------------------------------------------------------

async function extractComponents(): Promise<ExtractedComponent[]> {
  figma.skipInvisibleInstanceChildren = true
  await figma.loadAllPagesAsync()

  const pages = figma.root.children
  const components: ExtractedComponent[] = []

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i]

    figma.ui.postMessage({
      type: 'extraction-progress',
      current: i + 1,
      total: pages.length,
    })

    const nodes = page.findAllWithCriteria({
      types: ['COMPONENT', 'COMPONENT_SET'],
    })

    for (const node of nodes) {
      // Skip individual variants inside a COMPONENT_SET
      // (the set itself captures the full component)
      if (
        node.type === 'COMPONENT' &&
        node.parent &&
        node.parent.type === 'COMPONENT_SET'
      ) {
        continue
      }

      components.push({
        key: node.key,
        name: node.name,
        description: node.description || '',
      })
    }
  }

  return components
}

// ---------------------------------------------------------------------------
// Token Extraction (Variables)
// ---------------------------------------------------------------------------

async function extractTokens(): Promise<ExtractedToken[]> {
  const collections = await figma.variables.getLocalVariableCollectionsAsync()

  const collectionMap = new Map<string, string>()
  for (const col of collections) {
    collectionMap.set(col.id, col.name)
  }

  const variables = await figma.variables.getLocalVariablesAsync()
  const tokens: ExtractedToken[] = []

  for (const variable of variables) {
    // Serialize the first mode value for display
    const modeIds = Object.keys(variable.valuesByMode)
    const firstValue = modeIds.length > 0
      ? serializeValue(variable.valuesByMode[modeIds[0]])
      : ''

    tokens.push({
      key: variable.key,
      name: variable.name,
      type: variable.resolvedType,
      value: firstValue,
    })
  }

  return tokens
}

/** Serialize a variable value to a readable string. */
function serializeValue(val: unknown): string {
  if (val == null) return ''
  if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
    return String(val)
  }
  if (typeof val === 'object') {
    const obj = val as Record<string, unknown>
    // RGBA color
    if ('r' in obj && 'g' in obj && 'b' in obj) {
      const r = Math.round((obj.r as number) * 255)
      const g = Math.round((obj.g as number) * 255)
      const b = Math.round((obj.b as number) * 255)
      return `rgb(${r}, ${g}, ${b})`
    }
    // Variable alias
    if (obj.type === 'VARIABLE_ALIAS' && 'id' in obj) {
      return `alias(${obj.id})`
    }
  }
  return JSON.stringify(val)
}
