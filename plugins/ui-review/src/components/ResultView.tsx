/**
 * components/ResultView.tsx
 * ----------------------------------------------------------------
 * Renders AnalysisContent: sections with items showing status icons,
 * score breakdown, and verdict banner.
 * Uses Card, Badge, Collapsible from @figma-forge/shared/ui.
 */

import { h } from 'preact'
import { Card, Badge, Collapsible, Button, ScoreDisplay } from '@figma-forge/shared/ui'
import type { AnalysisContent, AnalysisSection, AnalysisItem, AnalysisVerdict } from '@figma-forge/shared/types'

interface ResultViewProps {
  result: AnalysisContent
  onReset: () => void
}

const STATUS_ICON: Record<string, string> = {
  positive: '\u2705',
  negative: '\u274C',
  warning: '\u26A0\uFE0F',
  neutral: '\u2139\uFE0F',
}

const STATUS_VARIANT: Record<string, 'success' | 'error' | 'warning' | 'info' | 'neutral'> = {
  positive: 'success',
  negative: 'error',
  warning: 'warning',
  neutral: 'neutral',
}

const VERDICT_COLORS: Record<string, string> = {
  excellent: 'bg-green-100 border-green-300 text-green-800',
  good: 'bg-blue-100 border-blue-300 text-blue-800',
  'needs-improvement': 'bg-yellow-100 border-yellow-300 text-yellow-800',
  critical: 'bg-red-100 border-red-300 text-red-800',
}

function VerdictBanner({ verdict }: { verdict: AnalysisVerdict }) {
  const colorClass = VERDICT_COLORS[verdict.level] || VERDICT_COLORS['good']
  return (
    <div className={`rounded-lg border p-3 ${colorClass}`}>
      <div className="text-sm font-bold">{verdict.label}</div>
      <div className="text-xs mt-1">{verdict.description}</div>
    </div>
  )
}

function ItemRow({ item }: { item: AnalysisItem }) {
  const icon = STATUS_ICON[item.status] || STATUS_ICON.neutral
  const variant = STATUS_VARIANT[item.status] || 'neutral'

  return (
    <div className="flex gap-2 py-1.5 border-b border-neutral-100 last:border-0">
      <span className="text-sm shrink-0 mt-0.5">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-neutral-800">{item.label}</span>
          <Badge variant={variant} size="sm">{item.status}</Badge>
        </div>
        <p className="text-[11px] text-neutral-600 mt-0.5">{item.description}</p>
        {item.recommendation && (
          <p className="text-[11px] text-indigo-600 mt-0.5 italic">
            Tip: {item.recommendation}
          </p>
        )}
      </div>
    </div>
  )
}

function SectionBlock({ section }: { section: AnalysisSection }) {
  const positiveCount = section.items.filter((i) => i.status === 'positive').length
  const totalCount = section.items.length
  const title = (
    <span>
      {section.title}{' '}
      <span className="text-neutral-400 font-normal">
        ({positiveCount}/{totalCount})
      </span>
    </span>
  )

  return (
    <Collapsible title={title} defaultOpen>
      <div className="space-y-0.5">
        {section.items.map((item, i) => (
          <ItemRow key={i} item={item} />
        ))}
      </div>
    </Collapsible>
  )
}

export function ResultView({ result, onReset }: ResultViewProps) {
  return (
    <div className="space-y-3">
      {/* Verdict banner */}
      {result.verdict && <VerdictBanner verdict={result.verdict} />}

      {/* Score breakdown */}
      {result.score && (
        <Card padding="sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-neutral-700">Score</span>
            <ScoreDisplay size="lg">{result.score.overall}/10</ScoreDisplay>
          </div>
          {result.score.categories.length > 0 && (
            <div className="space-y-1">
              {result.score.categories.map((cat, i) => (
                <div key={i} className="flex items-center justify-between text-[11px]">
                  <span className="text-neutral-600">{cat.name}</span>
                  <span className="font-medium text-neutral-800">{cat.score}/10</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Sections */}
      {result.sections.map((section, i) => (
        <Card key={i} padding="sm">
          <SectionBlock section={section} />
        </Card>
      ))}

      {/* Reset */}
      <Button variant="secondary" fullWidth onClick={onReset}>
        New analysis
      </Button>
    </div>
  )
}
