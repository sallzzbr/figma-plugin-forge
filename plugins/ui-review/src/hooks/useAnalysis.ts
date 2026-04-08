/**
 * hooks/useAnalysis.ts
 * ----------------------------------------------------------------
 * Simplified single-analysis hook.
 * Takes frames + context, calls the analyze controller,
 * and manages loading / result / error state.
 */

import { useState } from 'preact/hooks'
import type { AnalysisContent } from '@figma-forge/shared/types'
import type { ExportedFrame, AnalyzeResponse } from '../types'
import { analyze } from '../controllers/analyze'

export interface UseAnalysisReturn {
  status: 'idle' | 'loading' | 'success' | 'error'
  result: AnalysisContent | null
  promptVersion: string | null
  error: string | null
  /** Run the analysis with the given frames and context. */
  run: (frames: ExportedFrame[], context: string) => Promise<void>
  /** Reset state back to idle. */
  reset: () => void
}

export function useAnalysis(): UseAnalysisReturn {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [result, setResult] = useState<AnalysisContent | null>(null)
  const [promptVersion, setPromptVersion] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const run = async (frames: ExportedFrame[], context: string): Promise<void> => {
    if (frames.length === 0) {
      setError('No frames selected.')
      setStatus('error')
      return
    }
    if (!context.trim()) {
      setError('Context is required.')
      setStatus('error')
      return
    }

    setStatus('loading')
    setError(null)

    try {
      const response: AnalyzeResponse = await analyze({ frames, context })
      setResult(response.result)
      setPromptVersion(response.prompt_version)
      setStatus('success')
    } catch (e: any) {
      setError(e?.message || 'Unknown error during analysis.')
      setStatus('error')
    }
  }

  const reset = () => {
    setStatus('idle')
    setResult(null)
    setPromptVersion(null)
    setError(null)
  }

  return { status, result, promptVersion, error, run, reset }
}
