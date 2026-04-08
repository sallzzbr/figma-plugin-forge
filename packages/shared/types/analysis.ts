/**
 * types/analysis.ts
 * ----------------------------------------------------------------
 * Generic analysis result types.
 * Designed for any plugin that performs AI-powered analysis
 * of Figma frames (reviews, audits, scoring, etc.).
 */

/** A single analysis result keyed by slug. */
export interface AnalysisResult {
  slug: string
  promptVersion: string
  result: AnalysisContent
}

/** The content of an analysis result. */
export interface AnalysisContent {
  sections: AnalysisSection[]
  score?: ScoreBreakdown
  verdict?: AnalysisVerdict
}

/** A section grouping related analysis items. */
export interface AnalysisSection {
  title: string
  items: AnalysisItem[]
}

/** A single finding within a section. */
export interface AnalysisItem {
  label: string
  status: 'positive' | 'negative' | 'neutral' | 'warning'
  description: string
  recommendation?: string
}

/** Score breakdown with weighted categories. */
export interface ScoreBreakdown {
  overall: number
  categories: Array<{ name: string; score: number; weight: number }>
}

/** High-level verdict summarizing the analysis. */
export interface AnalysisVerdict {
  label: string
  description: string
  level: 'excellent' | 'good' | 'needs-improvement' | 'critical'
}
