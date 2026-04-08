/**
 * components/SettingsPanel.tsx
 * ----------------------------------------------------------------
 * Settings panel for the DS Audit plugin.
 *
 * RESPONSIBILITIES:
 * - Display list of audit rules with on/off switches
 * - Allow the user to enable/disable rules individually
 * - Delegate persistence to the parent component (App)
 *
 * USAGE: Rendered in the "Settings" tab of App.tsx
 */

import { h } from 'preact'
import { Card, Switch } from '@figma-forge/shared/ui'
import { RULES } from '../rules'
import type { RulesConfig } from '../types'

/** Props for SettingsPanel */
interface SettingsPanelProps {
  /** Current rules enabled/disabled configuration */
  config: RulesConfig
  /** Callback when the user toggles a rule */
  onConfigChange: (config: RulesConfig) => void
}

/** Settings panel with switches for each rule */
export function SettingsPanel({ config, onConfigChange }: SettingsPanelProps) {
  function handleToggle(ruleId: string, enabled: boolean) {
    onConfigChange({ ...config, [ruleId]: enabled })
  }

  return (
    <section className="space-y-3 h-full overflow-y-auto">
      <Card>
        <h3 className="text-sm font-semibold text-neutral-900 mb-3">
          Audit rules
        </h3>
        <div className="space-y-3">
          {RULES.map((rule) => (
            <Switch
              key={rule.id}
              checked={config[rule.id] ?? rule.defaultEnabled}
              onChange={(v) => handleToggle(rule.id, v)}
              label={rule.name}
              description={rule.description}
            />
          ))}
        </div>
      </Card>
    </section>
  )
}
