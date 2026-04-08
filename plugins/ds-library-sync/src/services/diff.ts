/**
 * services/diff.ts
 * ---------------------------------------------------------------
 * Simple diff engine: compares extracted components against stored
 * components and categorizes them as added, removed, or changed.
 *
 * Complexity: O(n + m) where n = extracted, m = stored.
 */

import type { ExtractedComponent, DiffResult } from '../types'

/**
 * Compare extracted components against the stored (backend) list.
 *
 * Classification:
 *  - added:     exists in extracted but not in stored
 *  - removed:   exists in stored but not in extracted
 *  - changed:   exists in both but name or description differs
 *  - unchanged: count of items identical in both
 */
export function computeDiff(
  extracted: ExtractedComponent[],
  stored: ExtractedComponent[]
): DiffResult {
  const storedMap = new Map<string, ExtractedComponent>()
  for (const item of stored) {
    storedMap.set(item.key, item)
  }

  const result: DiffResult = {
    added: [],
    removed: [],
    changed: [],
    unchanged: 0,
  }

  const seenKeys = new Set<string>()

  for (const item of extracted) {
    seenKeys.add(item.key)
    const existing = storedMap.get(item.key)

    if (!existing) {
      result.added.push(item)
    } else if (
      item.name !== existing.name ||
      item.description !== existing.description
    ) {
      result.changed.push(item)
    } else {
      result.unchanged++
    }
  }

  for (const item of stored) {
    if (!seenKeys.has(item.key)) {
      result.removed.push(item)
    }
  }

  return result
}
