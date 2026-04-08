/**
 * rules/spacing-variables.ts
 * ----------------------------------------------------------------
 * Rule: Spacing variables (Auto Layout).
 *
 * RESPONSIBILITIES:
 * - Check if Auto Layout itemSpacing and paddings are bound to variables
 *
 * LOGIC:
 * - Only nodes with layoutMode !== 'NONE' (Auto Layout active)
 * - Properties: itemSpacing, paddingTop, paddingRight, paddingBottom, paddingLeft
 * - Ignores properties with value 0 (no spacing defined)
 * - Message indicates which properties are missing variables
 *
 * EXECUTION: Runs on the main thread (Figma sandbox), NOT in the UI.
 */

import type { RuleViolation } from '../types'
import { walkNodes, shouldSkipSelfCheck } from './walk'
import { createViolation, hasAutoLayout } from './helpers'

const RULE_ID = 'spacing-variables'

const SPACING_PROPS = [
  'itemSpacing',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
] as const

const PROP_LABELS: Record<string, string> = {
  itemSpacing: 'item spacing',
  paddingTop: 'top padding',
  paddingRight: 'right padding',
  paddingBottom: 'bottom padding',
  paddingLeft: 'left padding',
}

/**
 * Checks if Auto Layout nodes have spacing without bound variables.
 * @param nodes - Root nodes to check (traverses children recursively)
 * @returns Array of violations found
 */
export function checkSpacingVariables(nodes: readonly SceneNode[]): RuleViolation[] {
  const violations: RuleViolation[] = []

  walkNodes(nodes, (node, parentPath) => {
    if (shouldSkipSelfCheck(node)) return
    if (!hasAutoLayout(node)) return

    const frame = node as FrameNode
    const bound = (frame as any).boundVariables ?? {}
    const missing: string[] = []

    for (const prop of SPACING_PROPS) {
      const value = (frame as any)[prop]
      // Ignore value 0 (no spacing defined)
      if (typeof value !== 'number' || value === 0) continue
      // Check if bound to a variable
      if (!bound[prop]) {
        missing.push(PROP_LABELS[prop] || prop)
      }
    }

    if (missing.length > 0) {
      violations.push(createViolation(RULE_ID, node, parentPath, `No variable: ${missing.join(', ')}`))
    }
  })

  return violations
}
