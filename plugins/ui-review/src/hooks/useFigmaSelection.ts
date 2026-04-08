/**
 * hooks/useFigmaSelection.ts
 * ----------------------------------------------------------------
 * Manages exported frames state and Figma selection integration.
 * Listens for selection-changed messages from the main thread and
 * provides requestExport to trigger frame export.
 */

import { useState, useEffect } from 'preact/hooks'
import { requestSelectionExport, onSelectionChange } from '@figma-forge/shared/services'
import type { ExportedFrame } from '../types'

/** Info about the current Figma selection (updates in real time). */
export interface SelectionInfo {
  hasValidSelection: boolean
  count: number
  names: string[]
}

export interface UseFigmaSelectionReturn {
  /** Exported frames as base64 */
  frames: ExportedFrame[]
  /** Current selection info (live) */
  selectionInfo: SelectionInfo | null
  /** Whether an export is in progress */
  isExporting: boolean
  /** Error from the last export attempt */
  exportError: string | null
  /** Export current selection and append to frames (dedup by id) */
  appendSelection: () => Promise<void>
  /** Remove a frame by index */
  removeFrame: (index: number) => void
  /** Clear all exported frames */
  clearFrames: () => void
}

export function useFigmaSelection(): UseFigmaSelectionReturn {
  const [frames, setFrames] = useState<ExportedFrame[]>([])
  const [selectionInfo, setSelectionInfo] = useState<SelectionInfo | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)

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

  /** Export current selection and merge with existing frames (dedup by id). */
  const appendSelection = async (): Promise<void> => {
    setIsExporting(true)
    setExportError(null)

    try {
      const exported = await requestSelectionExport()
      setFrames((prev) => {
        const existingIds = new Set(prev.map((f) => f.id))
        const newFrames = exported.filter((f: ExportedFrame) => !existingIds.has(f.id))
        // Update images for re-exported frames + append new ones
        const updated = prev.map((f) => {
          const newer = exported.find((e: ExportedFrame) => e.id === f.id)
          return newer || f
        })
        return [...updated, ...newFrames]
      })
    } catch (e: any) {
      setExportError(e?.message || 'Failed to export selection')
    } finally {
      setIsExporting(false)
    }
  }

  const removeFrame = (index: number): void => {
    setFrames((prev) => prev.filter((_, i) => i !== index))
  }

  const clearFrames = (): void => {
    setFrames([])
  }

  return {
    frames,
    selectionInfo,
    isExporting,
    exportError,
    appendSelection,
    removeFrame,
    clearFrames,
  }
}
