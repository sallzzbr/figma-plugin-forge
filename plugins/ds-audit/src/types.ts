/**
 * types.ts
 * ----------------------------------------------------------------
 * Type contracts for the DS Audit plugin.
 *
 * Defines interfaces for:
 * - Rule violations found during analysis
 * - Rule definitions (metadata + check function)
 * - Rules configuration (enabled/disabled map)
 */

/** Function signature for a rule's check implementation */
export type RuleCheckFn = (nodes: readonly SceneNode[]) => RuleViolation[]

/** Definition of a single audit rule */
export interface RuleDefinition {
  /** Unique rule identifier (e.g. "color-variables") */
  id: string
  /** Display name shown in the UI */
  name: string
  /** Short label for filter chips and badges */
  shortLabel: string
  /** Detailed description of what the rule checks */
  description: string
  /** Whether the rule is enabled by default */
  defaultEnabled: boolean
  /** Function that runs the check on nodes */
  check: RuleCheckFn
}

/** Violation found by a rule during analysis */
export interface RuleViolation {
  /** ID of the rule that generated this violation */
  ruleId: string
  /** Figma node ID (for navigation) */
  nodeId: string
  /** Figma node name */
  nodeName: string
  /** Descriptive violation message */
  message: string
  /** Hierarchical layer path (e.g. "Frame > Group > Rectangle") */
  layerPath?: string
  /** Direct parent node name (for grouping) */
  parentName?: string
}

/** Map of ruleId to enabled state */
export type RulesConfig = Record<string, boolean>

// ---- Message types ----

/** UI -> Main thread messages */
export type UIMessage =
  | { type: 'ping' }
  | { type: 'load-rules-config' }
  | { type: 'save-rules-config'; config: RulesConfig }
  | { type: 'analyze-selection'; rulesConfig: RulesConfig }
  | { type: 'focus-node'; nodeId: string }

/** Selection changed payload from main thread */
export interface SelectionChangedMessage {
  type: 'selection-changed'
  count: number
  items: { name: string; type: string }[]
  pageName: string
}

/** Main thread -> UI messages */
export type MainMessage =
  | { type: 'pong' }
  | SelectionChangedMessage
  | { type: 'rules-config-loaded'; config: RulesConfig }
  | { type: 'analysis-results'; violations: RuleViolation[] }
  | { type: 'analysis-error'; error: string }
