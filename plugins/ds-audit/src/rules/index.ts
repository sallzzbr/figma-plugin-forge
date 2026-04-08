/**
 * rules/index.ts
 * ----------------------------------------------------------------
 * Central registry of audit rules.
 *
 * RESPONSIBILITIES:
 * - Maintain catalog of all rules with their check functions
 * - Generate default config from rule defaults
 * - Execute enabled rules via runEnabledRules()
 *
 * TO ADD A NEW RULE:
 * 1. Create the rule file in rules/ (e.g. rules/my-rule.ts)
 * 2. Add the definition to the RULES array below (including check and shortLabel)
 * -- Done! main.ts executes automatically via runEnabledRules()
 */

import type { RuleDefinition, RuleViolation, RulesConfig } from '../types'
import { checkColorVariables } from './color-variables'
import { checkSpacingVariables } from './spacing-variables'

/** Catalog of all available rules */
export const RULES: RuleDefinition[] = [
  {
    id: 'color-variables',
    name: 'Color variables',
    shortLabel: 'Colors',
    description:
      'Checks if fill and stroke colors use design system variables or color styles',
    defaultEnabled: true,
    check: checkColorVariables,
  },
  {
    id: 'spacing-variables',
    name: 'Spacing variables',
    shortLabel: 'Spacing',
    description:
      'Checks if Auto Layout spacing and padding are bound to numeric variables',
    defaultEnabled: true,
    check: checkSpacingVariables,
  },
]

/** Generates default config (all rules with their defaults) */
export function defaultRulesConfig(): RulesConfig {
  const config: RulesConfig = {}
  for (const rule of RULES) {
    config[rule.id] = rule.defaultEnabled
  }
  return config
}

/** Executes all enabled rules on the provided nodes */
export function runEnabledRules(
  nodes: readonly SceneNode[],
  rulesConfig: RulesConfig,
): RuleViolation[] {
  const violations: RuleViolation[] = []
  for (const rule of RULES) {
    const enabled = rule.defaultEnabled
      ? rulesConfig[rule.id] !== false
      : rulesConfig[rule.id] === true
    if (enabled) {
      violations.push(...rule.check(nodes))
    }
  }
  return violations
}
