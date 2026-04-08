/**
 * rules/helpers.ts
 * ----------------------------------------------------------------
 * Shared utilities for audit rules.
 *
 * RESPONSIBILITIES:
 * - Build violation objects with standardized format
 * - Type guards for Figma node properties
 */

import type { RuleViolation } from '../types'

/** Creates a violation object with computed layerPath and parentName */
export function createViolation(
  ruleId: string,
  node: SceneNode,
  parentPath: string[],
  message: string,
): RuleViolation {
  return {
    ruleId,
    nodeId: node.id,
    nodeName: node.name,
    message,
    layerPath: [...parentPath, node.name].join(' > '),
    parentName: parentPath[parentPath.length - 1] || '(root)',
  }
}

/** Type guard: node has fills */
export function hasFills(node: SceneNode): node is SceneNode & MinimalFillsMixin {
  return 'fills' in node
}

/** Type guard: node has strokes */
export function hasStrokes(node: SceneNode): node is SceneNode & MinimalStrokesMixin {
  return 'strokes' in node
}

/** Checks if node has active Auto Layout */
export function hasAutoLayout(node: SceneNode): boolean {
  return 'layoutMode' in node && (node as any).layoutMode !== 'NONE'
}
