/**
 * components/DiffView.tsx
 * ---------------------------------------------------------------
 * Shows the diff between extracted and stored components.
 * Added items in green, removed in red, changed in yellow.
 */

import { h } from 'preact'
import { Card, Badge } from '@figma-forge/shared/ui'
import type { DiffResult, ExtractedComponent } from '../types'

interface DiffViewProps {
  diff: DiffResult
}

function DiffItem({
  item,
  variant,
}: {
  item: ExtractedComponent
  variant: 'success' | 'error' | 'warning'
}) {
  return (
    <div className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-neutral-50">
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-neutral-800 truncate">
          {item.name}
        </div>
        {item.description && (
          <div className="text-[10px] text-neutral-400 truncate">
            {item.description}
          </div>
        )}
      </div>
      <Badge variant={variant} size="sm">
        {item.key.slice(0, 8)}
      </Badge>
    </div>
  )
}

function DiffSection({
  title,
  items,
  variant,
  emptyText,
}: {
  title: string
  items: ExtractedComponent[]
  variant: 'success' | 'error' | 'warning'
  emptyText?: string
}) {
  if (items.length === 0 && !emptyText) return null

  return (
    <Card padding="sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-neutral-600">{title}</span>
        <Badge variant={variant} size="sm">
          {items.length}
        </Badge>
      </div>
      {items.length === 0 && emptyText && (
        <p className="text-[10px] text-neutral-400">{emptyText}</p>
      )}
      <div className="divide-y divide-neutral-100">
        {items.map((item) => (
          <DiffItem key={item.key} item={item} variant={variant} />
        ))}
      </div>
    </Card>
  )
}

export function DiffView({ diff }: DiffViewProps) {
  const hasChanges =
    diff.added.length > 0 ||
    diff.removed.length > 0 ||
    diff.changed.length > 0

  if (!hasChanges) {
    return (
      <Card padding="md">
        <p className="text-xs text-neutral-500 text-center">
          No differences found. Library is in sync.
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-2">
      <DiffSection
        title="Added"
        items={diff.added}
        variant="success"
      />
      <DiffSection
        title="Changed"
        items={diff.changed}
        variant="warning"
      />
      <DiffSection
        title="Removed"
        items={diff.removed}
        variant="error"
      />
      {diff.unchanged > 0 && (
        <p className="text-[10px] text-neutral-400 text-center">
          {diff.unchanged} component{diff.unchanged !== 1 ? 's' : ''} unchanged
        </p>
      )}
    </div>
  )
}
