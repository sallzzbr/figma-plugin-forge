/**
 * controllers/analyze.ts
 * ----------------------------------------------------------------
 * Client-side HTTP wrapper for the analyze edge function.
 * Runs in the plugin iframe (NOT the Figma sandbox).
 *
 * Sends selected frames + context to the backend for UX/UI analysis
 * via an LLM and returns a typed AnalysisContent result.
 */

import { SUPABASE_CONFIG, anonHeaders } from '@figma-forge/shared/services'
import type { ExportedFrame, AnalyzeResponse } from '../types'

export interface AnalyzeParams {
  frames: ExportedFrame[]
  context: string
}

/**
 * Call the `analyze` edge function on Supabase.
 * Sends frame images and context for UX/UI review.
 */
export async function analyze(params: AnalyzeParams): Promise<AnalyzeResponse> {
  const { frames, context } = params

  if (!frames.length) throw new Error('No frames selected.')
  if (!context.trim()) throw new Error('Context is required.')

  const payload = {
    context,
    frames: frames.map((f) => ({
      name: f.name,
      image: f.imageBase64,
      imageType: f.imageType,
    })),
  }

  const url = `${SUPABASE_CONFIG.URL}/functions/v1/analyze`

  const res = await fetch(url, {
    method: 'POST',
    headers: anonHeaders(),
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`)
  }

  return (await res.json()) as AnalyzeResponse
}
