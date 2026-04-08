/**
 * FilterChip.tsx
 * ----------------------------------------------------------------
 * Toggleable chip for filters — shows label, optional count, and active state.
 *
 * Usage:
 * - <FilterChip label="Colors" count={47} active={true} onClick={toggle} />
 */

import { h } from 'preact'
import clsx from 'clsx'

export interface FilterChipProps {
  label: string
  count?: number
  active: boolean
  onClick: () => void
  className?: string
}

export function FilterChip({ label, count, active, onClick, className }: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-all cursor-pointer',
        active
          ? 'bg-neutral-800 text-white'
          : 'bg-neutral-100 text-neutral-400',
        className,
      )}
    >
      {active && (
        <svg className="w-3 h-3 opacity-70" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="2 6 5 9 10 3" />
        </svg>
      )}
      {label}
      {typeof count === 'number' && (
        <span className="font-bold">{count}</span>
      )}
    </button>
  )
}
