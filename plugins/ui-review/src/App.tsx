/**
 * App.tsx — UI Review Plugin
 * ----------------------------------------------------------------
 * Single-screen flow: select frames -> add context -> analyze -> results.
 * Simplified version of meuireviewer — no tabs, no groups, no history.
 */

import { h, Component, ComponentChildren } from 'preact'
import { useState, useCallback } from 'preact/hooks'
import { Card } from '@figma-forge/shared/ui'
import { useFigmaSelection } from './hooks/useFigmaSelection'
import { useAnalysis } from './hooks/useAnalysis'
import { AnalysisPanel } from './components/AnalysisPanel'
import { ResultView } from './components/ResultView'

/* -----------------------------------------------------------
 * ErrorBoundary
 * --------------------------------------------------------- */

interface ErrorBoundaryProps {
  children: ComponentChildren
}

interface ErrorBoundaryState {
  hasError: boolean
  message: string
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, message: '' }
  }

  componentDidCatch(error: Error) {
    this.setState({ hasError: true, message: String(error?.message || error) })
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card variant="error" className="text-sm">
          An error occurred in the interface.
          <br />
          <span className="text-red-600">{this.state.message}</span>
        </Card>
      )
    }
    return this.props.children
  }
}

/* -----------------------------------------------------------
 * App
 * --------------------------------------------------------- */

export default function App() {
  const [context, setContext] = useState('')
  const figma = useFigmaSelection()
  const analysis = useAnalysis()

  const canAnalyze = context.trim().length > 0 && figma.frames.length > 0

  const handleAnalyze = useCallback(() => {
    analysis.run(figma.frames, context)
  }, [figma.frames, context])

  const handleReset = useCallback(() => {
    analysis.reset()
  }, [])

  return (
    <div className="p-3 bg-white text-neutral-900 min-h-screen">
      <ErrorBoundary>
        {/* Header */}
        <div className="mb-3">
          <h1 className="text-sm font-bold text-neutral-900">UI Review</h1>
          <p className="text-[11px] text-neutral-500 mt-0.5">
            Select frames and get AI-powered UX/UI feedback
          </p>
        </div>

        {/* Error from analysis */}
        {analysis.error && (
          <Card variant="error" className="text-sm mb-3">
            {analysis.error}
          </Card>
        )}

        {/* Show results or analysis panel */}
        {analysis.status === 'success' && analysis.result ? (
          <ResultView result={analysis.result} onReset={handleReset} />
        ) : (
          <AnalysisPanel
            frames={figma.frames}
            selectionInfo={figma.selectionInfo}
            isExporting={figma.isExporting}
            exportError={figma.exportError}
            context={context}
            onContextChange={setContext}
            onAppendSelection={figma.appendSelection}
            onRemoveFrame={figma.removeFrame}
            onClearFrames={figma.clearFrames}
            onAnalyze={handleAnalyze}
            isAnalyzing={analysis.status === 'loading'}
            canAnalyze={canAnalyze}
          />
        )}
      </ErrorBoundary>
    </div>
  )
}
