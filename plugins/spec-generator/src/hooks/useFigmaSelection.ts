/**
 * hooks/useFigmaSelection.ts
 * ----------------------------------------------------------------
 * Hook for Figma selection integration.
 * Monitors the current selection, exports frames as base64, and
 * manages the list of captured frames.
 */

import { useState, useEffect } from "preact/hooks"
import {
  figmaStorage,
  requestSelectionExport,
  onSelectionChange,
  onFileKey,
  requestFileKey,
} from "@figma-forge/shared/services"
import type { ExportedFrame } from "@figma-forge/shared/services"

/** Info about the user's current selection in Figma */
export interface SelectionInfo {
  /** Whether at least one valid frame/component is selected */
  hasValidSelection: boolean
  /** Number of selected nodes */
  count: number
  /** Names of selected nodes */
  names: string[]
}

/** Return type of the useFigmaSelection hook */
export interface UseFigmaSelectionReturn {
  /** Frames already exported as base64 */
  frames: ExportedFrame[]
  /** Current selection info (updates in real time) */
  selectionInfo: SelectionInfo | null
  /** Whether an export is in progress */
  isExporting: boolean
  /** Error message from the last export, if any */
  exportError: string | null
  /** File key of the open Figma file (for building real links) */
  fileKey: string | null
  /** Base URL of the Figma file (auto-detected or restored from storage) */
  figmaBaseUrl: string | null
  /** Export selection (append: merge with existing by id) */
  appendSelection: () => Promise<void>
  /** Remove a frame by index */
  removeFrame: (index: number) => void
  /** Move a frame from fromIndex to toIndex */
  reorderFrame: (fromIndex: number, toIndex: number) => void
  /** Clear all exported frames */
  clearFrames: () => void
}

export function useFigmaSelection(): UseFigmaSelectionReturn {
  const [frames, setFrames] = useState<ExportedFrame[]>([])
  const [selectionInfo, setSelectionInfo] = useState<SelectionInfo | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)
  const [fileKey, setFileKey] = useState<string | null>(null)
  const [figmaBaseUrl, setFigmaBaseUrl] = useState<string | null>(() => {
    try {
      const href = window.parent?.location?.href ?? ''
      const match = href.match(/figma\.com\/(?:design|file)\/([^/?#]+)/)
      return match?.[1] ? `https://www.figma.com/design/${match[1]}/` : null
    } catch {
      return null
    }
  })

  // Receive fileKey: register listener BEFORE requesting to avoid race condition
  useEffect(() => {
    const unsubscribe = onFileKey((key) => setFileKey(key))
    requestFileKey()
    return unsubscribe
  }, [])

  // On mount: restore URL from clientStorage as fallback
  useEffect(() => {
    if (!figmaBaseUrl) {
      figmaStorage.get('spec-generator:figmaBaseUrl').then(stored => {
        if (stored) setFigmaBaseUrl(stored)
      })
    }
  }, [])

  // When fileKey available via message-passing: always update (takes precedence)
  useEffect(() => {
    if (fileKey) {
      setFigmaBaseUrl(`https://www.figma.com/design/${fileKey}/`)
    }
  }, [fileKey])

  // Persist to storage whenever figmaBaseUrl is set
  useEffect(() => {
    if (figmaBaseUrl) {
      figmaStorage.set('spec-generator:figmaBaseUrl', figmaBaseUrl)
    }
  }, [figmaBaseUrl])

  // Monitor Figma selection changes
  useEffect(() => {
    const unsubscribe = onSelectionChange((info) => {
      setSelectionInfo({
        hasValidSelection: info.count > 0,
        count: info.count,
        names: info.names || [],
      })
    })
    return unsubscribe
  }, [])

  /** Append: export current selection and merge with existing frames (dedup by id) */
  const appendSelection = async (): Promise<void> => {
    setIsExporting(true)
    setExportError(null)

    try {
      const exported = await requestSelectionExport()
      setFrames((prev) => {
        const existingIds = new Set(prev.map((f) => f.id))
        const newFrames = exported.filter((f: ExportedFrame) => !existingIds.has(f.id))
        const updated = prev.map((f) => {
          const newer = exported.find((e: ExportedFrame) => e.id === f.id)
          return newer || f
        })
        return [...updated, ...newFrames]
      })
    } catch (e: any) {
      setExportError(e?.message || "Failed to export selection")
    } finally {
      setIsExporting(false)
    }
  }

  const removeFrame = (index: number): void => {
    setFrames((prev) => prev.filter((_, i) => i !== index))
  }

  const reorderFrame = (fromIndex: number, toIndex: number): void => {
    setFrames((prev) => {
      const updated = [...prev]
      const [moved] = updated.splice(fromIndex, 1)
      updated.splice(toIndex, 0, moved)
      return updated
    })
  }

  const clearFrames = (): void => {
    setFrames([])
  }

  return {
    frames,
    selectionInfo,
    isExporting,
    exportError,
    fileKey,
    figmaBaseUrl,
    appendSelection,
    removeFrame,
    reorderFrame,
    clearFrames,
  }
}
