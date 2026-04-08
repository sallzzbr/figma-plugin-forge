/**
 * hooks/useSpecGeneration.ts
 * ----------------------------------------------------------------
 * Manages the lifecycle of a spec generation:
 * state (idle -> loading -> success | error), result, and error message.
 */

import { useState } from 'preact/hooks'
import type { SpecResult } from '../types'
import type { ExportedFrame } from '@figma-forge/shared/services'
import { generateSpec } from '../controllers/generate-spec'

export interface UseSpecGenerationReturn {
  /** Current generation state. */
  status: 'idle' | 'loading' | 'success' | 'error'
  /** Generated spec result, available when status === 'success'. */
  result: SpecResult | null
  /** Error message, available when status === 'error'. */
  error: string | null
  /**
   * Triggers the spec generation and updates state/result.
   * Does not throw -- errors are captured and exposed via `error`.
   */
  generate: (frames: ExportedFrame[], context: string) => Promise<void>
  /** Resets result, error, and status to 'idle'. */
  clearResult: () => void
}

export function useSpecGeneration(): UseSpecGenerationReturn {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [result, setResult] = useState<SpecResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const generate = async (frames: ExportedFrame[], context: string): Promise<void> => {
    setStatus('loading')
    setError(null)

    try {
      const specResult = await generateSpec({ frames, context })
      setResult(specResult)
      setStatus('success')
    } catch (e: any) {
      setError(e?.message || 'Unknown error generating spec.')
      setStatus('error')
    }
  }

  const clearResult = (): void => {
    setResult(null)
    setStatus('idle')
    setError(null)
  }

  return { status, result, error, generate, clearResult }
}
