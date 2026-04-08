/**
 * rules/color-variables.ts
 * ----------------------------------------------------------------
 * Rule: Design system colors.
 *
 * RESPONSIBILITIES:
 * - Check if solid fills/strokes use variables OR color styles
 * - Accepts both boundVariables (variables) and fillStyleId/strokeStyleId (styles)
 * - Ignores fills/strokes of type IMAGE or GRADIENT
 *
 * LOGIC:
 * - Visible solid fills -> boundVariables.fills OR fillStyleId must exist
 * - Visible solid strokes -> boundVariables.strokes OR strokeStyleId must exist
 * - TextNode -> boundVariables.fills/textRangeFills OR fillStyleId (node/segment level)
 * - Deduplication: multiple issues on the same node produce ONE violation
 *
 * EXECUTION: Runs on the main thread (Figma sandbox), NOT in the UI.
 */

import type { RuleViolation } from '../types'
import { walkNodes, shouldSkipSelfCheck } from './walk'
import { createViolation, hasFills, hasStrokes } from './helpers'

const RULE_ID = 'color-variables'

/**
 * Checks if nodes have solid fills/strokes without a bound color variable.
 * @param nodes - Root nodes to check (traverses children recursively)
 * @returns Array of violations found
 */
export function checkColorVariables(nodes: readonly SceneNode[]): RuleViolation[] {
  const violationMap = new Map<string, RuleViolation>()

  walkNodes(nodes, (node, parentPath) => {
    if (shouldSkipSelfCheck(node)) return

    const issues: string[] = []

    // Check text with segments (per-range color)
    if (node.type === 'TEXT') {
      if (hasUnboundTextFills(node as TextNode)) {
        issues.push('text color')
      }
    } else {
      // Check solid fills
      if (hasFills(node) && hasUnboundSolidFills(node)) {
        issues.push('fill')
      }

      // Check solid strokes
      if (hasStrokes(node) && hasUnboundSolidStrokes(node)) {
        issues.push('stroke')
      }
    }

    if (issues.length > 0) {
      const message = issues.length === 1
        ? `${capitalize(issues[0])} without color variable or style`
        : `${capitalize(issues.join(' and '))} without color variable or style`

      violationMap.set(node.id, createViolation(RULE_ID, node, parentPath, message))
    }
  })

  return Array.from(violationMap.values())
}

/** Capitalizes first letter */
function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

/** Checks if there are visible solid fills without a bound variable or style */
function hasUnboundSolidFills(node: SceneNode & MinimalFillsMixin): boolean {
  const fills = node.fills
  if (!Array.isArray(fills) || fills.length === 0) return false

  const solidFills = fills.filter((f: Paint) => f.visible !== false && f.type === 'SOLID')
  if (solidFills.length === 0) return false

  // Check node-level boundVariables.fills (variable)
  const boundFills = (node as any).boundVariables?.fills
  if (Array.isArray(boundFills) && boundFills.length > 0) return false

  // Check fillStyleId (color style)
  const styleId = (node as any).fillStyleId
  if (typeof styleId === 'string' && styleId.length > 0) return false

  // Check paint-level boundVariables.color on each solid fill
  if (solidFills.every((f: Paint) => (f as any).boundVariables?.color)) return false

  return true
}

/** Checks if there are visible solid strokes without a bound variable or style */
function hasUnboundSolidStrokes(node: SceneNode & MinimalStrokesMixin): boolean {
  const strokes = node.strokes
  if (!Array.isArray(strokes) || strokes.length === 0) return false

  const solidStrokes = strokes.filter((s: Paint) => s.visible !== false && s.type === 'SOLID')
  if (solidStrokes.length === 0) return false

  // Check node-level boundVariables.strokes (variable)
  const boundStrokes = (node as any).boundVariables?.strokes
  if (Array.isArray(boundStrokes) && boundStrokes.length > 0) return false

  // Check strokeStyleId (color style)
  const styleId = (node as any).strokeStyleId
  if (typeof styleId === 'string' && styleId.length > 0) return false

  // Check paint-level boundVariables.color on each solid stroke
  if (solidStrokes.every((s: Paint) => (s as any).boundVariables?.color)) return false

  return true
}

/**
 * Checks if text has fills without a color variable or style.
 *
 * Note: getStyledTextSegments with 'boundVariables' only returns text field keys
 * (fontSize, fontFamily, etc.) -- 'fills' is NOT a valid VariableBindableTextField key.
 * So we check:
 * - boundVariables.fills / textRangeFills at the node level (variables)
 * - fillStyleId at the node or per-segment level (color styles)
 */
function hasUnboundTextFills(node: TextNode): boolean {
  if (node.characters.length === 0) return false

  const bv = (node as any).boundVariables

  // Check 1: node-level fills variable binding
  if (Array.isArray(bv?.fills) && bv.fills.length > 0) return false

  // Check 2: text range fills variable binding
  if (Array.isArray(bv?.textRangeFills) && bv.textRangeFills.length > 0) return false

  // Check 3: fillStyleId (color style) -- can be string, '' or figma.mixed
  const styleId = node.fillStyleId
  if (typeof styleId === 'string' && styleId.length > 0) return false

  // If fillStyleId is mixed, check per-segment
  if (typeof styleId !== 'string') {
    try {
      const segments = node.getStyledTextSegments(['fillStyleId', 'fills'])
      const allSegmentsStyled = segments.every(seg => {
        // Segment without visible solid fill -> doesn't need a style
        const fills = seg.fills as Paint[] | undefined
        if (!fills || fills.length === 0) return true
        const hasSolid = fills.some((f: Paint) => f.visible !== false && f.type === 'SOLID')
        if (!hasSolid) return true
        // Segment with solid fill -> needs fillStyleId
        return typeof seg.fillStyleId === 'string' && seg.fillStyleId.length > 0
      })
      if (allSegmentsStyled) return false
    } catch {
      // Ignore getStyledTextSegments error
    }
  }

  // Verify the node actually has visible solid fills
  const fills = node.fills
  if (!Array.isArray(fills) || fills.length === 0) return false
  const hasSolid = fills.some((f: Paint) => f.visible !== false && f.type === 'SOLID')
  if (!hasSolid) return false

  // Check 4: paint-level boundVariables.color
  const solidFills = fills.filter((f: Paint) => f.visible !== false && f.type === 'SOLID')
  if (solidFills.every((f: Paint) => (f as any).boundVariables?.color)) return false

  return true
}
