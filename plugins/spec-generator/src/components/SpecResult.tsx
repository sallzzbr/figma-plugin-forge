/**
 * components/SpecResult.tsx
 * ----------------------------------------------------------------
 * Renders the structured specification: summary card, requirements
 * list with priority badges, acceptance criteria checklist, and
 * test scenarios in collapsible sections.
 */

import { h } from 'preact'
import { useState } from 'preact/hooks'
import { Card, Badge, Collapsible, Button } from '@figma-forge/shared/ui'
import type { SpecResult } from '../types'

interface SpecResultViewProps {
  result: SpecResult
}

/** Maps priority values to Badge variants. */
const priorityVariant: Record<string, 'error' | 'warning' | 'info' | 'neutral'> = {
  must: 'error',
  should: 'warning',
  could: 'info',
  wont: 'neutral',
}

/** Maps priority values to display labels. */
const priorityLabel: Record<string, string> = {
  must: 'Must',
  should: 'Should',
  could: 'Could',
  wont: "Won't",
}

/**
 * Serializes the SpecResult as plain text for clipboard export.
 */
function formatResultAsText(result: SpecResult): string {
  const lines: string[] = []

  lines.push('SUMMARY\n' + result.summary)

  lines.push(
    'REQUIREMENTS\n' +
      result.requirements
        .map(r => `[${r.id}] (${r.priority}) ${r.title}\n  ${r.description}`)
        .join('\n\n'),
  )

  lines.push(
    'ACCEPTANCE CRITERIA\n' +
      result.acceptanceCriteria.map((c, i) => `${i + 1}. ${c}`).join('\n'),
  )

  lines.push(
    'TEST SCENARIOS\n' +
      result.testScenarios
        .map(
          s =>
            `${s.name}\n  Steps:\n${s.steps.map((st, i) => `    ${i + 1}. ${st}`).join('\n')}\n  Expected: ${s.expected}`,
        )
        .join('\n\n'),
  )

  return lines.join('\n\n')
}

/**
 * Copies text to the clipboard using the Clipboard API with fallback.
 */
function copyText(text: string): boolean {
  try {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text)
      return true
    }
    // Fallback for environments without Clipboard API
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.left = '-9999px'
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
    return true
  } catch {
    return false
  }
}

export function SpecResultView({ result }: SpecResultViewProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    if (copyText(formatResultAsText(result))) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="space-y-3 mt-3">
      {/* Copy all button */}
      <Button variant="secondary" onClick={handleCopy} className="w-full">
        {copied ? 'Copied!' : 'Copy all'}
      </Button>

      {/* Summary */}
      <Card>
        <div className="font-semibold text-xs text-neutral-500 uppercase tracking-wide mb-1">
          Summary
        </div>
        <p className="text-sm text-neutral-800">{result.summary}</p>
      </Card>

      {/* Requirements */}
      <Card>
        <div className="font-semibold text-xs text-neutral-500 uppercase tracking-wide mb-2">
          Requirements ({result.requirements.length})
        </div>
        <div className="space-y-2">
          {result.requirements.map((req) => (
            <div
              key={req.id}
              className="p-2 bg-neutral-50 rounded border border-neutral-100"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-neutral-500">{req.id}</span>
                <Badge
                  variant={priorityVariant[req.priority] ?? 'neutral'}
                  size="sm"
                >
                  {priorityLabel[req.priority] ?? req.priority}
                </Badge>
              </div>
              <div className="text-sm font-medium text-neutral-800 mb-0.5">
                {req.title}
              </div>
              <p className="text-xs text-neutral-600">{req.description}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Acceptance Criteria */}
      <Card>
        <div className="font-semibold text-xs text-neutral-500 uppercase tracking-wide mb-2">
          Acceptance Criteria ({result.acceptanceCriteria.length})
        </div>
        <ul className="space-y-1">
          {result.acceptanceCriteria.map((criterion, i) => (
            <li
              key={`ac-${i}`}
              className="text-sm text-neutral-800 flex gap-2"
            >
              <span className="text-green-500 flex-shrink-0">&#x2713;</span>
              <span>{criterion}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Test Scenarios */}
      <Card>
        <div className="font-semibold text-xs text-neutral-500 uppercase tracking-wide mb-2">
          Test Scenarios ({result.testScenarios.length})
        </div>
        <div className="space-y-1">
          {result.testScenarios.map((scenario, i) => (
            <Collapsible
              key={`ts-${i}`}
              title={scenario.name}
            >
              <div className="pl-4 pb-2">
                <div className="text-xs font-medium text-neutral-500 mb-1">Steps</div>
                <ol className="space-y-0.5 mb-2">
                  {scenario.steps.map((step, si) => (
                    <li
                      key={`step-${si}`}
                      className="text-xs text-neutral-700 flex gap-1.5"
                    >
                      <span className="text-neutral-400 flex-shrink-0">{si + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
                <div className="text-xs font-medium text-neutral-500 mb-0.5">Expected</div>
                <p className="text-xs text-neutral-700">{scenario.expected}</p>
              </div>
            </Collapsible>
          ))}
        </div>
      </Card>
    </div>
  )
}
