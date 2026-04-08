/**
 * App.tsx -- Spec Generator
 * ----------------------------------------------------------------
 * Generates product specifications from selected Figma frames via LLM.
 * Single mode: select frames -> add context -> generate -> show spec result.
 */

import { h } from 'preact'
import { useState, useCallback } from 'preact/hooks'
import { Button, Input, LoadingSpinner, ErrorMessage } from '@figma-forge/shared/ui'
import { focusNode } from '@figma-forge/shared/services'
import { useFigmaSelection } from './hooks/useFigmaSelection'
import { useSpecGeneration } from './hooks/useSpecGeneration'
import { SpecResultView } from './components/SpecResult'

export default function App() {
  const [context, setContext] = useState('')

  const figma = useFigmaSelection()
  const spec = useSpecGeneration()

  const hasFrames = figma.frames.length > 0
  const canGenerate = hasFrames && context.trim().length > 0 && spec.status !== 'loading'

  const handleGenerate = useCallback(async () => {
    await spec.generate(figma.frames, context)
  }, [context, figma.frames, spec.generate])

  const handleRemoveFrame = useCallback((index: number) => {
    figma.removeFrame(index)
  }, [figma.removeFrame])

  const handleReorderFrame = useCallback((from: number, to: number) => {
    figma.reorderFrame(from, to)
  }, [figma.reorderFrame])

  return (
    <div className="min-h-screen p-3 bg-white text-neutral-900">
      {/* Selection area */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              {figma.selectionInfo && figma.selectionInfo.count > 0 && (
                <div className="absolute inset-0 w-2 h-2 rounded-full bg-blue-400 animate-ping" />
              )}
            </div>
            <span className="text-xs text-neutral-600">
              {figma.selectionInfo && figma.selectionInfo.count > 0
                ? `${figma.selectionInfo.count} frame${figma.selectionInfo.count > 1 ? 's' : ''} selected`
                : 'No frames selected'}
            </span>
          </div>
          <Button
            variant="secondary"
            onClick={figma.appendSelection}
            disabled={figma.isExporting || !figma.selectionInfo?.hasValidSelection}
          >
            {figma.isExporting
              ? 'Capturing...'
              : figma.frames.length > 0
                ? '+ Add selection'
                : 'Capture selection'}
          </Button>
        </div>

        {figma.exportError && (
          <ErrorMessage message={figma.exportError} />
        )}

        {/* Frame list */}
        {figma.frames.length > 0 && (
          <div className="space-y-1 mt-2">
            {figma.frames.map((frame, index) => (
              <div
                key={frame.id}
                className="flex items-center gap-2 p-2 bg-neutral-50 rounded-lg border border-neutral-100"
              >
                {/* Order badge */}
                <span className="text-[10px] font-bold text-neutral-400 w-4 text-center flex-shrink-0">
                  {index + 1}
                </span>
                {/* Thumbnail */}
                <img
                  src={`data:${frame.imageType};base64,${frame.imageBase64}`}
                  alt={frame.name}
                  className="w-10 h-10 object-cover rounded flex-shrink-0 border border-neutral-200"
                />
                {/* Name */}
                <span className="text-xs text-neutral-700 flex-1 truncate">{frame.name}</span>
                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  {figma.frames.length > 1 && (
                    <div className="flex flex-col">
                      <button
                        onClick={() => handleReorderFrame(index, index - 1)}
                        disabled={index === 0}
                        className="text-neutral-400 hover:text-neutral-700 disabled:opacity-20 leading-none px-0.5 text-[11px]"
                        title="Move up"
                      >&#8593;</button>
                      <button
                        onClick={() => handleReorderFrame(index, index + 1)}
                        disabled={index === figma.frames.length - 1}
                        className="text-neutral-400 hover:text-neutral-700 disabled:opacity-20 leading-none px-0.5 text-[11px]"
                        title="Move down"
                      >&#8595;</button>
                    </div>
                  )}
                  <button
                    onClick={() => focusNode(frame.id)}
                    className="text-xs text-blue-500 hover:text-blue-700 px-1.5 py-0.5 rounded hover:bg-blue-50"
                    title="View on canvas"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleRemoveFrame(index)}
                    className="text-xs text-neutral-400 hover:text-red-500 px-1.5 py-0.5 rounded hover:bg-red-50"
                    title="Remove"
                  >
                    &#x2715;
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Context textarea */}
      <div className="mb-3">
        <label className="block text-xs font-semibold text-neutral-700 mb-1">
          Context *
        </label>
        <Input
          multiline
          placeholder="Describe the product or feature to be documented"
          value={context}
          onInput={(e: Event) => setContext((e.target as HTMLTextAreaElement).value)}
        />
      </div>

      {/* Generate button */}
      <Button
        variant="primary"
        onClick={handleGenerate}
        disabled={!canGenerate}
        className="w-full"
      >
        {spec.status === 'loading' ? 'Generating...' : 'Generate Spec'}
      </Button>

      {/* Loading */}
      {spec.status === 'loading' && (
        <div className="flex justify-center mt-4">
          <LoadingSpinner />
        </div>
      )}

      {/* Error */}
      {spec.status === 'error' && spec.error && (
        <div className="mt-3">
          <ErrorMessage message={spec.error} />
        </div>
      )}

      {/* Result */}
      {spec.status === 'success' && spec.result && (
        <SpecResultView result={spec.result} />
      )}
    </div>
  )
}
