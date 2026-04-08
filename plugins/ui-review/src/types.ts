/**
 * types.ts
 * ----------------------------------------------------------------
 * Local types for the ui-review plugin.
 * Re-exports analysis types from shared and defines plugin-specific types.
 */

export type {
  AnalysisResult,
  AnalysisContent,
  AnalysisSection,
  AnalysisItem,
  ScoreBreakdown,
  AnalysisVerdict,
} from '@figma-forge/shared/types'

/** A frame exported from the Figma main thread as a base64 image. */
export interface ExportedFrame {
  /** Node ID in Figma */
  id: string
  /** Name of the frame/component */
  name: string
  /** Base64-encoded image data */
  imageBase64: string
  /** MIME type (image/jpeg or image/png) */
  imageType: string
}

/** Response from the analyze edge function. */
export interface AnalyzeResponse {
  slug: string
  prompt_version: string
  result: import('@figma-forge/shared/types').AnalysisContent
}
