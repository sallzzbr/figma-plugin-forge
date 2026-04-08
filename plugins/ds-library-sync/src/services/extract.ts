/**
 * services/extract.ts
 * ---------------------------------------------------------------
 * Simplified extraction helper.
 *
 * The heavy lifting (iterating pages, reading Figma nodes) happens
 * in main.ts on the sandbox thread. This module provides lightweight
 * post-processing utilities that run on the UI thread after
 * extraction results arrive.
 */

import type { ExtractedComponent, ExtractedToken } from '../types'

/**
 * De-duplicate components by key, keeping the first occurrence.
 * Useful when the same component appears in multiple contexts.
 */
export function deduplicateComponents(
  components: ExtractedComponent[]
): ExtractedComponent[] {
  const seen = new Set<string>()
  const result: ExtractedComponent[] = []

  for (const comp of components) {
    if (!seen.has(comp.key)) {
      seen.add(comp.key)
      result.push(comp)
    }
  }

  return result
}

/**
 * De-duplicate tokens by key, keeping the first occurrence.
 */
export function deduplicateTokens(
  tokens: ExtractedToken[]
): ExtractedToken[] {
  const seen = new Set<string>()
  const result: ExtractedToken[] = []

  for (const token of tokens) {
    if (!seen.has(token.key)) {
      seen.add(token.key)
      result.push(token)
    }
  }

  return result
}

/**
 * Sort components alphabetically by name.
 */
export function sortByName<T extends { name: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.name.localeCompare(b.name))
}
