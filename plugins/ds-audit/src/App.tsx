/**
 * App.tsx
 * ----------------------------------------------------------------
 * Root component for the DS Audit plugin.
 *
 * RESPONSIBILITIES:
 * - Orchestrate "Analyze" and "Settings" tabs
 * - Centralize selection state and rules config
 * - Delegate rendering to autocontained panel components
 */

import { h } from 'preact'
import { useState, useEffect } from 'preact/hooks'
import { Tabs, type TabDef } from '@figma-forge/shared/ui'
import { AnalyzePanel } from './components/AnalyzePanel'
import { SettingsPanel } from './components/SettingsPanel'
import { defaultRulesConfig } from './rules'
import type { RulesConfig, MainMessage, SelectionChangedMessage } from './types'

export default function App() {
  const [activeTab, setActiveTab] = useState<'analyze' | 'settings'>('analyze')
  const [selection, setSelection] = useState<SelectionChangedMessage['items']>([])
  const [pageName, setPageName] = useState('')
  const [rulesConfig, setRulesConfig] = useState<RulesConfig>(defaultRulesConfig())

  // Listen to main thread messages (selection + config)
  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      const msg = e.data?.pluginMessage as MainMessage | undefined
      if (!msg) return

      switch (msg.type) {
        case 'selection-changed':
          setSelection(msg.items)
          setPageName(msg.pageName)
          break
        case 'rules-config-loaded':
          setRulesConfig(msg.config)
          break
      }
    }
    window.addEventListener('message', handleMessage)
    parent.postMessage({ pluginMessage: { type: 'load-rules-config' } }, '*')
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  function handleConfigChange(config: RulesConfig) {
    setRulesConfig(config)
    parent.postMessage({ pluginMessage: { type: 'save-rules-config', config } }, '*')
  }

  const tabs: TabDef[] = [
    { id: 'analyze', label: 'Analyze' },
    { id: 'settings', label: 'Settings' },
  ]

  return (
    <div className="flex flex-col h-screen bg-white text-neutral-900">
      {/* Tabs */}
      <div className="px-4 pt-3">
        <Tabs
          tabs={tabs}
          activeId={activeTab}
          onChange={(id) => setActiveTab(id as 'analyze' | 'settings')}
        />
      </div>

      {/* Content -- both mounted, hidden toggles visibility (preserves state) */}
      <div className="flex-1 overflow-hidden p-4">
        <div className={`h-full ${activeTab === 'analyze' ? '' : 'hidden'}`}>
          <AnalyzePanel
            selection={selection}
            pageName={pageName}
            rulesConfig={rulesConfig}
          />
        </div>
        <div className={`h-full ${activeTab === 'settings' ? '' : 'hidden'}`}>
          <SettingsPanel
            config={rulesConfig}
            onConfigChange={handleConfigChange}
          />
        </div>
      </div>
    </div>
  )
}
