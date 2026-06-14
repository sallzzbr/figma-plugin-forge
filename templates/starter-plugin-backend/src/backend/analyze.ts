// Example feature: summarize the current selection. Tries the backend first and
// falls back to an equivalent local computation, so the plugin works whether or
// not a backend is configured/reachable. The plugin depends only on this JSON
// contract — not on which backend produces it.

import type { SelectionItem } from '../types/messages'
import { post } from './client'
import { withFallback, type FallbackResult } from './fallback'

export type SelectionSummary = {
  total: number
  byType: Record<string, number>
  headline: string
}

function localSummary(items: SelectionItem[]): SelectionSummary {
  const byType: Record<string, number> = {}
  for (const item of items) byType[item.type] = (byType[item.type] ?? 0) + 1
  const kinds = Object.keys(byType).length
  return {
    total: items.length,
    byType,
    headline: `${items.length} layer(s) across ${kinds} type(s)`,
  }
}

/** Summarize the selection via the backend, falling back to a local summary. */
export function summarizeSelection(
  items: SelectionItem[],
): Promise<FallbackResult<SelectionSummary>> {
  return withFallback(
    () => post<SelectionSummary>('analyze-selection', { items }),
    () => localSummary(items),
  )
}
