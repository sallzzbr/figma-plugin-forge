/**
 * components/AnalysisPanel.tsx
 * ----------------------------------------------------------------
 * Panel for the "select + context + analyze" flow.
 * Shows frame thumbnails (small base64 previews), a context textarea,
 * and an analyze button with loading state.
 */

import { h } from 'preact'
import { Button, Card, Input, ErrorMessage, LoadingSpinner } from '@figma-forge/shared/ui'
import type { ExportedFrame } from '../types'
import type { SelectionInfo } from '../hooks/useFigmaSelection'

interface AnalysisPanelProps {
  frames: ExportedFrame[]
  selectionInfo: SelectionInfo | null
  isExporting: boolean
  exportError: string | null
  context: string
  onContextChange: (value: string) => void
  onAppendSelection: () => void
  onRemoveFrame: (index: number) => void
  onClearFrames: () => void
  onAnalyze: () => void
  isAnalyzing: boolean
  canAnalyze: boolean
}

export function AnalysisPanel({
  frames,
  selectionInfo,
  isExporting,
  exportError,
  context,
  onContextChange,
  onAppendSelection,
  onRemoveFrame,
  onClearFrames,
  onAnalyze,
  isAnalyzing,
  canAnalyze,
}: AnalysisPanelProps) {
  return (
    <div className="space-y-3">
      {/* Selection status */}
      <Card padding="sm">
        <div className="flex items-center justify-between">
          <div className="text-xs text-neutral-600">
            {selectionInfo?.hasValidSelection
              ? `${selectionInfo.count} frame${selectionInfo.count > 1 ? 's' : ''} selected in Figma`
              : 'Select frames in Figma to begin'}
          </div>
          <Button
            variant="primary"
            size="xs"
            onClick={onAppendSelection}
            loading={isExporting}
            disabled={!selectionInfo?.hasValidSelection || isExporting}
          >
            Add frames
          </Button>
        </div>
      </Card>

      {exportError && (
        <ErrorMessage message={exportError} />
      )}

      {/* Frame thumbnails */}
      {frames.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-700">
              Frames ({frames.length})
            </span>
            <Button variant="link" size="xs" onClick={onClearFrames}>
              Clear all
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {frames.map((frame, i) => (
              <div
                key={frame.id}
                className="relative group rounded border border-neutral-200 overflow-hidden"
              >
                <img
                  src={`data:${frame.imageType};base64,${frame.imageBase64}`}
                  alt={frame.name}
                  className="w-full h-16 object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-black/60 px-1 py-0.5">
                  <span className="text-[10px] text-white truncate block">
                    {frame.name}
                  </span>
                </div>
                <button
                  className="absolute top-0.5 right-0.5 hidden group-hover:flex items-center justify-center w-4 h-4 bg-red-500 text-white rounded-full text-[10px] leading-none cursor-pointer"
                  onClick={() => onRemoveFrame(i)}
                  title="Remove frame"
                >
                  x
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Context input */}
      <div className="space-y-1">
        <label className="block text-xs font-semibold text-neutral-700">
          Context *
        </label>
        <Input
          multiline
          placeholder="Describe the product or screen being analyzed (e.g., 'Checkout flow for e-commerce app')"
          value={context}
          onInput={(e: any) => onContextChange(e.target.value)}
        />
      </div>

      {/* Analyze button */}
      <Button
        variant="primary"
        fullWidth
        onClick={onAnalyze}
        loading={isAnalyzing}
        disabled={!canAnalyze || isAnalyzing}
      >
        {isAnalyzing ? 'Analyzing...' : 'Analyze UI'}
      </Button>

      {isAnalyzing && (
        <div className="flex items-center justify-center gap-2 text-xs text-neutral-500">
          <LoadingSpinner size="sm" />
          <span>Sending frames to LLM for review...</span>
        </div>
      )}
    </div>
  )
}
