/**
 * components/AnalyzePanel.tsx
 * ----------------------------------------------------------------
 * Analyze panel for the DS Audit plugin -- "Analyze" tab.
 *
 * RESPONSIBILITIES:
 * - Orchestrate loading state, results, and grouping
 * - Communicate with main thread (analyze, navigate)
 * - Show violations grouped by rule, count per rule, click to focus node
 */

import { h } from 'preact'
import { useState, useEffect, useMemo } from 'preact/hooks'
import { Card, Badge, Button, Collapsible } from '@figma-forge/shared/ui'
import type { RuleViolation, RulesConfig, MainMessage, SelectionChangedMessage } from '../types'
import { RULES } from '../rules'

/** Props for AnalyzePanel */
interface AnalyzePanelProps {
  selection: SelectionChangedMessage['items']
  pageName: string
  rulesConfig: RulesConfig
}

// ---- Rule labels (derived from central registry) ----

const RULE_LABELS = RULES.reduce<Record<string, string>>((acc, r) => {
  acc[r.id] = r.shortLabel
  return acc
}, {})

function getRuleLabel(ruleId: string): string {
  return RULE_LABELS[ruleId] ?? ruleId
}

// ---- Grouping ----

/** Groups violations by ruleId */
function groupByRule(violations: RuleViolation[]): Map<string, RuleViolation[]> {
  const groups = new Map<string, RuleViolation[]>()
  for (const v of violations) {
    const list = groups.get(v.ruleId)
    if (list) list.push(v)
    else groups.set(v.ruleId, [v])
  }
  return groups
}

// ---- Component ----

export function AnalyzePanel({ selection, pageName, rulesConfig }: AnalyzePanelProps) {
  const [violations, setViolations] = useState<RuleViolation[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Listen to main thread messages
  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      const msg = e.data?.pluginMessage as MainMessage | undefined
      if (!msg) return

      switch (msg.type) {
        case 'analysis-results':
          setViolations(msg.violations)
          setLoading(false)
          setError(null)
          break
        case 'analysis-error':
          setLoading(false)
          setError(msg.error)
          break
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  function handleAnalyze() {
    setLoading(true)
    setViolations(null)
    setError(null)
    parent.postMessage({
      pluginMessage: { type: 'analyze-selection', rulesConfig },
    }, '*')
  }

  function handleFocusNode(nodeId: string) {
    parent.postMessage({
      pluginMessage: { type: 'focus-node', nodeId },
    }, '*')
  }

  // Group violations by rule
  const groups = useMemo(
    () => (violations ? groupByRule(violations) : null),
    [violations],
  )

  const totalCount = violations?.length ?? 0

  return (
    <div className="flex flex-col h-full">
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto space-y-3">

        {/* Pre-analysis: selection info */}
        {violations === null && !loading && !error && (
          <Card>
            <div className="text-sm text-neutral-600">
              {selection.length === 0 ? (
                <div>
                  <div className="font-medium text-neutral-800 mb-1">No selection</div>
                  <div className="text-xs">
                    Select frames or components to analyze, or click Analyze to scan the entire page.
                  </div>
                </div>
              ) : (
                <div>
                  <div className="font-medium text-neutral-800 mb-1">
                    {selection.length} element{selection.length !== 1 ? 's' : ''} selected
                  </div>
                  <div className="text-xs text-neutral-500">
                    Page: {pageName}
                  </div>
                  <ul className="mt-2 space-y-0.5">
                    {selection.slice(0, 5).map((item, i) => (
                      <li key={i} className="text-xs text-neutral-600 truncate">
                        {item.name}
                        <span className="ml-1 text-neutral-400">({item.type})</span>
                      </li>
                    ))}
                    {selection.length > 5 && (
                      <li className="text-xs text-neutral-400">
                        +{selection.length - 5} more...
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Loading */}
        {loading && (
          <Card>
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <span className="animate-spin inline-block w-4 h-4 border-2 border-neutral-400 border-t-transparent rounded-full" />
              Analyzing...
            </div>
          </Card>
        )}

        {/* Error */}
        {error && (
          <Card variant="error">
            <div className="text-sm font-medium">Analysis error</div>
            <div className="text-xs mt-1">{error}</div>
          </Card>
        )}

        {/* Post-analysis: results */}
        {!loading && violations !== null && (
          <div className="space-y-3">
            {/* Success -- 0 violations */}
            {totalCount === 0 && (
              <Card variant="success">
                <div className="text-sm font-medium">No violations found</div>
                <div className="text-xs text-neutral-600 mt-1">
                  All checked elements comply with the design system rules.
                </div>
              </Card>
            )}

            {/* Summary badge */}
            {totalCount > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-neutral-900">Violations</span>
                <Badge variant="error" size="sm">
                  {totalCount}
                </Badge>
              </div>
            )}

            {/* Violations grouped by rule */}
            {groups !== null && totalCount > 0 && (
              <div className="space-y-2">
                {Array.from(groups.entries()).map(([ruleId, items]) => (
                  <Card key={ruleId}>
                    <Collapsible
                      defaultOpen
                      title={
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-neutral-800">
                            {getRuleLabel(ruleId)}
                          </span>
                          <Badge variant="warning" size="sm">
                            {items.length}
                          </Badge>
                        </div>
                      }
                    >
                      <div className="space-y-1.5 mt-1">
                        {items.map((v) => (
                          <div
                            key={v.nodeId}
                            className="flex items-center justify-between rounded-md border border-neutral-100 px-2.5 py-2 bg-white"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-medium text-neutral-800 truncate">
                                {v.layerPath || v.nodeName}
                              </div>
                              <div className="text-xs text-neutral-500 mt-0.5">
                                {v.message}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="xs"
                              onClick={() => handleFocusNode(v.nodeId)}
                            >
                              Go to
                            </Button>
                          </div>
                        ))}
                      </div>
                    </Collapsible>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Fixed footer */}
      <div className="pt-4 mt-auto border-t border-neutral-200">
        <Button
          variant="primary"
          fullWidth
          size="lg"
          loading={loading}
          onClick={handleAnalyze}
        >
          Analyze
        </Button>
      </div>
    </div>
  )
}
