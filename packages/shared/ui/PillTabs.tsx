/**
 * PillTabs.tsx
 * ----------------------------------------------------------------
 * Pill-style tab buttons for inline filtering.
 *
 * Unlike Tabs (underline navigation), PillTabs is used for inline
 * filter toggles (e.g. All / Pending / Resolved).
 *
 * Usage:
 * - <PillTabs tabs={[{id:'all',label:'All'},...]} activeId="all" onChange={setFilter} />
 */

import { h } from 'preact'
import clsx from 'clsx'

export interface PillTabDef {
  id: string
  label: string
}

export interface PillTabsProps {
  tabs: PillTabDef[]
  activeId: string
  onChange: (id: string) => void
  className?: string
}

export function PillTabs({ tabs, activeId, onChange, className }: PillTabsProps) {
  return (
    <div className={clsx('flex items-center gap-1', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={clsx(
            'rounded-full px-3 py-1 text-xs font-medium transition-colors cursor-pointer',
            tab.id === activeId
              ? 'bg-neutral-800 text-white'
              : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200',
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
